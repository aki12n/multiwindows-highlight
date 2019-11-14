// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	selectSameWords();
	exports.activate = activate;

	const disposable = vscode.window.onDidChangeTextEditorSelection(event => {
	  if (event.textEditor.selection.isEmpty) {
		  // カーソルを移動するとカーソルの位置で空の選択範囲が変化したイベントが発生する。空なら無視する。
		  return;
	  }
		
	  selectSameWords();
	  // const str = event.textEditor.document.getText(event.textEditor.selection);
	})
	context.subscriptions.push(disposable);
}


function selectSameWords() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}
	var decorationTheme = vscode.window.createTextEditorDecorationType({
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
	});

	//選択している文字列を取得
	var selectRenge = new vscode.Range(editor.selection.start, editor.selection.end);
	var search = editor.document.getText(selectRenge);
	console.log(search);
	var otheEditors = vscode.window.visibleTextEditors;

	otheEditors.forEach((eachEditor) => {
		
		
		let ranges = new Array();
		for (var i = 0; i < eachEditor.document.lineCount; ++i) {
			if (~eachEditor.document.lineAt(i).text.indexOf(search)) {
				console.log('atta!!! : ' + eachEditor.document.fileName + (i + 1));
				const startPosition = new vscode.Position(i, eachEditor.document.lineAt(i).text.indexOf(search));
				const endPosition = new vscode.Position(i, eachEditor.document.lineAt(i).text.indexOf(search) + search.length);
				const range = new vscode.Range(startPosition, endPosition);
				ranges.push(range);
			}
		}
		eachEditor.setDecorations(decorationTheme, ranges);
	});


}

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}