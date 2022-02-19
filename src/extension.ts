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
  let result = document.getText();
  result = result.replace(/\[/g, "\n[");
  return [
    new TextEdit(new Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE), result),
  ];
};
