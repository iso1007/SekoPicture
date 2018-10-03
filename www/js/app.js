//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// グローバル変数定義
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// ログに出力するメッセージレベルを(0～9)で指定
var logMessageLevel = 0;
var errorlogMessageLevel = 5;
_log(0,'===========================Pocess Start=================================');

// グリッド表示・非表示
// 初期設定は別途設定
var viewGridBorder = false;
// セルフタイマーポップオーバーメニュー
var menuSelfTimer = null;
// セルフタイマーＩＤ
var SelfTimerId = null;
// フラッシュ設定ポップオーバーメニュー
var menuFlashMode = null;
// デバイスの向き() 縦向き:'portrait' 横向き:'landscape'
var devaiceOrientation = '';

// 加速度センサー監視ID
var watchAccelerationID = null;
var accelerationSave_x,accelerationSave_y = 0;

// 撮影プレビュー表示タイマーID
var takePicturePreviewID = null;

// 黒板の表示・非表示フラグ
var kokubanShowFlag = true;

// 2018/02/07 ADD ----- ↓
// 現在位置(GPS)
var presentLocation = {lat : 0, lng : 0, alt : 0, tim : 0};
// 2018/02/07 ADD ----- ↑

// 同期処理のループを途中で中断する場合に使用するフラグ
var loopBreakFlag = false;

