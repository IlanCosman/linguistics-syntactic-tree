import * as vscode from "vscode";
import { CompletionItem, Position, Range, TextDocument } from "vscode";
import * as rules from "./rules.json";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      "lst",
      formattingEditProvider
    ),
    vscode.languages.registerCompletionItemProvider(
      "lst",
      completionItemProvider
    )
  );
}

const formattingEditProvider: vscode.DocumentFormattingEditProvider = {
  provideDocumentFormattingEdits: async (document, _, token) => {
    const edits = getFormatRangeEdits(document);
    return token.isCancellationRequested ? [] : (edits as vscode.TextEdit[]);
  },
};

const getFormatRangeEdits = (
  document: TextDocument
): ReadonlyArray<vscode.TextEdit> => {
  let result = "";
  let indent = 0;
  for (const char of document.getText()) {
    if (char === "[") {
      result += "\n" + " ".repeat(indent * 4);
      indent++;
    } else if (char === "]") {
      indent--;
    }
    result += char;
  }

  result = result
    .replace("\n", "") // Remove newline at the beginning
    .replace(/ \n/g, "\n") // Remove trailing spaces from each line
    .replace(/ *\]/g, "]") // Remove spaces from before any ]
    .replace(/\n\s*\n/g, "\n"); // Remove empty lines

  return [
    new vscode.TextEdit(
      new Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE),
      result
    ),
  ];
};

const completionItemProvider: vscode.CompletionItemProvider = {
  provideCompletionItems: async (document, position, token) => {
    const comps = getCompletions(document, position);
    return token.isCancellationRequested ? [] : (comps as CompletionItem[]);
  },
};

const getCompletions = (
  document: TextDocument,
  position: Position
): ReadonlyArray<CompletionItem> => {
  const textToPos = document.getText(new Range(new Position(0, 0), position));
  const blocks = [...textToPos.matchAll(/\[[\w\']*/g)];

  if (blocks.length === 0) {
    return [getCompletionFromRule(Object.entries(rules["Empty Page"])[0])];
  }

  const currentBlock = blocks[blocks.length - 1].toString().substring(1);
  switch (currentBlock) {
    case "CP":
    case "N'":
    case "NP":
    case "PP":
    case "S":
    case "VP":
      return Object.entries(rules[currentBlock]).map((rule) =>
        getCompletionFromRule(rule)
      );
    default:
      return [];
  }
};

function getCompletionFromRule(
  rule: [string, { body: string[] }]
): CompletionItem {
  const comp = new CompletionItem(rule[0], vscode.CompletionItemKind.Snippet);
  comp.insertText = new vscode.SnippetString(rule[1].body.join("\n"));
  return comp;
}
