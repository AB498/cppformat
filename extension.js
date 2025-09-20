const vscode = require('vscode');
let fs = require("fs");
let path = require("path");
let wastyle = require("wastyle");

let extensionPath = path.join(__dirname, "..");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	(async () => {
		extensionPath = context.extensionPath;

		await wastyle.init(fs.readFileSync(`${extensionPath}/assets/astyle.wasm`));

		['cpp', 'c', 'h', 'hpp', 'cc', 'cxx'].forEach((lang) => {

			context.subscriptions.push(vscode.languages.registerDocumentFormattingEditProvider(lang, {
				provideDocumentFormattingEdits(document, options, token) {
					const text = document.getText();
					const cmd_args = vscode.workspace.getConfiguration('cppformat').get('formatargs', '') || 'pad-oper unpad-paren max-continuation-indent=120 style=google';
					const [success, formattedText] = wastyle.format(text, cmd_args);
					if (!success) {
						vscode.window.showInformationMessage("C/C++ Format: Error while trying to format.");
						return [];
					}

					return [
						vscode.TextEdit.replace(
							new vscode.Range(0, 0, document.lineCount, 0),
							formattedText
						)
					];
				}
			}));
		});

		context.subscriptions.push(vscode.commands.registerCommand('cppformat.helloWorld', function () {
			vscode.window.showInformationMessage('Hello World from cppformat!');
		}));

	})();

}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
