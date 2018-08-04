var pictureUpload = function() {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureUpload.checkPicture()
// 工事写真一覧のアイテムをループして、未処理の写真をアップロード
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureUpload.checkPicture = function() {
  _log(1,'function','pictureUpload.checkPicture()');

  if(activeuser.uid === '') {
    _alert('現在はオフラインの為、アップロードは出来ません。\nネットワークに接続し、ログオンをしてから実行してください。');
    exit;
  }

  // 工事写真一覧からアイテムを取得
  var koujiname = $('#koujiListItemName').text();
  var listItem = $('#koujiPictureList').children('ons-list-item');
  var pictureAllCount = listItem.length;

  _log(2,'pictureUpload.checkPicture','listItem.length: '+pictureAllCount);

  var pictureListArray = new Array();

  if(pictureAllCount === 0) {
    _information('アップロードすべき写真がありません。');
  }else{
    var uploadMaxCount = 0;
    for(var i=0; i<pictureAllCount; i++) {
      var itemname = listItem.eq(i).attr('id');
      var filename = itemname.replace( 'listItem' , '');
      var upload   = $('#upload'+filename).text();

      if(upload === 'Untreated') {
        uploadMaxCount++;
        pictureListArray.push(filename);
      }
    }

    _log(2,'pictureUpload.checkPicture','uploadMaxCount: '+uploadMaxCount);

    if(uploadMaxCount === 0) {
      _information('全てアップロード済みです。');
    }else{
      pictureUpload.pictureFileEntrysLoop(koujiname, pictureListArray, pictureAllCount);
//      pictureFileEntrysLoop(koujiname, pictureListArray, pictureAllCount);
    }
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureFileEntrysLoop(koujiname, pictureListArray)
// ディレクトリ内のフォルダをループして写真をアップロードする(同期処理)
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureUpload.pictureFileEntrysLoop = async function(koujiname, pictureListArray, pictureAllCount) {
//async function pictureFileEntrysLoop(koujiname, pictureListArray, pictureAllCount) {
  _log(1,'function','pictureFileEntrysLoop('+koujiname+')');

  $('#upload-dlg').show();

  $('#upload-dlg-mesage').text('アップロード中です。');
  $('#upload-dlg-progress').show();
  $('#upload-dlg-button').hide();

  // iosはDocuments/クラウド非同期フォルダ/工事名フォルダを参照
  var folderurl = cordova.file.documentsDirectory + koujiname;
  var directoryEntry = null;
  try {
    // directoryEntryオブジェクトを取得
    directoryEntry = await localFile.getFileSystemURL(folderurl);
  } catch(e) {
    _alert('工事一覧情報が取得できませんでした。'+e.code);
  }

  if(directoryEntry !== null) {

    var filename = '',jpgfile = ''; infofile = '';
    var fileEntry = null, file = null, src = null, ret = null; fileWriter = null;

    var uploadCount = 0, progressValue = 0;
    var uploadMaxCount = pictureListArray.length;

    for(var i=0; i<pictureListArray.length; i++) {
      filename = pictureListArray[i];

      var errorFlg = false;
      // 工事写真ファイルをアップロード
      try {
        jpgfile = filename + '.jpg';
        // ディレクトリエントリーとファイルのパスからfileEntryオブジェクトを取得
        fileEntry = await localFile.getFileEntry(directoryEntry, jpgfile);
        // ファイルエントリーオブジェクトからfileオブジェクトを取得
        file = await localFile.getFileObject(fileEntry);
        // 写真ファイルのアップロード
        src = await localFile.getBlobFile(file);
        // ファイルのアップロード
        ret = await firebaseStorage.fileUpload(koujiname, jpgfile, src);
      } catch(e) {
        if(!errorFlg) {
          var msg = '';
          if(e.code !== undefined) {msg = e.code;}
          if(e.message !== undefined) {msg = e.message;}
          _alert('写真データのアップロードに失敗しました。('+jpgfile+' : '+msg+')');
          errorFlg = true;
        }
      }

      // 工事写真情報ファイルをアップロード
      if(!errorFlg) {
        try {
          infofile = filename + '.json';
          // ディレクトリエントリーとファイルのパスからfileEntryオブジェクトを取得
          fileEntry = await localFile.getFileEntry(directoryEntry, 'information/'+infofile);
          // ファイルエントリーオブジェクトからfileオブジェクトを取得
          file = await localFile.getFileObject(fileEntry);
          // 写真ファイルのアップロード
          src = await localFile.getTextFile(file);
          // ファイルのアップロード
          ret = await firebaseStorage.fileUpload(koujiname+'/information', infofile, src);
          // 写真情報ファイル更新の為にfileWriterを取得
          fileWriter = await localFile.getFileWriter(fileEntry);
          // 写真情報ファイルのアップロード済みフラグを更新
          ret = await pictureUpload.infomationFileUpdate(fileWriter, src);
        } catch(e) {
          if(!errorFlg) {
            var msg = '';
            if(e.code !== undefined) {msg = e.code;}
            if(e.message !== undefined) {msg = e.message;}
            _alert('写真情報データのアップロードに失敗しました。('+infofile+' : '+msg+')');
            errorFlg = true;
          }
        }
      }

      if(!errorFlg) {
        uploadCount++;

        // プログレスバーの位置計算
        progressValue = Math.ceil(uploadCount/uploadMaxCount*100);
        $('#upload-dlg-progress').attr('value',String(progressValue));
        $('#upload-dlg-counter').text(uploadCount+'/'+uploadMaxCount);

        // 写真毎のアップロード完了アイコンを青で表示する
        $('#upload-icon'+filename).attr('icon', 'ion-android-cloud-done');
        $('#upload-icon'+filename).css('color', 'Blue');
      }
    };

    try {
      // 工事写真の管理ファイルを更新
      infofile = 'control' + '.json';
      // ディレクトリエントリーとファイルのパスからfileEntryオブジェクトを取得
      fileEntry = await localFile.getFileEntry(directoryEntry, 'information/'+infofile);
      // 写真情報ファイル更新の為にfileWriterを取得
      fileWriter = await localFile.getFileWriter(fileEntry);
      // ファイルエントリーオブジェクトからfileオブジェクトを取得
      file = await localFile.getFileObject(fileEntry);
      // 写真情報管理ファイルの読み込み
      src = await localFile.getTextFile(file);
      // 写真情報ファイルのアップロード済みフラグを更新
      ret = await pictureUpload.controlFileUpdate(fileWriter, src, pictureAllCount);
    } catch(e) {
      var msg = '';
      if(e.code !== undefined) {msg = e.code;}
      if(e.message !== undefined) {msg = e.message;}
      _alert('写真情報管理データの更新に失敗しました。('+infofile+' : '+msg+')');
    }

    // 工事写真管理ファイルの件数情報更新
    $('#upload-dlg-progress').hide();

    $('#upload-dlg-mesage').text('アップロードが終了しました。');
    $('#upload-dlg-button').show();

    // 工事一覧の件数表示を更新し、アイコンの色を青にする
    var koujiListCountId = $('#koujiListCountId').text();
    $('#'+koujiListCountId).text(pictureAllCount);
    $('#'+koujiListCountId).css('background-color', 'Blue');
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureUpload.infomationFileUpdate()
// 写真情報ファイルのアップロード済みフラグを更新
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureUpload.infomationFileUpdate = function(fileWriter, src) {
  return new Promise(function(resolve, reject) {
    var json_text = JSON.parse(src);
    json_text.upload = 'Already'; // 処理済み
    var json  = JSON.stringify(json_text);
    var blob = new Blob( [json], {type:"JSON\/javascript"} );

    fileWriter.onwriteend = function(e) {
      resolve(null);
    };

    fileWriter.onerror = function(e) {
      reject(e);
    };

    fileWriter.write(blob);
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureUpload.controlFileUpdate()
// 写真管理情報(control.json)ファイルをアップロード
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureUpload.controlFileUpdate = function(fileWriter, src, count) {
  return new Promise(function(resolve, reject) {
    // 工事写真の管理ファイルを読み込み
    var json_text = JSON.parse(src);
    if(count === -1) {
      json_text.picture_count--;
    }else{
      json_text.picture_count = count;
      json_text.upload_count  = count;
    }

    var json = JSON.stringify(json_text);
    var blob = new Blob( [json], {type:"JSON\/javascript"} );

    fileWriter.onwriteend = function(e) {
      // firebaseDatabaseの工事情報を更新
      setFirebaseKoujiinfo(json_text);
      resolve(null);
    };

    fileWriter.onerror = function(e) {
      reject(e);
    };

    // ファイルの書き込み処理
    fileWriter.write(blob);
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureUpload.reset()
// 工事写真のアップロードをリセット
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureUpload.reset = function() {
  _log(1,'function','pictureUpload.reset()');
  
  var koujiname = $('#koujiListItemName').text();
  var listItem = $('#koujiPictureList').children('ons-list-item');
  var pictureAllCount = listItem.length;

  var pictureListArray = new Array();
  var resetMaxCount = 0;
  
  if(pictureAllCount === 0) {
    _information('リセットする写真がありません。');
  }else{
    for(var i=0; i<pictureAllCount; i++) {
      var itemname = listItem.eq(i).attr('id');
      var filename = itemname.replace( 'listItem' , '');
      var upload   = $('#upload'+filename).text();

      if(upload === 'Already') {
        resetMaxCount++;
        pictureListArray.push(filename);
      }
    }
    if(resetMaxCount === 0) {
      _information('リセットする写真がありません。');
    }else{
    
      
      $('#upload-dlg').show();
      
      $('#upload-dlg-mesage').text('リセット中です。');
      $('#upload-dlg-progress').show();
      $('#upload-dlg-button').hide();

      // 写真リストをループ
      var koujiPictureResetIntervalId = -1;
      
      var folderurl = cordova.file.documentsDirectory + koujiname;
  
      // dataDirectoryフォルダのDirectoryEntryオブジェクトを取得
      window.resolveLocalFileSystemURL(folderurl,
        // (resolveLocalFileSystemURL)成功時のコールバック関数
        function getdirectoryEntry(directoryEntry) {
          
          filename = '';
          var i = 0;
          var resetCount = 0;

          // ファイル名毎のループ処理
          var intervalLoop = function(){
            if(i < pictureListArray.length) {
              
              filename = pictureListArray[i];
              i++;

              // 情報ファイルのアッロード情報をリセットする
              pictureUpload.resetInformation(directoryEntry, koujiname, filename, function() {    
                
                resetCount++;
              
                // プログレスバーの位置計算
                var progressValue = Math.ceil(resetCount/resetMaxCount*100); 
                $('#upload-dlg-progress').attr('value',String(progressValue));
                $('#upload-dlg-counter').text(resetCount+'/'+resetMaxCount);

                // 写真毎のアップロード完了アイコンを青で表示する
                $('#upload-icon'+filename).attr('icon', 'ion-android-more-horizontal');
                $('#upload-icon'+filename).css('color', 'darkorange');

                // 全てのアップロードを実行したら終了処理を行う
                if(resetCount === resetMaxCount) {
                  // ループ処理を終了する
                  clearInterval(koujiPictureResetIntervalId);
                  
                 // 工事写真管理ファイルの件数情報更新
                 $('#upload-dlg-progress').hide();

                 $('#upload-dlg-mesage').text('リセットが終了しました。');
                 $('#upload-dlg-button').show();
                }
              });
            }  
          };
          // 1000ミリ秒毎に１件づつアップロードを繰りまえす
          koujiPictureResetIntervalId = setInterval(intervalLoop, 1000);

          // 管理ファイルのアップロード件数を０リセット
          pictureUpload.controlReset(directoryEntry, pictureAllCount);
  
        },
        function fail(e) {
          _errorlog(1,'pictureUpload.reset()',e.code+'->'+koujiname);
        }
      );

      // 工事一覧の件数表示を更新し、アイコンの色をオレンジ色にする
      var koujiListCountId = $('#koujiListCountId').text();
      $('#'+koujiListCountId).text(pictureAllCount);
      $('#'+koujiListCountId).css('background-color', 'darkorange');
      
    }  
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureUpload.uploadDlgHide()
// 工事写真のアップロードダイアログの消去
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureUpload.uploadDlgHide = function() {
  _log(1,'function','pictureUpload.uploadDlgHide()');
  
  // 工事一覧に戻る
  koujiPictureListTokoujiList();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureUpload.resetInformation()
// 工事写真のアイテムをアップロード
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureUpload.resetInformation = function(directoryEntry, koujiname, filename, normal_callback) {    
  _log(1,'function','pictureUpload.resetInformation('+koujiname+','+filename+')');
  
  // 写真情報ファイルをアップロード
  var infofile = filename + '.json'; 
  // 一覧からファイル名を取得
  directoryEntry.getFile('information/'+infofile, null, 
    function getFile(fileEntry) {
    // Fileオブジェクトを取得
      fileEntry.file(
        function addPicture(file) {
          var reader = new FileReader();
          reader.readAsText(file);
          reader.onloadend = function(e) {
            
            // 写真情報ファイルをjson形式に変換
            var json_text = JSON.parse(reader.result);
            // ローカルにある写真情報ファイルにアップロード未フラグをセット
            json_text.upload = 'Untreated';
            var json_out  = JSON.stringify(json_text);

            blob = new Blob( [json_out], {type:"JSON\/javascript"} );
            
            fileEntry.createWriter(
              // (fileEntry.createWriter)の成功
              function success3(fileWriter) {
                // Android: "cdvfile://localhost/files/settings.json"
                // Windows: "cdvfile://localhost/persistent/settings.json"
                // イメージデータの書き込み処理
                fileWriter.write(blob);
                // コールバック
                normal_callback(null);
              },
              function fail(e) {
                _errorlog(1,'pictureUpload.resetInformation()',e.code+'->information/'+infofile);
              }
            );
          };
        },
        function fail(e) {
          _errorlog(1,'pictureUpload.resetInformation()',e.code+'->information/'+infofile);
        }
      );
    },
    function fail(e) {
      _errorlog(1,'pictureUpload.resetInformation()',e.code+'->information/'+infofile);
    }
  );
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureUpload.controlReset()
// 工事写真の管理ファイルのアップデート写真枚数情報をリセット
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureUpload.controlReset = function(directoryEntry, count) {
  _log(1,'function','pictureUpload.controlReset()');
  
  // 工事写真の管理ファイルを更新
  var filename = 'control' + '.json';
  // 一覧からファイル名を取得
  directoryEntry.getFile('information/'+filename, null, 
    function getFile(fileEntry) {
    // Fileオブジェクトを取得
      fileEntry.file(
        function addPicture(file) {
          var reader = new FileReader();
          reader.readAsText(file);
          reader.onloadend = function(e) {
            // 工事写真の管理ファイルを読み込み
            var json_text = JSON.parse(reader.result);
            json_text.picture_count = count;
            json_text.upload_count  = 0;
            var json_out = JSON.stringify(json_text);
  
            blob = new Blob( [json_out], {type:"JSON\/javascript"} );
            
            // firebaseDatabaseの工事情報を更新
            setFirebaseKoujiinfo(json_text);
            
            fileEntry.createWriter(
              // (fileEntry.createWriter)の成功
              function success3(fileWriter) {
                // Android: "cdvfile://localhost/files/settings.json"
                // Windows: "cdvfile://localhost/persistent/settings.json"
                // イメージデータの書き込み処理
                fileWriter.write(blob);
              },
              function fail(e) {
                _errorlog(1,'pictureUpload.controlReset()',e.code+'->information/'+infofile);
              }
            );
          };
        },
        function fail(e) {
          _errorlog(1,'pictureUpload.controlReset()',e.code+'->information/'+infofile);
        }
      );
    },
    function fail(e) {
      _errorlog(1,'pictureUpload.controlReset()',e.code+'->information/'+infofile);
    }
  );
};
