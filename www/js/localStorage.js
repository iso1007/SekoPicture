var localStrage = function() {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// localStrage.pictureSave()
// 写真イメージのセーブ
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localStrage.pictureSave = function(img_url, img_width, img_height, img_rot, directory, filename, callback, error_callback) {
  _log(1,'function','localStrage.pictureSave('+img_width+','+img_height+','+img_rot+','+directory+','+filename+')');

  try {
    // 横向きの場合はイメージを回転
    _imgB64Resize(img_url, img_width, img_height, img_rot, function(img64) {

      // 撮影イメージ(Base64)形式をBlob形式に変換
      // サムネイル画像にはExif情報を付加しない
      var blob = '';
      if(directory.indexOf('/thumbnail') > 0) {
        blob = _Base64toBlob( img64 );
      }else{
        // 撮影イメージ(Base64)にExif情報を付加
        blob = _Base64toBlob( _setExifInfo(img64) );
      }

      // デバイスローカル(documentsDirectory)に保存
      localStrage.saveBlobFile(directory, filename, blob, function(url){
        _log(1,'localStrage.pictureSave','normalend');
        callback(null);
      },

      function fail(message) {
        _errorlog(1,'localStrage.pictureSave', message);
        error_callback(message);
      });
    });

  } catch(e) {
    error_callback(e.message);
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// localStrage.makeDirectory()
// 工事名称フォルダ配下に必要なフォルダを確認し、ない場合は作成する
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localStrage.makeDirectory = function(localFolder, callback, error_callback) {
  _log(1,'function','localStrage.makeDirectory()');

  // iosはDocuments配下のクラウド非同期フォルダに保存
//  var folderurl = cordova.file.documentsDirectory + 'NoCloud/';
  var folderurl = cordova.file.documentsDirectory;
  _log(1,'function',folderurl+localFolder);

  // dataDirectoryフォルダのDirectoryEntryオブジェクトを取得
  window.resolveLocalFileSystemURL(folderurl, function(directoryEntry) {
    // Android: "file:///data/data/io.cordova.myapp9ada90/files/
    // Windows: "ms-appdata:///local//"

    directoryEntry.getDirectory(localFolder, { create: true }, function(subDirectoryEntry) {

      // 写真情報ファイル保存フォルダの作成
      subDirectoryEntry.getDirectory('information', { create: true }, function() {

        // サムネイル保存フォルダの作成
        subDirectoryEntry.getDirectory('thumbnail', { create: true }, function() {

          // 黒板背景イメージ保存用フォルダの作成
          subDirectoryEntry.getDirectory('clipping', { create: true }, function() {

            // ゴミ箱フォルダの作成
            subDirectoryEntry.getDirectory('dustbox', { create: true }, function() {

              callback(null);

            },
            // (dustbox)フォルダの作成エラー
            function fail(error) {
              _errorlog(1,'localStrage.makeDirectory','getDirectory(dustbox) Error: ' + error.code);
              error_callback('フォルダ(dustbox)作成エラー ('+error.code+')');
            });
          },

          // (clipping)フォルダの作成エラー
          function fail(error) {
            _errorlog(1,'localStrage.makeDirectory','getDirectory(clipping) Error: ' + error.code);
            error_callback('フォルダ(clipping)作成エラー ('+error.code+')');
          });
        },

        // (thumbnail)フォルダの作成エラー
        function fail(error) {
          _errorlog(1,'localStrage.makeDirectory','getDirectory(thumbnail) Error: ' + error.code);
          error_callback('フォルダ(thumbnail)作成エラー ('+error.code+')');
        });
      },

      // (information)フォルダの作成エラー
      function fail(error) {
        _errorlog(1,'localStrage.makeDirectory','getDirectory(information) Error: ' + error.code);
        error_callback('フォルダ(information)作成エラー ('+error.code+')');
      });
    },

    // (工事名称)フォルダの作成エラー
    function fail(error) {
      _errorlog(1,'localStrage.makeDirectory','getDirectory('+localFolder+') Error: ' + error.code);
      error_callback('フォルダ('+localFolder+')作成エラー ('+error.code+')');
    });
  },

  // directoryEntryの取得エラー
  function fail(error) {
    _errorlog(1,'localStrage.makeDirectory','resolveLocalFileSystemURI Error: ' + error.code);
    error_callback('directoryEntry取得エラー ('+error.code+')');
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// localStrage.saveBlobFile()
// ローカルストレージにBlobデータを保存する
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localStrage.saveBlobFile = function(localFolder, localFileName, blob, callback, error_callback) {
  _log(1,'function','localStrage.saveBlobFile()');

  // iosはDocuments配下のクラウド非同期フォルダに保存
//  var folderurl = cordova.file.documentsDirectory + 'NoCloud/';
  var folderurl = cordova.file.documentsDirectory+localFolder;
  _log(1,'function',folderurl);

  // dataDirectoryフォルダのDirectoryEntryオブジェクトを取得
  window.resolveLocalFileSystemURL(folderurl, function(directoryEntry) {

    // settingsFileNameファイルを取得（存在しないときは作成）
    directoryEntry.getFile(localFileName, { create: true }, function(fileEntry) {

      // FileWriterオブジェクトを作成
      fileEntry.createWriter( function(fileWriter) {
        // イメージデータの書き込み処理
        fileWriter.write(blob);
          // データ書き込み成功
        callback(null);
      },

      // (fileEntry.createWriter)呼び出しエラー
      function fail(error) {
        _errorlog(1,'localStrage.saveBlobFile','fileEntry.createWriter Error: ' + error.code);
        error_callback('localStrage.saveBlobFile > fileEntry.createWriter Error: ('+error.code+')');
      });
    },

    // (directoryEntry.getFile)呼び出しエラー
    function fail(error) {
      _errorlog(1,'localStrage.saveBlobFile','directoryEntry.getFile Error: ' + error.code);
      error_callback('localStrage.saveBlobFile > directoryEntry.getFile Error: ('+error.code+')');
    });
  },

  // (resolveLocalFileSystemURL)呼び出しエラー
  function fail(error) {
    _errorlog(1,'localStrage.saveBlobFile','resolveLocalFileSystemURL Error: ' + error.code);
    error_callback('localStrage.saveBlobFile > resolveLocalFileSystemURL Error: ('+error.code+')');
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// localStrage.getJsonFile()
// ローカルデータフォルダから(写真・テキスト)データを取得
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localStrage.getJsonFile = function(localFolder, localFileName, callback, error_callback) {
  _log(1,'function','localStrage.getJsonFile()');

  // 設定ファイルへのパス
//  var urlToFile = cordova.file.documentsDirectory + 'NoCloud/' + localFolder + '/' + localFileName;
  var urlToFile = cordova.file.documentsDirectory + localFolder + '/' + localFileName;
  _log(1,'localStrage.getJsonFile',urlToFile);

  // 設定ファイルのFileEntryオブジェクトを取得（Rippleでは動作せず）
  window.resolveLocalFileSystemURL(urlToFile, function(fileEntry) {

    // Fileオブジェクトを取得
    fileEntry.file( function(file) {

      // FileReaderオブジェクトを作成
      var reader = new FileReader();
      // ファイル読み込み後の処理をセット
      reader.onloadend = function(e) {
        // コールバックでイメージを戻す
        callback(e.target.result);
      };
      // ファイル読み込みを実行
      if(localFileName.match(/.jpg/)) {
        reader.readAsDataURL(file);
      }else{
        reader.readAsText(file);
      }
    },

    // (fileEntry.file)呼び出し失敗
    function fail(error) {
      _errorlog(1,'localStrage.getJsonFile','fileEntry.file Error: ' + error.code);
      error_callback('localStrage.getJsonFile > fileEntry.file Error: ('+error.code+')');
    });
  },

  // (resolveLocalFileSystemURL)呼び出し失敗
  function fail (error) {
    _errorlog(1,'localStrage.getJsonFile','resolveLocalFileSystemURL Error: ' + error.code);
    error_callback('localStrage.getJsonFile > resolveLocalFileSystemURL Error: ('+error.code+')');
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// localStrage.setInformation()
// 黒板情報のセーブ (infomation/[id].json)
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localStrage.setInformation = function(directory, filename, callback, error_callback) {
  _log(1,'function','localStrage.setInformation()');

  // ローカルストレージから読み込み
  var str = localStrage.getItems('firebase:temp/kokuban');
  // 読み込んだテキストをJSON形式に変換
  var json_in = JSON.parse(str);

  var json_text = { pictureId:'' ,kouji:'',kousyu:'',sokuten:'',hiduke:'',bikou:'',syamei:'',datetime:'',upload:'' };

  json_text.pictureId= json_in.pictureId;
  json_text.kouji    = json_in.kouji;
//  json_text.kouji    = json_in.directory;
  json_text.kousyu   = json_in.kousyu;
  json_text.sokuten  = json_in.sokuten;
  json_text.hiduke   = json_in.hiduke;
  json_text.bikou    = json_in.bikou;
  json_text.syamei   = json_in.syamei;
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
  json_text.datetime = yyyy+'/'+mm+'/'+dd+' '+hh+':'+min;

  // 2018/02/07 ADD ----- ↓
  // 位置情報を付加
  json_text.latitude　= presentLocation.lat;
  json_text.longitude = presentLocation.lng;
  // 2018/02/07 ADD ----- ↑

  json_text.upload   = 'Untreated'; // 未処理
  var json_out  = JSON.stringify(json_text);

  blob = new Blob( [json_out], {type:"JSON\/javascript"} );

  // デバイスローカル(documentsDirectory)に保存
  localStrage.saveBlobFile(directory, filename, blob, function(url){
    _log(1,'localStrage.setInformation','normalend');
    callback(null);
  },
  function fail(message) {
    error_callback(message);
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// localStrage.setInformationHeader()
// 写真撮影日時・枚数 等の情報をセーブ (infomation/cotrol.json)
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localStrage.setInformationHeader = function(directory, filename, callback, error_callback) {
  _log(1,'function','localStrage.setInformationHeader()');

  var json_text = { koujiname:'',fast_datetime:'',last_datetime:'',picture_count:0,upload_count:0,shootinglistNo:'',geoLocation:{} };
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
  var format_datetime = yyyy+'/'+mm+'/'+dd+' '+hh+':'+min;
  var koujiname = directory.replace('/information', '');

  localStrage.getJsonFile(directory, filename, function(result) {
    // 読み込んだテキストをJSON形式に変換
    var text = result;
    var k = {};
    try {
      k = JSON.parse(text);
    }catch(e){
      k.fast_datetime  = '';
      k.shootinglistNo = '';
    }

    json_text.koujiname = koujiname;
    json_text.fast_datetime = k.fast_datetime;
    json_text.shootinglistNo = k.shootinglistNo;
    // 最終撮影日時をセット
    json_text.last_datetime = format_datetime;
    // 撮影枚数をカウントアップ
    if(k.picture_count === undefined) {k.picture_count = 0;};
    if(k.upload_count  === undefined) {k.upload_count  = 0;};
    json_text.picture_count = k.picture_count + 1;
    json_text.upload_count  = k.upload_count;
    // 撮影場所の位置情報
    json_text.geoLocation   = presentLocation;
    // jsonオブジェクトに変換
    var json_out  = JSON.stringify(json_text);
    blob = new Blob( [json_out], {type:"JSON\/javascript"} );
    // デバイスローカル(documentsDirectory)に保存
    localStrage.saveBlobFile(directory, filename, blob, function(url){
      _log(1,'localStrage.setInformationHeader','update normalend');
      callback(null);
    },
    function fail(message) {
      error_callback(message);
    });
  },
  function(e) {
    // エラーが返ってきた場合はファイルが無いとみなし、新規作成する
    // 工事名称をセット
    json_text.koujiname = koujiname;
    // 撮影開始日時をセット
    json_text.fast_datetime = format_datetime;
    json_text.last_datetime = format_datetime;
    // 撮影枚数は１をセット
    json_text.picture_count  = 1;
    // 撮影場所の位置情報
    json_text.geoLocation   = presentLocation;
    // jsonオブジェクトに変換
    var json_out  = JSON.stringify(json_text);
    blob = new Blob( [json_out], {type:"JSON\/javascript"} );
    // デバイスローカル(documentsDirectory)に保存
    localStrage.saveBlobFile(directory, filename, blob, function(url){
      _log(1,'localStrage.setInformationHeader','new normalend');
      callback(null);
    },
    function fail(message) {
      error_callback(message);
    });
  });

  // localstoragの位置情報を更新
  setFirebaseGeoLocation(koujiname, presentLocation);
};

// 2018/01/27 ADD -----↓
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// localStrage.removeDirectory()
// 指定したフォルダを削除する
// 正常に削除ができた場合、削除するフォルダが無かった場合はnullをコールバック
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localStrage.removeDirectory = function(localFolder, callback, error_callback) {
  _log(1,'function','localStrage.removeDirectory('+localFolder+')');

  // iosはDocuments配下のクラウド非同期フォルダに保存
//  var folderurl = cordova.file.documentsDirectory + 'NoCloud/';
  var folderurl = cordova.file.documentsDirectory + localFolder;

  // dataDirectoryフォルダのDirectoryEntryオブジェクトを取得
  window.resolveLocalFileSystemURL(folderurl, function(directoryEntry) {
    // 指定されたフォルダを削除する
    directoryEntry.removeRecursively( function() {
      callback(null);
    },
    function(error){
      _errorlog(1,'localStrage.removeDirectory()', error.code+'-> '+folderurl);
      error_callback('localStrage.removeDirectory > directoryEntry.removeRecursively Error: ('+error.code+')');
    });
  },
  function(error) {
    _log(1,'localStrage.removeDirectory()', 'Folder Nothing -> '+folderurl);
    error_callback('localStrage.removeDirectory > resolveLocalFileSystemURL Error: ('+error.code+')');
  });
};
// 2018/01/27 ADD -----↑

// 2018/01/27 ADD -----↓
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// localStrage.removeFile()
// 指定したファイルを削除する
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localStrage.removeFile = function(localFolder, localFile, callback) {
  // iosはDocuments配下のクラウド非同期フォルダに保存
//  var folderurl = cordova.file.documentsDirectory + 'NoCloud/';
  var fileurl = cordova.file.documentsDirectory + localFolder + localFile;

  _log(1,'function','localStrage.removeFile('+fileurl+')');

  // dataDirectoryフォルダのDirectoryEntryオブジェクトを取得
  // 設定ファイルのFileEntryオブジェクトを取得
  window.resolveLocalFileSystemURL(fileurl,
    function(fileEntry) {
      // 指定したファイルを削除
      fileEntry.remove();
    },
    // (resolveLocalFileSystemURL)呼び出し失敗
    function(e) {
      _errorlog(1,'localStrage.removeFile','resolveLocalFileSystemURL Error: ' + e.code);
      callback(e.code);
    }
  );
};
// 2018/01/27 ADD -----↑

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// localStrage.setItems()
// ローカルストレージにアイテムを書き込み
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localStrage.setItems = function(key,val) {
  _log(1,'function','localStrage.setItems()');

  try {
    // ローカルストレージに書き込み
    localStorage.setItem(key, val);
    return true;
  } catch(e) {
    _alert(e+'\n'+'ローカルストレージへの書き込みが出来ませんでした。\n' + '(key:' + key + ',' + val + ')');
    return false;
  };
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// localStrage.getItems()
// ローカルストレージから読み込み
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localStrage.getItems = function(key) {
  _log(1,'function','localStrage.getItems()');

  var str = '';

  try {
    // ローカルストレージから読み込み
    str = localStorage.getItem(key);
  } catch(e) {
    str = '';
    _alert(e+'\n'+'ローカルストレージからの読み込みが出来ませんでした。\n' + '(key:' + key + ')');
  };

  if(str==null){
    str = '{}';
  };

  return str;
};
