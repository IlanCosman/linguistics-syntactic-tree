// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Range, TextDocument, TextEdit } from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      "lst",
      formattingEditProvider
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
