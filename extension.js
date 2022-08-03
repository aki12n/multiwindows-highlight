// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
var curDecorator;
var onDidChangeVisibleTextEditorsFlg = false;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	decorateSameWords();
	const disposable1 = vscode.window.onDidChangeVisibleTextEditors(event => {
		onDidChangeVisibleTextEditorsFlg = true;
		deleteDecorator(curDecorator);
	});
	context.subscriptions.push(disposable1);
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
	// ユーザ設定読み込み、
	const userConf = vscode.workspace.getConfiguration('multiwindows-highlight');
	const editor = vscode.window.activeTextEditor;
	if ((!editor) || (!curSelection) || (onDidChangeVisibleTextEditorsFlg == true)) {
		onDidChangeVisibleTextEditorsFlg = false;
		return;
	}
	// 既にあるデコレーションをクリア
	deleteDecorator(curDecorator);
	curDecorator = { // 変数にそのままcreateTextEditorDecorationTypeを入れてしまうとdispose()で変数自体が無効になってしまうため入れ子にする
		'decorator': vscode.window.createTextEditorDecorationType({
			'borderWidth': '1px',
			'borderStyle': 'solid',
			'light': {
				'overviewRulerColor': userConf.get('lightBackgroundColor'),
				'backgroundColor': userConf.get('lightBackgroundColor'),
				'borderColor': userConf.get('lightBorderColor'),
				'color': userConf.get('lightColor')
			},
			'dark': {
				'overviewRulerColor': userConf.get('darkBackgroundColor'),
				'backgroundColor': userConf.get('darkBackgroundColor'),
				'borderColor': userConf.get('darkBorderColor'),
				'color': userConf.get('darkColor')
			}
		})
	};

	//選択している文字列を取得
	var searchWord = editor.document.getText(curSelection);
	var searchPattern = escapeRegex(searchWord);
	var searchOption = 'g';
	var otheEditors = vscode.window.visibleTextEditors;

	if (userConf.get("caseInsensitive")) {
		// 大文字小文字を区別しない
		searchOption += 'i';
	}
	if (userConf.get("matchWholeWord")) {
		// 全文字が一致するのみ
		searchPattern = '\\b' + searchPattern + '\\b';
	}
	const regex = RegExp(searchPattern, searchOption);

	otheEditors.forEach((eachEditor) => {
		let ranges = new Array();
		for (var i = 0; i < eachEditor.document.lineCount; ++i) {
			const targetText = eachEditor.document.lineAt(i).text;
			let result;
			while ((result = regex.exec(targetText)) != null) {
				const startPosition = new vscode.Position(i, result.index);
				const endPosition = new vscode.Position(i, result.index + searchWord.length);
				const range = new vscode.Range(startPosition, endPosition);
				ranges.push(range);
			}
		}
		eachEditor.setDecorations(curDecorator.decorator, ranges);
	});
}
function escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// this method is called when your extension is deactivated
function deactivate() {
}

module.exports = {
	activate,
	deactivate
}