var app = function() {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// ons.ready()
// OnsenUIのreadyで実行
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
ons.ready(function() {
  _log(1,'function','ons.ready()');

  // 端末標準のステータスバーを非表示にする
  StatusBar.hide();

  // 起動時の背景色
  $('html').css('background-color','#524e4d');

  $('#setNavigator').css('visibility','visible');
  $('#setNavigator').hide();

  $('#topNavigator').css('visibility','visible');
  $('#topNavigator').hide();

  $('#lstNavigator').css('visibility','visible');
  $('#lstNavigator').hide();

  $('#chkNavigator').css('visibility','visible');
  $('#chkNavigator').hide();

  // Firebaseの初期化
  try {
    firebaseAuth.initialize(function() {
      // ログイン画面の表示
      try {
        firebaseAuth.loginDialogShow();
      } catch(e) {alert(e);}
   },
    function(e) {
      // オフライン時に実行する処理
      app.afterLoginInitialize1();
    });
  } catch(e) {alert(e);}
});

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.afterLoginInitialize1()
// ログイン完了後の初期処理
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.afterLoginInitialize1 = function() {
  _log(1,'function','app.afterLoginInitialize1()');

  // オフライン時は実行しない
  if(activeuser.uid !== '') {
    // FirebaseDatabaseからローカルストレージに書き込み
    setFirebaseToLocalStrage();
  }

  // 黒板の日付を初期化
  try{
    kokuban.setDataInitialize();
  } catch(e) {alert(e);}

  // 起動時のスプラッシュ画面
  $('#splashModal').show();
  // 3秒後に初期処理2を実行し、スプラッシュ画面を消す
  app.afterLoginInitialize2();
  setTimeout(function() {
    $('#splashModal').hide();
  }, 1500);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.afterLoginInitialize2
// ログイン完了後の初期処理2
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.afterLoginInitialize2 = function() {
  _log(1,'function','app.afterLoginInitialize2()');
  // カメラ画面の要素表示
  try{
    app.setElementPosition();
  } catch(e) {alert(e);}

  // 画面の向きを検出
  orientWatch('start');

  // セルフタイマーポップオーバーメニューの定義
  ons.createPopover('selftimer.html').then(function(popover) {
    menuSelfTimer = popover;
  });

  // フラッシュ選択メニューの定義
  ons.createPopover('flashMode.html').then(function(popover) {
    menuFlashMode = popover;
  });

  // カメラプレビュー画面位置の定義とビューの開始
  app.setPictureResize();

  // 黒板移動イベントの定義
  try{
    kokuban.touchmove();
  } catch(e) {alert(e);}

  // 黒板の初期表示
  try{
    kokuban.makeframe();
  } catch(e) {alert(e);}

  // ズームアップ・ダウンイベントの定義
  try{
    app.pictureZoom();
  } catch(e) {alert(e);}

  $('#camera').css('visibility','visible');
  $('#preview').hide();
  $('#previewMessage').hide();
  $('#pic-edit').hide();

  // 背景を透過にする
  $('html').css('background-color','transparent');
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.setSelfTimerClick()
// セルフタイマーのポップオーバーメニューを表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.setSelfTimerClick = function() {
  _log(1,'function','app.setSelfTimerClick()');

// セルフタイマーが動作中の場合は中止する
  if(SelfTimerId !== null) {
    $('#selfTimerMessage').hide();
    clearInterval(SelfTimerId);
  }

  menuSelfTimer.show(event);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.setSelfTimer()
// セルフタイマーの時間セットとアイコン表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.setSelfTimer = function(waiteTime) {
  _log(1,'function','app.setSelfTimer('+waiteTime+')');

  // セルフタイマーの時間をバッジで表示、同時にアイコンサイズを小さくする
  // タイマーをオフにした場合はバッジを消してアイコンサイズを元に戻す
  if(waiteTime==='0') {
    $('#selfTimerTime').text('');
      $('#iconSelfTimer').removeClass('iconsize3').addClass('iconsize5');
  }else{
    $('#selfTimerTime').text(waiteTime);
    $('#iconSelfTimer').removeClass('iconsize5').addClass('iconsize3');
  }

  // ポップオーバーメニューを消去
  menuSelfTimer.hide();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.setFlashModeClick()
// フラッシュモードの切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.setFlashModeClick = function() {
  _log(1,'function','app.setFlashModeClick()');

  menuFlashMode.show(event);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.setSelfTimer()
// セルフタイマーの時間セットとアイコン表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.setFlashMode = function(flashMode) {
  _log(1,'function','app.setFlashMode('+flashMode+')');

  // フラッシュモードがoff以外の場合はバッジで表示、同時にアイコンサイズを小さくする
  // フラッシュモードをoffにした場合はバッジを消してアイコンサイズを元に戻す
  if(flashMode==='off') {
    $('#setFlashMode ons-icon').attr('icon','ion-flash-off');
  }else{
    $('#setFlashMode ons-icon').attr('icon','ion-flash');
  }
  if(flashMode==='auto') {
    $('#setFlashType').show();
    $('#setFlashType').text('A');
    CameraPreview.setFlashMode('auto');
  }else{
    $('#setFlashType').hide();
    $('#setFlashType').text(flashMode);
    CameraPreview.setFlashMode(flashMode);
  }

  // ポップオーバーメニューを消去
  menuFlashMode.hide();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.setGridBroderClick()
// 撮影ガイド用グリッドの表示・非表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.setGridBroderClick = function() {
  _log(1,'function','app.setGridBroderClick()');

  if(viewGridBorder) {
    $('#grid-border').hide();
    viewGridBorder = false;

    // 非表示状態をローカルストレージに保存
    pictureItemSet('grid', false);

  }else{
    $('#grid-border').show();
    viewGridBorder = true;

    // 表示状態をローカルストレージに保存
    pictureItemSet('grid', true);
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.switchCameraClick()
// フロントカメラとリアカメラの切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.switchCameraClick = function() {
  _log(1,'function','app.switchCameraClick()');

  // セルフタイマーが動作中の場合は中止する
  if(SelfTimerId !== null) {
    $('#selfTimerMessage').hide();
    clearInterval(SelfTimerId);
  }

  CameraPreview.switchCamera();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.controlPanelClick()
// カメラ画面から各種設定画面への切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.controlPanelClick = function() {
  _log(1,'function','app.controlPanelClick()');

  // セルフタイマーが動作中の場合は中止する
  if(SelfTimerId !== null) {
    $('#selfTimerMessage').hide();
    clearInterval(SelfTimerId);
  }

  // カメラ画面の非表示
  $('#camera').hide();
  // ステータスバーの表示
  StatusBar.show();

  // 設定メニュー画面の表示
  $('#setNavigator').show();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.koujiListDisplayClick()
// 工事写真一覧画面へ切替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.koujiListDisplayClick = function() {
  _log(1,'function','app.koujiListDisplayClick()');

  // セルフタイマーが動作中の場合は中止する
  if(SelfTimerId !== null) {
    $('#selfTimerMessage').hide();
    clearInterval(SelfTimerId);
  }

  // カメラ画面の非表示
  $('#camera').hide();
  // ステータスバーの表示
  StatusBar.show();

  // 既存写真の黒板編集操作を行った場合
  if($('#pic-edit').attr('name') !== '') {
    // 編集元写真を非表示
    $('#pic-edit').hide();
    // 工事写真の詳細表示ウィンドウを閉じる
    koujiPictureViewClose();
    // 設定メニュー画面の表示
    $('#lstNavigator').show();
  }else{
    // 通常の撮影時、設定メニュー画面の表示
    $('#lstNavigator').show();
    koujiListDisplay();
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.pictureCheckButtonClick()
// 撮影項目リスト画面へ切替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.pictureCheckButtonClick = function() {
  _log(1,'function','app.pictureCheckButtonClick()');

  // セルフタイマーが動作中の場合は中止する
  if(SelfTimerId !== null) {
    $('#selfTimerMessage').hide();
    clearInterval(SelfTimerId);
  }

  // ローカルストレージから黒板の内容を読み込み
  var str = localStrage.getItems('firebase:temp/kokuban');
  // 読み込んだテキストをJSON形式に変換
  var k = JSON.parse(str);
  if(k.directory === undefined) {k.directory = '';}

  // 工事名が未入力の場合はエラーメッセージを表示して戻る
//  if(k.kouji === '') {
  if(k.directory === '') {
      // 警告メッセージ表示
    _alert('黒板に工事名が設定されていないため、<br>この画面を開くことはできません。');
  }else{
    // カメラ画面の非表示
    $('#camera').hide();
    // ステータスバーの表示
    StatusBar.show();

    // 撮影項目の設定
    // チェックリストhtmlが存在し工事名称に変更がない場合は、チェックツリーの開閉状態を復元
    if($("#pictureCheckKoujimei")[0] && k.directory === $("#pictureCheckKoujimei").text()){
    }else{
      // 前回のツリー開閉状態をクリア
      saveTreeStyle = [];
    }
    // チェックリストを作成
    pictureCheckList.getCheckListName(k.directory);

    // 撮影項目画面の表示
    $('#chkNavigator').show();
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.pictureZoom()
// ピンチイン・アウトでズームイン・アウト
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.pictureZoom = function() {
  _log(1,'function','app.pictureZoom()');

  // ズームインイベントを定義
  $('#pic-box-border').on('pinchin', function(event) {
    CameraPreview.getZoom(function(currentZoom) {
      CameraPreview.setZoom(currentZoom-0.5);
    });
  });

  // ズームアウトイベントを定義
  $('#pic-box-border').on('pinchout', function(event) {
    CameraPreview.getZoom(function(currentZoom) {
      CameraPreview.setZoom(currentZoom+0.05);
    });
  });

  // 露出アップ テスト
//  $('#pic-box-border').on('click', function(event) {
//    console.log('#pic-box-border.on.click');
//    CameraPreview.getExposureCompensation(function(expoxureCompensation){
//    console.log('#pic-box-border.on.click'+expoxureCompensation);
//      var cmp = expoxureCompensation + 0.5;
//      CameraPreview.setExposureCompensation(cmp);
//    });
//  });

  // カメラ画像をタッチした時のイベントを定義
//$('#pic-box-border').on('touch', function(event) {
//  CameraPreview.setFocusMode('continuous');
//  CameraPreview.getExposureMode(function(exposureMode){
//    if(exposureMode==='lock') {
//      CameraPreview.setExposureMode('continuous');
//    }else{
//      CameraPreview.setExposureMode('lock');
//    }
//  });
//  CameraPreview.getFocusMode(function(currentFocusMode){
//    console.log(currentFocusMode);
//  });
//  CameraPreview.getExposureMode(function(exposureMode){
//    console.log(exposureMode);
//  });
//});
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.cameraTakeButtonClick()
// カメラ撮影ボタン
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.cameraTakeButtonClick = function() {
  _log(1,'function','app.cameraTakeButtonClick()');

  SelfTimerId = null;
  var waitTime = 0;
  var str = $('#selfTimerTime').text();
  // セルフタイマーの時間を取得
  if(Number(str)>0 && Number(str)<99) {
    waitTime = Number(str);
  }

  // タイマーがオフの場合は即撮影
  if(waitTime===0){
    // 写真撮影
    app.cameraTakePicture();
  }else{
    $('#selfTimerMessage').show();
    $('#selfTimerCounter').text('');

    var transform = getTransformParam($('#kokuban').css('transform'));
    var trns = 'rotate('+transform.rotate+')';
    $('#selfTimerCounter').css({'transform' : trns});

    // タイマー開始
    SelfTimerId = setInterval(timerEvent, 1000);
  }

  // タイマーが設定されている場合は１秒毎にカウントダウン表示
  function timerEvent() {
    $('#selfTimerCounter').text(waitTime);
    waitTime--;

    if(waitTime == -1 && SelfTimerId !== null) {
      // ターマーIDのクリア
      clearInterval(SelfTimerId);
      // 写真撮影
      app.cameraTakePicture();
      $('#selfTimerMessage').hide();
    }
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.kokubanClick()
// カメラ画面から黒板項目入力画面への切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.kokubanClick = function() {
  _log(1,'function','app.kokubanClick()');

// セルフタイマーが動作中の場合は中止する
  if(SelfTimerId !== null) {
    $('#selfTimerMessage').hide();
    clearInterval(SelfTimerId);
  }

  // カメラ画面の非表示
  $('#camera').hide();
  // ステータスバーの表示
  StatusBar.show();

  $('#topNavigator').show();
  // 黒板項目の検索情報読み込みとイベントセット
  setKokuban.setItemInitialize();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.cameraButtonClick()
// 各種設定画面からカメラ撮影画面への切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.cameraButtonClick = function() {
  _log(1,'function','app.cameraButtonClick()');

  // 設定メニューを初期メニューに戻す
  setNavigator.resetToPage('confMenu.html');

  // カメラ画面の表示
  $('#camera').show();
  // ステータスバーの非表示
  StatusBar.hide();

  // 黒板イメージの再生成
  kokuban.makeframe();

  // 設定メニュー画面の非表示
  $('#setNavigator').hide();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.setElementPosition()
// 撮影画面の要素位置を定義
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.setElementPosition = function() {
  _log(1,'function','app.setElementPosition()');

  // 画面の解像度を取得
  var MaxWidth  = window.innerWidth;
  var MaxHeight = window.innerHeight;
  // 写真エリアの左右のボーダー幅
  var picBoxBorderLeftRight = 5;
  // 写真エリアの上下のボーダー幅
  var picBoxBorderTopBottom = 5;

  // 写真エリアの幅(window幅から枠幅を引いた寸法)
  var PicWidth  = MaxWidth - picBoxBorderLeftRight * 2;
  // 写真エリアの高さ(幅の3/4の寸法)
  var PicHeight = PicWidth / 3 * 4;

  // 写真エリアの上下のボーダー幅を画面サイズから再計算
  picBoxBorderTopBottom = Math.round((MaxHeight - PicHeight) / 2);
  PicHeight = MaxHeight - picBoxBorderTopBottom * 2;

  // 最小ボタン高さを計算(最小を60pxとする)
  var BtnHeight = 60;   // 機能ボタンの高さの初期値
  var BtnSideGap = 15;  // 機能ボタンの上下マージンの初期値
  // 写真エリアの上下ボーダー幅が、ボタン高さ+上下マージンよりも広い場合はボタン高さを計算
  if(picBoxBorderTopBottom > (BtnHeight + BtnSideGap * 2)) {
    BtnHeight = picBoxBorderTopBottom - BtnSideGap * 2;
    // ボタンの高さが100pxを超えた場合は上下マージンを再計算
    if(BtnHeight > 100) {
      BtnHeight = 100;
      BtnSideGap = (picBoxBorderTopBottom - BtnHeight) / 2;
    }
  }

  // 機能ボタンの位置設定"
  for(var i=1; i<=5; i++) {
    var btnName = '';
    switch (i) {
      case 1 :
        btnName = 'ons-button#setSelfTimer';
        break;
      case 2 :
        btnName = 'ons-button#setFlashMode';
        break;
      case 3 :
        btnName = 'ons-button#setGridBroder';
        break;
      case 4 :
        btnName = 'ons-button#switchCamera';
        break;
      case 5 :
        btnName = 'ons-button#controlPanel';
        break;
    }

    var pty = i - 1;
    var ltx = 5 - i;

    $(btnName).css({
      opacity  : 0.8,
      padding  : Math.round((BtnHeight-35)/2-2)+'px',  // 35はアイコンサイズ
      position : 'absolute',
      top      : BtnSideGap,
      left     : ((MaxWidth - picBoxBorderLeftRight) / 5) * pty + picBoxBorderLeftRight,
      height   : BtnHeight,
      width    : (MaxWidth - picBoxBorderLeftRight) / 5 - picBoxBorderLeftRight
    });
  }

  // 工事写真一覧ボタンの位置設定
  $('ons-button#koujiListDisplay').css({
    opacity  : 0.8,
    position : 'absolute',
    padding  : Math.round((BtnHeight-30)/2-2)+'px',  // 30はアイコンサイズ
    top      : MaxHeight - BtnHeight - BtnSideGap,
    left     : picBoxBorderLeftRight,
    height   : BtnHeight,
    width    : (MaxWidth - picBoxBorderLeftRight) / 5 - picBoxBorderLeftRight
  });

  // 撮影ボタンの位置設定
  $('ons-button#cameraTakeButton').css({
    opacity  : 0.8,
    position : 'absolute',
    padding  : Math.round((BtnHeight-30)/2-2)+'px',  // 30はアイコンサイズ
    top      : MaxHeight - BtnHeight - BtnSideGap,
    left     : ((MaxWidth - picBoxBorderLeftRight) / 5) * 1 + picBoxBorderLeftRight,
    height   : BtnHeight,
    width    : ((MaxWidth - picBoxBorderLeftRight) / 5) * 3 - picBoxBorderLeftRight
  });

  // 撮影リストボタンの位置設定
  $('ons-button#pictureCheckButton').css({
    opacity  : 0.8,
    position : 'absolute',
    padding  : Math.round((BtnHeight-30)/2-2)+'px',  // 30はアイコンサイズ
    top      : MaxHeight - BtnHeight - BtnSideGap,
    left     : ((MaxWidth - picBoxBorderLeftRight) / 5) * 4 + picBoxBorderLeftRight,
    height   : BtnHeight,
    width    : (MaxWidth - picBoxBorderLeftRight) / 5 - picBoxBorderLeftRight
  });

  // セルフタイマーが設定されている場合は、アイコンサイズを小さくする
  if($('#selfTimerTime').text()==='') {
    $('#iconSelfTimer').removeClass('iconsize3').addClass('iconsize5');
  }else{
    $('#iconSelfTimer').removeClass('iconsize5').addClass('iconsize3');
  }

  // 起動時のフラッシュモードを'auto'にする
  $('#setFlashType').text('A');
  CameraPreview.setFlashMode('auto');

  $('#pic-box-border').css({
    position : 'absolute',
    top      : 0,
    left     : 0,
    height   : PicHeight,
    width    : PicWidth,
    'border-top-width'    : picBoxBorderTopBottom+'px',
    'border-bottom-width' : picBoxBorderTopBottom+'px',
    'border-left-width'   : picBoxBorderLeftRight+'px',
    'border-right-width'  : picBoxBorderLeftRight+'px'
  });

  // 縦グリッド１を表示
  $('#vertical-grid-border1').css({
    position : 'absolute',
    top    : $('#pic-box').offset().top,
    left   : $('#pic-box').width() / 3 + $('#pic-box').offset().left,
    height : $('#pic-box').height(),
    width  : 0
  });

  // 縦グリッド２を表示
  $('#vertical-grid-border2').css({
    position : 'absolute',
    top    : $('#pic-box').offset().top,
    left   : $('#pic-box').width() / 3 * 2 + $('#pic-box').offset().left,
    height : $('#pic-box').height(),
    width  : 0
  });

  // 横グリッド１を表示
  $('#horizon-grid-border1').css({
    position : 'absolute',
    top    : $('#pic-box').height() / 3 + $('#pic-box').offset().top,
    left   : $('#pic-box').offset().left,
    height : 0,
    width  : $('#pic-box').width()
  });

  // 横グリッド２を表示
  $('#horizon-grid-border2').css({
    position : 'absolute',
    top    : $('#pic-box').height() / 3 * 2 + $('#pic-box').offset().top,
    left   : $('#pic-box').offset().left,
    height : 0,
    width  : $('#pic-box').width()
  });

  // 縦横グリッドの初期表示
  if(pictureItemGet('grid')===true) {
    viewGridBorder = true;
    $('#grid-border').show();
  }else{
    viewGridBorder = false;
    $('#grid-border').hide();
  }

  // 黒板の位置設定
  // 前回の位置を記憶して、再起動時にはその位置に表示する
  // フォルダ名として工事名称を取得する
  var x = $('#pic-box').offset().left;
  var y = $('#pic-box').offset().top;
  $('#kokuban').css({'transform': 'translate(' + x + 'px, ' + y + 'px)'});
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.setOrientationChange(acceleration)
// デバイスの向きが変わったら黒板とボタンアイコンの向きを変える
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.setOrientationChange = function(acceleration) {
  // 大量にログが出力されるのでコメントアウト
  _log(1,'function','app.setOrientationChange()');
  // 写真の向き設定を取得
  // ==================================================
  // ==================================================
  // グローバル変数に変える??
  // ==================================================
  // ==================================================
  var direction = pictureItemGet('direction');

  // 縦・横固定の場合は画面の向き検出イベントを停止する
  if(direction !== 'device') {
    orientWatch('stop');
  }
  var accel_x = 0.0;
  var accel_y = 0.0;
  if(direction === 'portrait') {
    accel_x = 0.0;
    accel_y = 9.8;
  }else{
    if(direction === 'landscape') {
      accel_x = 9.8;
      accel_y = 0.0;
    }else{
      // デバイスの向きに従う設定の場合
      accel_x = Math.abs(acceleration.x);
      accel_y = Math.abs(acceleration.y);
    }
  }

  // デバイスの向きが変わったかをチェック 縦向き:'portrait' 横向き:'landscape'
  var nowOrientation = '';
  if(accel_x > accel_y) {
    nowOrientation = 'landscape'; // 現在は横向き
  }else{
    nowOrientation = 'portrait';  // 現在は縦向き
  }

  if($('#pic-box').is(':hidden')) {
    // 写真画面が非表示の場合は回転を無効にする
    nowOrientation = devaiceOrientation;
  }

  // デバイスの向きが変わった
  if(nowOrientation !== devaiceOrientation) {

    var x = 0;
    var y = 0;

    // 黒板の位置設定
    if(devaiceOrientation === 'portrait') {
      x = $('#kokuban').offset().left;
      y = $('#kokuban').offset().top;
    }
    if(devaiceOrientation === 'landscape') {
      // 横向きから縦向きに変わる場合は調整
      x = $('#kokuban').offset().left - ($('#kokuban').width() / 2) + ($('#kokuban').height() / 2);
      y = $('#kokuban').offset().top  - ($('#kokuban').height() / 2) + ($('#kokuban').width() / 2);
    }

    // デバイスが横向きになった場合は、黒板の縦横の差分だけ補正する為
    var TopHosei = 0;
    var LeftHosei = 0;
    if(nowOrientation==='landscape'){
      TopHosei = ($('#kokuban').height() / 2) - ($('#kokuban').width() / 2);
      LeftHosei = ($('#kokuban').width() / 2) - ($('#kokuban').height() / 2);
    }

    // 黒板がプレビューウィンドウ外に出ないように補正
    // 最上
    if(x < $('#pic-box').offset().left - LeftHosei) {
      x = $('#pic-box').offset().left - LeftHosei;
    }
    // 最左
    if(y < $('#pic-box').offset().top - TopHosei) {
      y = $('#pic-box').offset().top - TopHosei;
    }
    // 最下
    if(x > $('#pic-box').offset().left+$('#pic-box').width()-$('#kokuban').width() + LeftHosei) {
      x = $('#pic-box').offset().left+$('#pic-box').width()-$('#kokuban').width() + LeftHosei;
    }
    // 最右
    if(y > $('#pic-box').offset().top+$('#pic-box').height()-$('#kokuban').height() + TopHosei) {
      y = $('#pic-box').offset().top+$('#pic-box').height()-$('#kokuban').height() + TopHosei;
    }

    var rot = "0deg";
    // デバイスが横向きになった場合
    if(accel_x > accel_y) {
//    if(acceleration.x>=0) {
        rot = "+90deg";  // 左回転
//    }else{
//      rot = "-90deg";  // 右回転
//    }
    }

    // 黒板の回転
    $('#kokuban').css({'transform': 'translate(' + x + 'px, ' + y + 'px) rotate(' + rot + ')'});
    // ボタンアイコンの向きを変える
    if(nowOrientation==='portrait') {
      $('#tool-button1 ons-icon').attr({'rotate':'0'});
      $('#tool-button2 ons-icon').attr({'rotate':'0'});
    }
    if(nowOrientation==='landscape') {
      $('#tool-button1 ons-icon').attr({'rotate':'90'});
      $('#tool-button2 ons-icon').attr({'rotate':'90'});
    }
    // セルフタイマーが設定されている場合は、アイコンサイズを小さくする
    if($('#selfTimerTime').text()!=='') {
      $('#iconSelfTimer').removeClass('iconsize5').addClass('iconsize3');
    }

    devaiceOrientation = nowOrientation;
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.startCamera()
// カメラプレビュー表示の定義
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.startCamera = function(x, y, width, height, toBK) {
  _log(1,'function','app.startCamera()');

  var param = {
    x: x,                // 仮位置
    y: y,                // 仮位置
    width: width,        // 仮幅
    height: height,      // 仮高さ
    camera: "back",      // 背面カメラ
    tapPhoto: false,     //
    tapFocus: false,     //
    previewDrag: false,  // 撮影イメージのドラッグ移動を不可　　
    toBack: toBK         // カメラ画像をHTMLの背面:false、前面:true　
  };
  CameraPreview.startCamera(param);

  // 露出をリセットする
//  CameraPreview.setExposureCompensation(0);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.setPictureResize()
// カメラプレビュー表示のサイズ・位置の設定
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.setPictureResize = function() {
  _log(1,'function','app.setPictureResize()');

  // 写真撮影エリアの定義
  var param = {
    x: $('#pic-box').offset().left,
    y: $('#pic-box').offset().top,
    width: $('#pic-box').width(),
    height: $('#pic-box').height()
  };
  // カメラプレビュー表示
  app.startCamera(param.x, param.y, param.width, param.height, true);

  // 撮影後のプレビュー表示エリアの定義
  $('#preview').css({
    position : 'absolute',
    left     : $('#pic-box').offset().left,
    top      : $('#pic-box').offset().top,
    width    : $('#pic-box').width(),
    height   : $('#pic-box').height()
  });
  $('#previewMessage').css({
    position : 'absolute',
    left     : $('#pic-box').offset().left,
    top      : $('#pic-box').offset().top,
    width    : $('#pic-box').width(),
    height   : $('#pic-box').height()
  });
  $('#previewMessage').hide();
  $('#selfTimerMessage').css({
    position : 'absolute',
    left     : $('#pic-box').offset().left,
    top      : $('#pic-box').offset().top,
    width    : $('#pic-box').width(),
    height   : $('#pic-box').height()
  });
  $('#selfTimerMessage').hide();

  // 撮影済み写真の黒板編集用表示エリアの定義
  $('#pic-edit').css({
    position : 'absolute',
    left     : param.x,
    top      : param.y,
    width    : param.width,
    height   : param.height
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.cameraTakePicture()
// カメラ撮影
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.cameraTakePicture = function() {
  _log(1,'function','app.cameraTakePicture()');

  // 保存が完了するまでシャッターボタンを無効にする
  $('#cameraTakeButton').attr('disabled', true);
  $('#cameraTakeButton').addClass('disabled');

  var str = '';
  var k = '';
  // 黒板設定情報の読み込み
  str = localStrage.getItems('firebase:group00/config/kokuban');
  // 読み込んだテキストをJSON形式に変換
  k = JSON.parse(str);
  // 黒板サイズから倍率を取得
  var kokubanSizeBairitu = 0.4;
  str = k.size;
  if(str===undefined) {str = 'medium';}
  kokubanSizeBairitu = getKokubanSizeBairitu(str);

  // 写真設定情報の読み込み
  str = localStrage.getItems('firebase:group00/config/picture');
  // 読み込んだテキストをJSON形式に変換
  k = JSON.parse(str);

  // 2018/02/07 ADD ----- ↓
  // 位置情報を付加する設定がされている場合は、GPSから位置情報を取得する
  str = k.locationInformation;
  presentLocation = {lat : 0, lng : 0, alt : 0, tim : 0};
  if(str===undefined) {str = 'off';}
  if(str === 'on') {
    _getLocation();
  }
  // 2018/02/07 ADD ----- ↑

  // 写真サイズ指定
  str = k.size;
  if(str===undefined) {str = 'medium';}
  var takeOption = {width:768, height:1024, quality: 100};
  takeOption = getPictureSize(str);

  // 写真の圧縮率
  str = k.compressionRatio;
  if(str===undefined) {str = 'normal';}
  takeOption.quality = getPictureQuality(str);

  // フォルダ名として工事名称を取得する
  str = localStrage.getItems('firebase:temp/kokuban');
  // 読み込んだテキストをJSON形式に変換
  k = JSON.parse(str);
  // 工事名称が取得できない場合の初期フォルダ
  str = k.directory;
  if(str===undefined) {str = 'その他';}
  directory = str;
  // 黒板の場所を保存
  k.top  = $('#kokuban').offset().top;
  k.left = $('#kokuban').offset().left;
  // 写真エリアの黒板位置を保存
  k.kokubanX = (takeOption.width / $('#pic-box').width()) * ($('#kokuban').offset().top - $('#pic-box').offset().top);
  k.kokubanY = (takeOption.width / $('#pic-box').width()) * ($('#kokuban').offset().left - $('#pic-box').offset().left);
  // JSON形式をテキスト形式に変換
  str = JSON.stringify(k);
  // ローカルストレージに書き戻し
  localStrage.setItems('firebase:temp/kokuban', str);

  // 撮影
  CameraPreview.takePicture(takeOption, function(base64PictureData){
    imageSrcData = 'data:image/png;base64,' + base64PictureData;

    // 出力写真・黒板合成用canvasの作成
    var out_cvs = document.createElement('canvas');
    var out_ctx = out_cvs.getContext('2d');
    out_cvs.width  = takeOption.width;
    out_cvs.height = takeOption.height;

    // 写真イメージを出力用canvasに描画
    var pic_img = new Image();
    // 既存写真の黒板編集操作を行った場合は写真イメージに編集元の写真を表示する
    if($('#pic-edit').attr('name') !== '') {
      pic_img.src = $('#pic-edit').attr('src');
    }else{
      // 通常の撮影時はCameraPreviewで取得したイメージを表示
      pic_img.src = imageSrcData;
    }
    pic_img.onload = function() {

      out_ctx.drawImage(pic_img, 0, 0, out_cvs.width, out_cvs.height);

      // 黒板canvasからイメージを作成
      var kokuban_img = new Image();
      var kokuban_cvs = document.getElementById('kokuban');
      var kokuban_ctx = kokuban_cvs.getContext("2d");
      kokuban_img.src = kokuban_ctx.canvas.toDataURL();
      kokuban_img.onload = function() {

        // 黒板イメージのサイズを設定
        var imgWidth  = Number(kokuban_cvs.style.width.replace( 'px' , '' ));
        var imgHeight = Number(kokuban_cvs.style.height.replace( 'px' , '' ));
        // 画面幅と写真解像度との比率を求めて、カンバスサイズに掛ける
        var winSizeBairitu = takeOption.width / $('#pic-box-border').width();
        imgWidth  = imgWidth  * winSizeBairitu;
        imgHeight = imgHeight * winSizeBairitu;
        var imgTop  = (takeOption.width / $('#pic-box').width()) * ($('#kokuban').offset().top - $('#pic-box').offset().top);
        var imgLeft = (takeOption.width / $('#pic-box').width()) * ($('#kokuban').offset().left - $('#pic-box').offset().left);

        // 黒板イメージを出力用canvasに出力
        // 現在の向き(rotate)を取得
        var transform = getTransformParam($('#kokuban').css('transform'));
        var rot = 0;

        // 黒板の背景画像を切り取る(幅と高さは余幅として+2する)
        var clp_left = imgLeft, clp_top = imgTop;
        var clp_height = imgHeight+2, clp_width = imgWidth+2;
        if(transform.rotate !== '0deg') {
          clp_height = imgWidth+2, clp_width = imgHeight+2;
        }
        var clp_img = getClippingImage(out_ctx, clp_left, clp_top, clp_width, clp_height);

        // 縦向き
        if(transform.rotate === '0deg') {
          // 黒板の表示時のみ黒板イメージを合成する
          if(kokubanShowFlag === true) {
            out_ctx.drawImage(kokuban_img, imgLeft, imgTop, imgWidth, imgHeight);
          }
        }else{
          if(transform.rotate === '+90deg') {
            // 横向き(左倒し)
            out_ctx.translate(imgLeft+imgWidth+(imgHeight-imgWidth), imgTop);
            rot = 270;
            out_ctx.rotate(90 * Math.PI / 180);
          }else{
            // 横向き(右倒し)
            out_ctx.translate(imgLeft, imgTop+imgWidth);
            rot = 90;
            out_ctx.rotate(270 * Math.PI / 180);
          }
          // 黒板の表示時のみ黒板イメージを合成する
          if(kokubanShowFlag === true) {
            out_ctx.drawImage(kokuban_img, 0, 0, imgWidth, imgHeight);
          }
        }

        // カンバスの情報をコールバック関数に引き渡すため
        var picImage = out_cvs.toDataURL( "image/jpeg" , 1.0 );
        var picWidth = out_cvs.width;
        var picHeight = out_cvs.height;
				// 黒板編集用の更新フラグ
        var updtflg = false;
        // ファイルのパスを設定 (現在時刻でファイル名を作成)
        var file = (new Date()).getTime() + ' ';
        file = file.substr(0,10);
        var filename = '';

        // 既存写真の黒板編集操作を行った場合は編集元のファイル名をセットする
        // ただし工事名称の編集を行った場合を除く
        if($('#pic-edit').attr('name') !== '' &&  $('#pic-edit').attr('alt') === directory) {
          file = $('#pic-edit').attr('name');
          updtflg = true;
        }

        // 必要なフォルダを作成
        localStrage.makeDirectory(directory, function(e) {

          // 撮影した写真のプレビュー
          app.takePicturePreview(picImage, function(e) {

            // 撮影イメージをローカルストレージに保存
            filename = file + '.jpg';
            localStrage.pictureSave(picImage, picWidth, picHeight, rot, directory, filename, function(e) {

              // サムネイルをローカルストレージに保存
              localStrage.pictureSave(picImage, 240, 320, rot, directory+'/thumbnail', filename, function(e) {

                // 黒板の背景を切り取って保存する
                localStrage.pictureSave(clp_img, clp_width, clp_height, rot, directory+'/clipping', filename, function(e) {
                });

                // 黒板情報をローカルストレージに保存
                filename = file + '.json';
                localStrage.setInformation(directory+'/information', filename, function(e) {

                  // 撮影日時・枚数情報を更新
                  filename = 'control' + '.json';
                  localStrage.setInformationHeader(directory+'/information', filename, updtflg, function(e) {
                    _log(1,'takePictureClose()','normal end');
                    takePictureClose(null);
                  },

                  // (control.json)の書き込みでエラー発生
                  function fail(message) {
                    takePictureClose(message);
                  });
                },

                // (infomation.json)の書き込みでエラー発生
                function fail(message) {
                  takePictureClose(message);
                });
              },

              // (サムネイル写真.jpg)の書き込みでエラー発生
              function fail(message) {
                takePictureClose(message);
              });
            },

            // (写真.jpg)の書き込みでエラー発生
            function fail(message) {
              takePictureClose(message);
            });
          });

        },
        // (localStrage.makeDirectory)でエラー発生
        function fail(message) {
          takePictureClose(message);
        });
      };
    };
  });

  // 写真撮影後の処理(正常・異常)
  function takePictureClose(message) {
    // 使用した変数を初期化
    imageSrcData = null;
    kokuban_cvs = null;
    kokuban_ctx = null;
    kokuban_img = null;
    out_cvs = null;
    out_ctx = null;
    pic_img = null;

    // シャッターボタンを有効にする
    $('#cameraTakeButton').attr('disabled', false);
    $('#cameraTakeButton').removeClass('disabled');

    if(message !== null) {
      _alert('撮影した写真の保存時にエラーが発生しました。<br>'+message);
    }

    // 既存写真の黒板編集操作でシャッターを押した場合
    if($('#pic-edit').attr('name') !== '') {
      // 工事写真一覧の表示項目を更新(工事名称の変更をしなかった場合のみ)
      if($('#pic-edit').attr('alt') === directory) {
        pictureListUpdate();
      }
      // 編集元写真を非表示
      $('#pic-edit').hide();
      // 工事写真の詳細表示ウィンドウを閉じる
      koujiPictureViewClose();
      // カメラ画面の表示
      $('#camera').hide();
      // 工事一覧ナビゲータを再表示
      $('#lstNavigator').show();
      // ステータスバーの非表示
      StatusBar.show();
    }
  }

  // 黒板の背景画像を切り取る処理
  function getClippingImage(inp_ctx, imgTop, imgLeft, imgWidth, imgHeight) {
    var clp_cvs = document.createElement('canvas');
    var clp_ctx = clp_cvs.getContext('2d');
    clp_cvs.width = imgWidth;
    clp_cvs.height = imgHeight;
    // 黒板の位置・幅・高さのイメージデータを切り取る
    var clp_img = inp_ctx.getImageData(imgTop, imgLeft, imgWidth, imgHeight);
    // 切り取ったイメージデータをカンバスに貼り付ける
    clp_ctx.putImageData(clp_img, 0, 0);
    // イメージデータとして戻す
    return clp_cvs.toDataURL( "image/jpeg" , 1.0 );
  }

  // 工事写真一覧の表示項目を更新
  function pictureListUpdate() {
    var file = $('#pic-edit').attr('name');

    // ローカルストレージから黒板の内容を読み込み
    var str = localStrage.getItems('firebase:temp/kokuban');
    // 読み込んだテキストをJSON形式に変換
    var k = JSON.parse(str);

    // 写真管理コードをセット
    if(k.pictureId   === undefined) {k.pictureId   = '';}
    $('#listItem'+file).attr('class',k.pictureId);

    // サーバーへのアップロード状況を未処理に変更
    $('#upload-icon'+file).attr('icon', 'ion-android-more-horizontal');
    $('#upload-icon'+file).css('color', 'darkorange');

    // 工種をセット
    if(k.kousyu  === undefined) {k.kousyu  = '';}
    if(k.kousyu !== '') {
      $('#kousyu'+file).text('工種:'+k.kousyu);
    }

    // 測点をセット
    if(k.sokuten === undefined) {k.sokuten = '';}
    if(k.sokuten !== '') {
      $('#sokuten'+file).text('測点:'+k.sokuten);
    }

    // 備考をセット
    if(k.bikou   === undefined) {k.bikou   = '';}
    if(k.bikou === undefined) {k.bikou = '';}
    // 改行コードをhtml形式に変換
    k.bikou = k.bikou.replace( /\n/g , '<br>' );
    $('#bikou'+file).html(k.bikou);

    // 撮影日時をセット
    var d = new Date();
    var yyyy = d.getFullYear();
    var mm   = d.getMonth()+1;
    var dd   = d.getDate();
    var hh   = d.getHours();
    var min  = d.getMinutes();
    mm  = ('00' + mm).slice(-2);
    dd  = ('00' + dd).slice(-2);
    hh  = ('00' + hh).slice(-2);
    min = ('00' + min).slice(-2);
    $('#date'+file).text('撮影:'+yyyy+'/'+mm+'/'+dd+' '+hh+':'+min);
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.takePicturePreview()
// 撮影後のプレビュー表
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.takePicturePreview = function(img_url, callback) {
  _log(1,'function','app.takePicturePreview()');

  takePicturePreviewID = null;

  // ローカルストレージからプレビュー時間を読み込み
  var str = localStrage.getItems('firebase:group00/config/picture');
  // 読み込んだテキストをJSON形式に変換
  var k = JSON.parse(str);
  var previewTime = 3;
  try {
    if(typeof(k.previewTime) === 'string') {
      previewTime = Number(k.previewTime);
    }
  } catch(e) {
  }

  // プレビュー表示設定に従ってプレビュー表示
  if(previewTime == 0) {
    callback(null);
  }else{
    // 保存時間分を1秒加算
    previewTime = previewTime + 1;

    $('#preview').attr('src', img_url);
    $('#preview').show();
    app.previewMessageSetStyle();
    $('#previewMessage').show();

    // 設定した秒数が経過したらプレビューを消去
    takePicturePreviewID = setTimeout(function() {
      app.takePicturePreviewhide();
      $('#previewMessage').off('touchstart');
      callback(null);
    }, previewTime * 1000);

    // プレビュー中に画面をタップしたらプレビューを消去
    $('#previewMessage').on('touchstart',function(){
       previewClickEnd();
    });
    function previewClickEnd() {
      app.takePicturePreviewhide();
      $('#previewMessage').off('touchstart');
      callback(null);
    }
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.previewMessageSetStyle()
// プレビューメッセージのスタイル設定
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.previewMessageSetStyle = function() {
  _log(1,'function','app.previewMessageSetStyle()');

  // 黒板の向きを取得し、メッセージを表示する向きを設定する
  var transform = getTransformParam($('#kokuban').css('transform'));
  var trns = 'rotate('+transform.rotate+')';
  $('#previewMessage p').css({'transform' : trns});
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.takePicturePreviewhide()
// 撮影後のプレビュー表示を消す
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.takePicturePreviewhide = function() {
  _log(1,'function','app.takePicturePreviewhide()');

  // プレビュータイマーのリセット
  if(takePicturePreviewID) {
    clearTimeout(takePicturePreviewID);
  }
  // プレビュー画面の非表示
  $('#preview').hide();
  $('#previewMessage').hide();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// app.clearElement()
// 不要な要素をクリア
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
app.clearElement = function() {
  _log(1,'function','app.clearElement()');

};
