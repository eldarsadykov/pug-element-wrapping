// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

//
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable = vscode.commands.registerCommand("pug-element-wrapping.wrapInPugElement", async function () {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const selection = editor.selection;
			const selectedText = editor.document.getText(selection);
			const lineNumber = selection.start.line;
			const line = editor.document.lineAt(lineNumber);
			const lineText = line.text;

			console.log(editor.options.tabSize);
			console.log(editor.options.insertSpaces);

			const tabSize = editor.options.tabSize;
			const insertSpaces = editor.options.insertSpaces;
			const indentChar = insertSpaces ? " " : "\t";

			const leadingCharsCount = countLeadingChars(lineText, indentChar);
			const charsPerLevel = insertSpaces ? tabSize : 1;
			const indentationLevel = leadingCharsCount / charsPerLevel;

			console.log(`Line: ${leadingCharsCount} ${insertSpaces ? "spaces" : "tabs"}, level: ${indentationLevel}`);
			const lineIndentation = indentChar.repeat(indentationLevel * charsPerLevel);
			const prefix = "\n" + lineIndentation;
			const postfix = "\n" + lineIndentation + "| ";

			const elementToWrapIn = await vscode.window.showInputBox({
				prompt: "Enter the element",
				value: `em`,
			});

			const replacementText = prefix + elementToWrapIn + " " + selectedText + postfix;

			if (elementToWrapIn !== undefined) {
				editor.edit((editBuilder) => {
					editBuilder.replace(selection, replacementText);
				});
			}
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate,
};

// Function to count leading characters in a string
function countLeadingChars(line, char) {
	let count = 0;
	for (let i = 0; i < line.length; i++) {
		if (line[i] === char) {
			count++;
		} else {
			break;
		}
	}
	return count;
}

// Function to get the first word from a string
function getFirstWord(line) {
	let firstWord = "";
	for (let i = 0; i < line.length; i++) {
		if (line[i] === " " || line[i] === "\t") {
			if (firstWord.length > 0) break;
		} else {
			firstWord += line[i];
		}
	}
	return firstWord;
}
