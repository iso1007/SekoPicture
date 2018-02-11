var localStrage = function() {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// localStrage.pictureSave()
// 写真イメージのセーブ
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localStrage.pictureSave = function(img_url, img_width, img_height, img_rot, directory, filename) {
  _log(1,'function','localStrage.pictureSave('+img_width+','+img_height+','+img_rot+','+directory+','+filename+')');

  // 縦向きの場合
//if(img_rot>0) {  // 2018/01/23 DEL
    // 横向きの場合はイメージを回転
    _imgB64Resize(img_url, img_width, img_height, img_rot, function(img64) {

      // 撮影イメージ(Base64)にExif情報を付加            // 2018/02/07 ADD
      // 撮影イメージ(Base64)形式をBlob形式に変換
      var blob = _Base64toBlob( _setExifInfo(img64) );   // 2018/02/07 ADD
//    var blob = _Base64toBlob(img64);                   // 2018/02/07 DEL
      // デバイスローカル(documentsDirectory)に保存
      localStrage.saveBlobFile(directory, filename, blob, function(url){
        _log(1,'localStrage.pictureSave','normalend');
      });
    });
//  // 2018/01/23 ↓ ----- DEL    
//  }else{
//    // 撮影イメージ(Base64)形式をそのままBlob形式に変換
//    var blob = _Base64toBlob(img_url);
//    // デバイスローカル(documentsDirectory)に保存
//    localStrage.saveBlobFile(directory, filename, blob, function(url){
//      _log(1,'localStrage.pictureSave','normalend');
//    });
//  };
//  // 2018/01/23 ↑ ----- DEL    
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// localStrage.makeDirectory()
// 工事名称フォルダ配下に必要なフォルダを確認し、ない場合は作成する
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localStrage.makeDirectory = function(localFolder, callback) {
  _log(1,'function','localStrage.makeDirectory()');

  // iosはDocuments配下のクラウド非同期フォルダに保存
//  var folderurl = cordova.file.documentsDirectory + 'NoCloud/';
  var folderurl = cordova.file.documentsDirectory;
  _log(1,'function',folderurl+localFolder);
  
  // dataDirectoryフォルダのDirectoryEntryオブジェクトを取得
  window.resolveLocalFileSystemURL(folderurl, function success1(directoryEntry) {
    // Android: "file:///data/data/io.cordova.myapp9ada90/files/
    // Windows: "ms-appdata:///local//"
      
    directoryEntry.getDirectory(localFolder, { create: true }, function (subDirectoryEntry) {
      
      // 写真情報ファイル保存フォルダの作成
      subDirectoryEntry.getDirectory('information', { create: true }, function (e) {
          
        // サムネイル保存フォルダの作成
        subDirectoryEntry.getDirectory('thumbnail', { create: true }, function (e) {
            
          // 黒板背景イメージ保存用フォルダの作成
          subDirectoryEntry.getDirectory('clipping', { create: true }, function (e) {
            
            // ゴミ箱フォルダの作成
            subDirectoryEntry.getDirectory('dustbox', { create: true }, function (e) {
              
              callback(null);
              
            });
          });
        });  
      });
    },
    // (resolveLocalFileSystemURL)呼び出し失敗
    function fail(error) {
      _errorlog(1,'localStrage.makeDirectory',"resolveLocalFileSystemURI Error: " + error.code);
    });
  });      
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// localStrage.saveBlobFile()
// ローカルストレージにBlobデータを保存する
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localStrage.saveBlobFile = function(localFolder, localFileName, blob, callback) {
  _log(1,'function','localStrage.saveBlobFile()');

  // iosはDocuments配下のクラウド非同期フォルダに保存
//  var folderurl = cordova.file.documentsDirectory + 'NoCloud/';
  var folderurl = cordova.file.documentsDirectory;
  _log(1,'function',folderurl+localFolder);

  // dataDirectoryフォルダのDirectoryEntryオブジェクトを取得
  window.resolveLocalFileSystemURL(folderurl,
    // (resolveLocalFileSystemURL)が成功したら呼び出される関数
    function success1(directoryEntry) {
      // Android: "file:///data/data/io.cordova.myapp9ada90/files/
      // Windows: "ms-appdata:///local//"

      directoryEntry.getDirectory(localFolder, { create: true }, function (subDirectoryEntry) {

        // settingsFileNameファイルを取得（存在しないときは作成）
        subDirectoryEntry.getFile(localFileName, { create: true },
          // （第3引数）成功したら呼び出される関数
          function success2(fileEntry) {
            // Android: "file:///data/data/io.cordova.myapp9ada90/files/settings.json"
            // Windows: "ms-appdata:///local//settings.json"

            // FileWriterオブジェクトを作成
            fileEntry.createWriter(
              
              // (fileEntry.createWriter)の成功
              function success3(fileWriter) {
                // Android: "cdvfile://localhost/files/settings.json"
                // Windows: "cdvfile://localhost/persistent/settings.json"

                // データ書き込み後のハンドラーをセット
                fileWriter.onwriteend = function (e) {
                  // for real-world usage, you might consider passing a success callback
                  callback(null);
                };
                // データ書き込み失敗時のハンドラーをセット
                fileWriter.onerror = function (e) {
                  // you could hook this up with our global error handler, or pass in an error callback
                  _errorlog(1,'localStrage.saveBlobFile','Write failed: ' + e.toString());
                };
                // イメージデータの書き込み処理
                fileWriter.write(blob);
              },
              // (fileEntry.createWriter)呼び出しエラー
              function fail(error) {
                _errorlog(1,'localStrage.saveBlobFile',"fileEntry.createWriter Error: " + error.code);
              }
            );
          },
          // (subDirectoryEntry.getFile)呼び出し失敗
          function fail(error) {
            _errorlog(1,'localStrage.saveBlobFile',"subDirectoryEntry.getFile Error: " + error.code);
          }
        );
      },
        // (directoryEntry.getDirectory)呼び出し失敗
        function fail(error) {
          _errorlog(1,'localStrage.saveBlobFile',"directoryEntry.getDirectory Error: " + error.code);
        }
      );
    },
    // (resolveLocalFileSystemURL)呼び出し失敗
    function fail(error) {
      _errorlog(1,'localStrage.saveBlobFile',"resolveLocalFileSystemURI Error: " + error.code);
    }
  );
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// localStrage.getPicture()
// ローカルデータフォルダから(写真・テキスト)データを取得
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localStrage.getPicture = function(localFolder, localFileName, normal_callback, error_callback) {
  _log(1,'function','localStrage.getPicture()');
  
  // 設定ファイルへのパス
//  var urlToFile = cordova.file.documentsDirectory + 'NoCloud/' + localFolder + '/' + localFileName;
  var urlToFile = cordova.file.documentsDirectory + localFolder + '/' + localFileName;
  _log(1,'localStrage.getPicture',urlToFile);

  // 設定ファイルのFileEntryオブジェクトを取得（Rippleでは動作せず）
  window.resolveLocalFileSystemURL(urlToFile,
    //（第2引数）成功したら呼び出される関数
    function success1 (fileEntry) {
      _log(2,'localStrage.getPicture','resolveLocalFileSystemURL Success: ' + fileEntry.nativeURL);

      // Fileオブジェクトを取得
      fileEntry.file(
        // (fileEntry.file)が成功したら呼び出される関数
        function success2 (file) {
          // FileReaderオブジェクトを作成
          var reader = new FileReader();
          // ファイル読み込み後の処理をセット
          reader.onloadend = function(e) {
            //console.log("read success: " + e.target.result);
            // コールバックでイメージを戻す
            normal_callback(e.target.result);
          };
          // ファイル読み込みを実行
          if(localFileName.match(/.jpg/)) {
            reader.readAsDataURL(file);
          }else{
            reader.readAsText(file);
          }  
        },
        // (fileEntry.file)呼び出し失敗
        function fail (error) {
          error_callback(error.code);
          _errorlog(1,'localStrage.getPicture',"fileEntry.file Error: " + error.code);
        }
      );
    },
    // (resolveLocalFileSystemURL)呼び出し失敗
    function fail (error) {
      error_callback(error.code);
      _errorlog(1,'localStrage.getPicture',"resolveLocalFileSystemURL Error: " + error.code);
    }
  );
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// localStrage.setInformation()
// 黒板情報のセーブ (infomation/[id].json)
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localStrage.setInformation = function(directory, filename) {
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
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// localStrage.setInformationHeader()
// 写真撮影日時・枚数 等の情報をセーブ (infomation/cotrol.json)
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localStrage.setInformationHeader = function(directory, filename) {
  _log(1,'function','localStrage.setInformationHeader()');
  
  var json_text = { koujiname:'',fast_datetime:'',last_datetime:'',picture_count:0,upload_count:0,shootinglistNo:'' };
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
  
  localStrage.getPicture(directory, filename, function(result) {
    // 読み込んだテキストをJSON形式に変換
    var text = result;
    var k = JSON.parse(text);
    
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
    // jsonオブジェクトに変換
    var json_out  = JSON.stringify(json_text);
    blob = new Blob( [json_out], {type:"JSON\/javascript"} );
    // デバイスローカル(documentsDirectory)に保存
    localStrage.saveBlobFile(directory, filename, blob, function(url){
      _log(1,'localStrage.setInformationHeader','update normalend');
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
    // jsonオブジェクトに変換
    var json_out  = JSON.stringify(json_text);
    blob = new Blob( [json_out], {type:"JSON\/javascript"} );
    // デバイスローカル(documentsDirectory)に保存
    localStrage.saveBlobFile(directory, filename, blob, function(url){
      _log(1,'localStrage.setInformationHeader','new normalend');
    });
  });
};

// 2018/01/27 ADD -----↓
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// localStrage.removeDirectory()
// 指定したフォルダを削除する
// 正常に削除ができた場合、削除するフォルダが無かった場合はnullをコールバック
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localStrage.removeDirectory = function(localFolder, callback) {
  _log(1,'function','localStrage.removeDirectory('+localFolder+')');

  // iosはDocuments配下のクラウド非同期フォルダに保存
//  var folderurl = cordova.file.documentsDirectory + 'NoCloud/';
  var folderurl = cordova.file.documentsDirectory + localFolder;
  
  // dataDirectoryフォルダのDirectoryEntryオブジェクトを取得
  window.resolveLocalFileSystemURL(folderurl, 
    function(directoryEntry) {
      // 指定されたフォルダを削除する
      directoryEntry.removeRecursively(
        function() {
          callback(null);
        },
        function(e){
          _errorlog(1,'localStrage.removeDirectory()', e.code+'-> '+folderurl);
          callback(e.code);
        }
      );
    },
    function(e) {
      _log(1,'localStrage.removeDirectory()', 'Folder Nothing -> '+folderurl);
      callback(null);
    }
  );
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
