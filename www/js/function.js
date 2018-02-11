//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// getTransformParam(transform)
// パラメータ:transformは「$(セレクタ).css('transform')」
// 戻り値:'rotate'には'0deg'、'+90deg'、'-90deg' のいずれか
// 戻り値:'left'・'top'には要素の位置
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function getTransformParam(transform) {
  // transformをparamに分解
  transform = transform.replace( "matrix(" , "" );
  transform = transform.replace( ")" , "" );
  var params = transform.split(',');

  var rot = '0deg';
  if((params[1].trim()==='-1')||(params[2].trim()==='1')) {
    rot = '-90deg';
  };  
  if((params[1].trim()==='1')||(params[2].trim()==='-1')) {
    rot = '+90deg';
  };  
  
  return {
    "rotate": rot,         // デバイスの向き
    "left"   : params[4],  // 左位置
    "top"    : params[5]   // 上位置
  };
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// orientWatch(act)
// 画面の向きの監視を開始・停止
// パラメータ:act ('start':開始、'stop':停止)
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function orientWatch(act) {
  _log(1,'function','orientWatch('+act+')');
  
  // 画面の向きが変わった時点で黒板の向きを変更するイベントを登録
  if(act==='start') {
    // 1.0秒間隔で向きを検出
    var OrientOptions = { frequency: 1000 };
    watchAccelerationID = navigator.accelerometer.watchAcceleration(
      // 画面の向きが変わった時点で黒板の向きを変更するイベントを登録
      function(acceleration) {
        if(Math.round(acceleration.x) !== accelerationSave_x || 
           Math.round(acceleration.y) !== accelerationSave_y) {
             
          accelerationSave_x = Math.round(acceleration.x);
          accelerationSave_y = Math.round(acceleration.y);
          
          app.setOrientationChange(acceleration);
        }
      },
      function() {
        alert('デバイスの向き検出時にエラー');
      },OrientOptions
    );
  };
  
  // 画面の向きの監視を停止する
  if(act==='stop') {
    if(watchAccelerationID) {
      navigator.accelerometer.clearWatch(watchAccelerationID);
      watchAccelerationID = null;
    }    
  };
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// displayDeviceSize()
// タブレット(画面大)・スマホ(画面小)の判定
// 戻り値: 'large':画面大、'small':画面小
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function displayDeviceSize() {
  _log(1,'function','displayDeviceSize()');
  
  // 判定のしきい値
  var size = 600;
  if(window.innerWidth>size) {
    return 'large';
  }else{
    return 'small';
  }
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// _imgB64Resize()
// Base64データをリサイズ及び回転
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function _imgB64Resize(imgB64_src, width, height, rotate, callback) {
  _log(1,'function','_imgB64Resize');
  
  // Image Type
  var img_type = imgB64_src.substring(5, imgB64_src.indexOf(";"));
  // Source Image
  var img = new Image();
  img.onload = function() {
    // New Canvas
    var canvas = document.createElement('canvas');
    if(rotate == 90 || rotate == 270) {
      // swap w <==> h
      canvas.width = height;
      canvas.height = width;
    } else {
      canvas.width = width;
      canvas.height = height;
    }
    // Draw (Resize)
    var ctx = canvas.getContext('2d');
    if(0 < rotate && rotate < 360) {
      ctx.rotate(rotate * Math.PI / 180);
      if(rotate == 90)
        ctx.translate(0, -height);
      else if(rotate == 180)
        ctx.translate(-width, -height);
        else if(rotate == 270)
          ctx.translate(-width, 0);
    }
    ctx.drawImage(img, 0, 0, width, height);
    // Destination Image
    var imgB64_dst = canvas.toDataURL(img_type);
    callback(imgB64_dst);
  };
  img.src = imgB64_src;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// _Base64toBlob()
// Base64データをBlobデータに変換
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function _Base64toBlob(base64) {
  _log(1,'function','_Base64toBlob()');
  
  // カンマで分割して以下のようにデータを分ける
  // tmp[0] : データ形式（data:image/png;base64）
  // tmp[1] : base64データ（iVBORw0k～）
  var tmp = base64.split(',');
  // base64データの文字列をデコード
  var data = atob(tmp[1]);
  // tmp[0]の文字列（data:image/png;base64）からコンテンツタイプ（image/png）部分を取得
  var mime = tmp[0].split(':')[1].split(';')[0];
  //  1文字ごとにUTF-16コードを表す 0から65535 の整数を取得
  var buf = new Uint8Array(data.length);
  for (var i = 0; i < data.length; i++) {
    buf[i] = data.charCodeAt(i);
  }
    // blobデータを作成
  var blob = new Blob([buf], { type: mime });
  return blob;
};

// 2018/02/07 ADD ----- ↓
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// _setExifInfo()
// 写真データにExif情報を書き込み
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function _setExifInfo(imagesrc) {
  _log(1,'function','_setExifInfo()');

  // 撮影日時を所定の形式にフォーマット
  var dt = new Date();
  var YYYY = dt.getFullYear();
  var MM = ('00' + (dt.getMonth()+1)).slice(-2);
  var DD = ('00' + dt.getDate()).slice(-2);
  var hh = ('00' + dt.getHours()).slice(-2);
  var mm = ('00' + dt.getMinutes()).slice(-2);
  var ss = ('00' + dt.getSeconds()).slice(-2);
  var datetime = YYYY + ':' + MM + ':' + DD + ' ' + hh + ':' +  mm + ':' +  ss;

  // 端末の型名
  var model = getDeviceName();
  
  // exif data 初期化
  var zerothIfd = {};
  var exifIfd = {};
  var gpsIfd = {};

  // 0thデータ
  zerothIfd[piexif.ImageIFD.Make] = device.manufacturer;
  zerothIfd[piexif.ImageIFD.Model] = model;
  zerothIfd[piexif.ImageIFD.Software] = device.platform+' '+device.version;
  zerothIfd[piexif.ImageIFD.DateTime] = datetime;
  zerothIfd[piexif.ImageIFD.Orientation] = 1;
//  zerothIfd[piexif.ImageIFD.XResolution] = [777, 1];
//  zerothIfd[piexif.ImageIFD.YResolution] = [777, 1];

  // Exifデータ
  exifIfd[piexif.ExifIFD.ExifVersion] = '0230';
  exifIfd[piexif.ExifIFD.DateTimeOriginal] = datetime;
  exifIfd[piexif.ExifIFD.DateTimeDigitized] = datetime;
  exifIfd[piexif.ExifIFD.MakerNote] = '';
  exifIfd[piexif.ExifIFD.UserComment] = '';
  exifIfd[piexif.ExifIFD.LensMake] = device.manufacturer;
  exifIfd[piexif.ExifIFD.LensModel] = model;
//  exifIfd[piexif.ExifIFD.Sharpness] = 777;
//  exifIfd[piexif.ExifIFD.LensSpecification] = [[1, 1], [1, 1], [1, 1], [1, 1]];

  // GPSデータ
  var lat = presentLocation.lat;
  var lng = presentLocation.lng;
  var alt = presentLocation.alt;
  gpsIfd[piexif.GPSIFD.GPSVersionID] = [2, 2, 0, 0];
  gpsIfd[piexif.GPSIFD.GPSLatitudeRef] = lat < 0 ? 'S' : 'N';
  gpsIfd[piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(lat);
  gpsIfd[piexif.GPSIFD.GPSLongitudeRef] = lng < 0 ? 'W' : 'E';
  gpsIfd[piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(lng);
  gpsIfd[piexif.GPSIFD.GPSAltitudeRef] = alt < 0 ? 1 : 0;
  gpsIfd[piexif.GPSIFD.GPSAltitude] = alt;
  gpsIfd[piexif.GPSIFD.GPSDateStamp] = datetime;

  // exifオブジェクトの作成
  var exifObj = {"0th":zerothIfd, "Exif":exifIfd, "GPS":gpsIfd};

  // exifをバイナリ形式に変換
  var exifBytes = piexif.dump(exifObj);

  // イメージとexif情報を合成
  var picImage = piexif.insert(exifBytes, imagesrc);

  return picImage;
};

  
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// _getLocation()
// 写真データにExif情報を書き込み
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function _getLocation() {
  _log(1,'function','_getLocation()');

  navigator.geolocation.getCurrentPosition(
    function(position) {
      presentLocation.lat = position.coords.latitude;
      presentLocation.lng = position.coords.longitude;
      presentLocation.alt = position.coords.altitude;
      presentLocation.tim = position.timestamp;
    },
    function onError(error) {
      presentLocation = {lat : 0, lng : 0, alt : 0, tim : 0};

      var message = '写真に位置情報を付加する設定がされていますが、';
      if(error.code === PositionError.PERMISSION_DENIED) {
        message = message + '端末の設定によって位置情報の取得が許可されていません。';
      }else{
        message = message + '位置情報の取得ができませんでした。 (' + error.code + ')';
      }
      _alert(message);
    }
  );
};
// 2018/02/07 ADD ----- ↑

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// _log(lebel,msg1,msg2)
// パラメータ:
//   level: グローバル変数'logMessageLevel'の値以下を出力
//   msg1: 第1ログメッセージ
//   msg2: 第2ログメッセージ
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function _log(lebel,msg1,msg2) {
  // 'Strict'モードの設定（厳格モード）
  // 全てのユーザー定義関数の先頭で本関数を使用する為にここで定義 
  'use strict'; 
  
  // ログを出力するレベル以上のメッセージのみ出力
  if(lebel <= logMessageLevel) {

    var time = new Date(); 
    var hh = time.getHours();
    var mm = time.getMinutes();
    var ss = time.getSeconds();
    var ms = time.getMilliseconds();
    hh = ('00' + hh).slice(-2);
    mm = ('00' + mm).slice(-2);
    ss = ('00' + ss).slice(-2);
    ms = ('000' + ms).slice(-3);
    var str = hh + ':' + mm + ':' + ss + ':' + ms + '> ';

    if(typeof msg2 === "undefined") {
      console.log(str + msg1);
    }else{
      console.log(str + msg1+':'+msg2);
    }
//  _firebaselog(str, '', msg1, msg2);
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// _errorlog(lebel,msg1,msg2)
// パラメータ:
//   level: グローバル変数'logMessageLevel'の値以下を出力
//   msg1: 第1ログメッセージ
//   msg2: 第2ログメッセージ
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function _errorlog(lebel,msg1,msg2) {
  // ログを出力するレベル以上のエラーメッセージのみ出力
  if(lebel <= errorlogMessageLevel) {

    var time = new Date(); 
    var hh = time.getHours();
    var mm = time.getMinutes();
    var ss = time.getSeconds();
    var ms = time.getMilliseconds();
    hh = ('00' + hh).slice(-2);
    mm = ('00' + mm).slice(-2);
    ss = ('00' + ss).slice(-2);
    ms = ('000' + ms).slice(-3);
    var str = hh + ':' + mm + ':' + ss + ':' + ms + '> ';

    if(typeof msg2 === "undefined") {
      console.error(str + msg1);
    }else{
      console.error(str + msg1+':'+msg2);
    }  
//  _firebaselog(str, 'error', msg1, msg2);
  }
};

//function _firebaselog(str, sts ,msg1, msg2) {
//  try {
//    var folder = activeuser.uid+"/messagelog/"+str;
//    if(typeof msg2 === "undefined") {
//      firebase.database().ref(folder)
//        .update({
//            status : sts,
//            message1 : msg1
//        });
//    }else{
//      firebase.database().ref(folder)
//        .update({
//            status : sts,
//            message1 : msg1,
//            message2 : msg2
//        });
//    }
//  }catch(e){}
//}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// _information(message)
// パラメータ:
//   message: 指定したメッセージをアラートダイアログに表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function _information(message) {
  // ダイアログ画面で入力
  var options = { title: '〔情報〕',
                  buttonLabels: 'ＯＫ',
                  messageHTML: message
                };
  ons.notification.alert(options);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// _alert(message)
// パラメータ:
//   message: 指定したメッセージをアラートダイアログに表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function _alert(message) {
  // ダイアログ画面で入力
  var options = { title: '〔警告〕',
                  buttonLabels: 'ＯＫ',
                  messageHTML: message
                };
  ons.notification.alert(options);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// _confirm(message, callback)
// パラメータ:
//   message: 指定したメッセージをアラートダイアログに表示
//   callback: [OK]時は0、[ｷｬﾝｾﾙ]時は-1をコールバック
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function _confirm(message, callback) {
  // ダイアログ画面で入力
  var options = { title: '〔確認〕',
                  messageHTML: message,
                  buttonLabels: ["キャンセル", "ＯＫ"],
                  primaryButtonIndex: 0,  // プライマリボタンのインデックス
                  animation: 'fade',	//アニメーション名を指定("none", "fade", "slide")
//                cancelable:  true, // ダイアログがキャンセル可能かどうか(true or false)
//                modifier:	// ダイアログのmodifier属性の値を指定します。
                  callback: function(idx) { //	ダイアログが閉じられた後に呼び出される関数オブジェクト(キャンセル時は-1)
                    if(idx === 1) { 
                      callback(0);     // [OK]ボタンくリック時は0を返す
                    }else{
                      callback(-1);    // [ｷｬﾝｾﾙ]ボタンくリック時は-1を返す
                    }  
                  }
                };
                  
  ons.notification.confirm(options);
};