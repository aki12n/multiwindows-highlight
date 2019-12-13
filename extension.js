// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
var curDecorator;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	decorateSameWords();
	exports.activate = activate;
	// カーソル移動イベントを検知
	const disposable = vscode.window.onDidChangeTextEditorSelection(event => {
		if (event.textEditor.selection.isEmpty) {
			// 選択されていない場合は前回のデコレーションを削除
			deleteDecorator(curDecorator);
			return;
		}
		decorateSameWords(event.textEditor.selection);
	});
	context.subscriptions.push(disposable);
}


function deleteDecorator(deleteDecorator) {
	if (curDecorator != undefined) {
		deleteDecorator.decorator.dispose();
	}
}
function decorateSameWords(curSelection) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}
	// 既にあるデコレーションをクリア
	deleteDecorator(curDecorator);
	curDecorator = { // 変数にそのままcreateTextEditorDecorationTypeを入れてしまうとdispose()で変数自体が無効になってしまうため入れ子にする
		'decorator': vscode.window.createTextEditorDecorationType({
			'borderWidth': '1px',
			'borderStyle': 'solid',
			'light': {
				'backgroundColor': 'rgba(124,77, 255, 0.3)',
				'borderColor': 'rgba(124,77, 255, 0.4)',
				'color': 'rgba(255, 0, 0, 1.0)'
			},
			'dark': {
				'backgroundColor': 'rgba(255, 255, 204, 0.3)',
				'borderColor': 'rgba(255, 255, 204, 0.4)',
				'color': 'rgba(255, 255, 0, 1.0)'
			}
		})
	};

	//選択している文字列を取得
	var searchWord = editor.document.getText(curSelection);
	var otheEditors = vscode.window.visibleTextEditors;

	otheEditors.forEach((eachEditor) => {
		let ranges = new Array();
		for (var i = 0; i < eachEditor.document.lineCount; ++i) {
			for (var j = 0; j < eachEditor.document.lineAt(i).text.length; ++j){
				var curPosition = eachEditor.document.lineAt(i).text.indexOf(searchWord, j);
				if (~curPosition) {
					const startPosition = new vscode.Position(i, curPosition);
					const endPosition = new vscode.Position(i, curPosition + searchWord.length);
					const range = new vscode.Range(startPosition, endPosition);
					ranges.push(range);
					j += searchWord.length;
				}
			}
		}
		eachEditor.setDecorations(curDecorator.decorator, ranges);
	});
}

// this method is called when your extension is deactivated
function deactivate() {
}

module.exports = {
	activate,
	deactivate
}