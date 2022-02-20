import * as vscode from "vscode";
import {
  CompletionItem,
  Position,
  Range,
  TextDocument,
  TextEdit,
} from "vscode";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      "lst",
      formattingEditProvider
    )
  );
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      "lst",
      completionItemProvider
    )
  );
}

const formattingEditProvider: vscode.DocumentFormattingEditProvider = {
  provideDocumentFormattingEdits: async (document, _, token) => {
    const edits = await getFormatRangeEdits(document);
    return token.isCancellationRequested ? [] : (edits as TextEdit[]);
  },
};

const getFormatRangeEdits = async (
  document: TextDocument
): Promise<ReadonlyArray<TextEdit>> => {
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

  result = result.replace("\n", ""); // Remove newline at the beginning
  result = result.replace(/ \n/g, "\n"); // Remove trailing spaces from each line
  result = result.replace(/ *\]/g, "]"); // Remove spaces from before any ]
  result = result.replace(/\n\s*\n/g, "\n"); // Remove empty lines

  return [
    new TextEdit(new Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE), result),
  ];
};

const completionItemProvider: vscode.CompletionItemProvider = {
  provideCompletionItems: async (
    document: vscode.TextDocument,
    position: Position,
    token: vscode.CancellationToken
  ): Promise<vscode.CompletionItem[]> => {
    const edits = await getCompletions(document, position);
    return token.isCancellationRequested ? [] : (edits as CompletionItem[]);
  },
};

const getCompletions = async (
  document: TextDocument,
  position: Position
): Promise<ReadonlyArray<CompletionItem>> => {
  const regex = /\[\w+/g;
  const textUntilPosition = document.getText(
    new Range(new Position(0, 0), position)
  );

  const matches = [...textUntilPosition.matchAll(regex)];
  const closestMatchBeforePosition = matches[matches.length - 1];

  return [new CompletionItem(closestMatchBeforePosition.toString())];
};
