var confCommon = function() {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// confCommon.Initial()
// その他の設定値読み込みと初期設定
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
confCommon.Initial = function() {
  _log(1,'function','confCommon.Initial()');

}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// confCommon.appSuiteOpen()
// アプリケーションサイトをブラウザでオープン
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
confCommon.appSuiteOpen = function(obj) {
  _log(1,'function','appSuiteOpen()');

  var url = $(obj).text();
  window.open = cordova.InAppBrowser.open;
  window.open(url, '_system', 'location=yes');
}
