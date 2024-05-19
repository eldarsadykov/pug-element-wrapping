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
			function calculateIndentation(indentationLevel) {
				return indentChar.repeat(indentationLevel * charsPerLevel);
			}
			const lineIndentation = calculateIndentation(indentationLevel);
			const lineElement = getLineElementInfo(lineText);
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

			function getSelectionFromIndices(startIndex, endIndex) {
				const start = new vscode.Position(lineNumber, startIndex);
				const end = new vscode.Position(lineNumber, endIndex);
				const newSelection = new vscode.Selection(start, end);
				return newSelection;
			}

			function getTextFromIndices(startIndex, endIndex) {
				const newSelection = getSelectionFromIndices(startIndex, endIndex);
				const text = editor.document.getText(newSelection);
				return text;
			}

			function replaceLine(editBuilder) {
				const lineElementEndIndex = lineIndentation.length + lineElement.length;
				const untilLineElementEnd = getTextFromIndices(0, lineElementEndIndex);
				const shiftedIndentation = calculateIndentation(indentationLevel + 1);
				const fromLineElementEndToSelectionStart = getTextFromIndices(lineElementEndIndex, selection.start.character);
				const fromSelectionEndToLineEnd = getTextFromIndices(selection.end.character, line.range.end.character);

				const replacementText = `${untilLineElementEnd}\n${shiftedIndentation}|${fromLineElementEndToSelectionStart}\n${shiftedIndentation}${elementToWrapIn} ${selectedText}\n${shiftedIndentation}| ${fromSelectionEndToLineEnd}`;

				const lineSelection = getSelectionFromIndices(0, replacementText.length);

				editBuilder.replace(lineSelection, replacementText);
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
function getLineElementInfo(lineText) {
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
