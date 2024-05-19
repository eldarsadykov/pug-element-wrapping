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
			const tabSize = editor.options.tabSize;
			const insertSpaces = editor.options.insertSpaces;
			const indentChar = insertSpaces ? " " : "\t";
			const leadingCharsCount = countLeadingChars(lineText, indentChar);
			const charsPerLevel = insertSpaces ? tabSize : 1;
			const indentationLevel = leadingCharsCount / charsPerLevel;
			const lineIndentation = indentChar.repeat(indentationLevel * charsPerLevel);
			const lineElement = getLineElement(lineText);

			console.log("Line element: " + lineElement);

			const elementToWrapIn = await vscode.window.showInputBox({
				prompt: "Enter the element",
				value: `em`,
			});

			if (elementToWrapIn === undefined) {
				console.log("Input was canceled");
				return;
			} else if (elementToWrapIn.length === 0) {
				console.log("Input was empty");
				return;
			}

			function replaceSelection(editBuilder) {
				const prefix = "\n" + lineIndentation + elementToWrapIn + " ";
				const postfix = "\n" + lineIndentation + "| ";
				const replacementText = prefix + selectedText + postfix;

				editBuilder.replace(selection, replacementText);
			}

			function replaceLine(editBuilder) {
				const start = new vscode.Position(lineNumber, 4);
				const end = new vscode.Position(lineNumber, 8);
				const newSelection = new vscode.Selection(start, end);
				const text = editor.document.getText(newSelection);
				console.log(text);
				// lineIndentation + lineElement + "\n" + shiftedIndentation + "| "
				// const replacementText = "";
				// editBuilder.replace(lineSelection, replacementText);
			}

			if (lineElement === "|") {
				editor.edit(replaceSelection);
			} else {
				editor.edit(replaceLine);
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
function countLeadingChars(lineText, indentChar) {
	let count = 0;
	for (let i = 0; i < lineText.length; i++) {
		if (lineText[i] === indentChar) {
			count++;
		} else {
			break;
		}
	}
	return count;
}

// Function to get the first word from a string
function getLineElement(lineText) {
	let lineElement = "";
	let insideParentheses = false;
	for (let i = 0; i < lineText.length; i++) {
		if (lineText[i] === "(") insideParentheses = true;
		if (lineText[i] === ")") insideParentheses = false;

		const isWhiteSpace = lineText[i] === " " || lineText[i] === "\t";
		const elementStarted = lineElement.length > 0;

		if (isWhiteSpace && !insideParentheses) {
			if (elementStarted) break;
		} else {
			lineElement += lineText[i];
		}
	}
	return lineElement;
}
