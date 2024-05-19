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
	// Accessing settings
	const config = vscode.workspace.getConfiguration("pug-element-wrapping");
	const defaultElement = config.get("defaultElement");

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
			const shiftedIndentation = calculateIndentation(indentationLevel + 1);

			const lineElement = getLineElement(lineText);

			const elementToWrapIn = await vscode.window.showInputBox({
				prompt: "Enter the element",
				value: defaultElement,
			});

			if (!elementToWrapIn) return;

			function replaceSelection(editBuilder) {
				const prefix = "\n" + lineIndentation + elementToWrapIn + " ";
				const postfix = "\n" + lineIndentation + "| ";
				const replacementText = prefix + selectedText + postfix;

				editBuilder.replace(selection, replacementText);
			}

			function replaceLine(editBuilder) {
				const lineElementEndIndex = lineIndentation.length + lineElement.length;
				const untilLineElementEnd = lineText.slice(0, lineElementEndIndex);

				const fromLineElementEndToSelectionStart = lineText.slice(lineElementEndIndex, selection.start.character);
				const fromSelectionEndToLineEnd = lineText.slice(selection.end.character);

				const replacementText = `${untilLineElementEnd}\n${shiftedIndentation}|${fromLineElementEndToSelectionStart}\n${shiftedIndentation}${elementToWrapIn} ${selectedText}\n${shiftedIndentation}| ${fromSelectionEndToLineEnd}`;

				const lineSelection = new vscode.Selection(lineNumber, 0, lineNumber, lineText.length);

				editBuilder.replace(lineSelection, replacementText);
			}

			function setCursor(indentNext) {
				const modifier = indentNext ? 1 : 0;
				const newLineNumber = lineNumber + 1 + modifier;
				const newStartChar = calculateIndentation(indentationLevel + modifier).length + elementToWrapIn.length + 1;
				const newEndChar = newStartChar + selectedText.length;
				editor.selection = new vscode.Selection(newLineNumber, newStartChar, newLineNumber, newEndChar);
			}

			if (lineElement === "|") {
				editor.edit(replaceSelection);
				setCursor(false);
			} else {
				editor.edit(replaceLine);
				setCursor(true);
			}
		}
	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
};

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

/**
 * Function to get the first word from a string
 * @param {string} lineText
 * @returns {string}
 */
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
