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
      
      $('#upload-dlg').show();
      
      $('#upload-dlg-mesage').text('アップロード中です。');
      $('#upload-dlg-progress').show();
      $('#upload-dlg-button').hide();

      // 写真リストをループ
      var koujiPictureUploadIntervalId = -1;
        
      // iosはDocuments/クラウド非同期フォルダ/工事名フォルダを参照
//      var folderurl = cordova.file.documentsDirectory+'NoCloud/'+koujiname;
      var folderurl = cordova.file.documentsDirectory + koujiname;
  
      // dataDirectoryフォルダのDirectoryEntryオブジェクトを取得
      window.resolveLocalFileSystemURL(folderurl,
        // (resolveLocalFileSystemURL)成功時のコールバック関数
        function getdirectoryEntry(directoryEntry) {
          
          filename = '';
          var i = 0;
          var uploadCount = 0;

          // ファイル名毎のループ処理
          var intervalLoop = function(){
            if(i < pictureListArray.length) {
              
              filename = pictureListArray[i];
              i++;

              // 写真・情報ファイルのアッロードを実行する
              pictureUpload.fileUpload(directoryEntry, koujiname, filename, function(){
                uploadCount++;
              
                // プログレスバーの位置計算
                var progressValue = Math.ceil(uploadCount/uploadMaxCount*100); 
                $('#upload-dlg-progress').attr('value',String(progressValue));
                $('#upload-dlg-counter').text(uploadCount+'/'+uploadMaxCount);

                // 写真毎のアップロード完了アイコンを青で表示する
                $('#upload-icon'+filename).attr('icon', 'ion-android-cloud-done');
                $('#upload-icon'+filename).css('color', 'Blue');

                // 全てのアップロードを実行したら終了処理を行う
                if(uploadCount === uploadMaxCount) {
                  // ループ処理を終了する
                  clearInterval(koujiPictureUploadIntervalId);
                  
                 // 工事写真管理ファイルの件数情報更新
                 $('#upload-dlg-progress').hide();

                 $('#upload-dlg-mesage').text('アップロードが終了しました。');
                 $('#upload-dlg-button').show();
                }
              });
            }  
          };
          // 1000ミリ秒毎に１件づつアップロードを繰りまえす
          koujiPictureUploadIntervalId = setInterval(intervalLoop, 1000);

          // control.jsonファイルのアップデート件数情報を更新するする
          pictureUpload.controlUpdate(directoryEntry, pictureAllCount);
        },
        function fail(e) {
          _errorlog(1,'pictureUpload.checkPicture()',e.code+'->'+koujiname);
        }
      );
              
      // 工事一覧の件数表示を更新し、アイコンの色を青にする
      var koujiListCountId = $('#koujiListCountId').text();
      $('#'+koujiListCountId).text(pictureAllCount);
      $('#'+koujiListCountId).css('background-color', 'Blue');
      
    }  
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureUpload.fileUpload()
// 工事写真のアイテムをアップロード
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureUpload.fileUpload = function(directoryEntry, koujiname, filename, normal_callback) {    
  _log(1,'function','pictureUpload.fileUpload('+koujiname+','+filename+')');
  
  // 工事写真をアップロード
  var jpgfile = filename + '.jpg'; 
  // 一覧からファイル名を取得
  directoryEntry.getFile(jpgfile, null, 
    function getFile(fileEntry) {
      // Fileオブジェクトを取得
      fileEntry.file(
        function addPicture(file) {
          var reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = function(e) {
            
            // ファイルのアップロード
            firebaseStorage.fileUpload(koujiname, jpgfile, e.target.result);  
          };
        },
        function fail(e) {
          _errorlog(1,'pictureUpload.fileUpload()',e.code+'->'+jpgfile);
        }
      );
    },
    function fail(e) {
      _errorlog(1,'pictureUpload.fileUpload()',e.code+'->'+jpgfile);
    }
  );

/* functionsによってサーバーで作成する為に削除 2018/01/12
  // サムネイル用縮小写真をアップロード
  jpgfile = filename + '.jpg'; 
  // 一覧からファイル名を取得
  directoryEntry.getFile('thumbnail/'+jpgfile, null, 
    function getFile(fileEntry) {
    // Fileオブジェクトを取得
      fileEntry.file(
        function addPicture(file) {
          var reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = function(e) {
            
            // ファイルのアップロード
            firebaseStorage.fileUpload(koujiname+'/thumbnail', jpgfile, e.target.result);  
          };
        },
        function fail(e) {
          _errorlog(1,'pictureUpload.fileUpload()',e.code+'->thumbnail/'+jpgfile);
        }
      );
    },
    function fail(e) {
      _errorlog(1,'pictureUpload.fileUpload()',e.code+'->thumbnail/'+jpgfile);
    }
  );
*/

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
            
            // ファイルのアップロード
            firebaseStorage.fileUpload(koujiname+'/information', infofile, reader.result, function() {

              // 写真情報ファイルをjson形式に変換
              var json_text = JSON.parse(reader.result);
              
              // firebaseDatabaseの写真リストに追加
              // functionsによってサーバーで作成する為に削除 2018/01/12
              //setFirebasePictureList(koujiname, filename, json_text);
              
              // ローカルにある写真情報ファイルにアップロード済みフラグをセット
              json_text.upload = 'Already'; // 処理済み
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
                  _errorlog(1,'pictureUpload.fileUpload()',e.code+'->information/'+infofile);
                }
              );
              
            });  
          };
        },
        function fail(e) {
          _errorlog(1,'pictureUpload.fileUpload()',e.code+'->information/'+infofile);
        }
      );
    },
    function fail(e) {
      _errorlog(1,'pictureUpload.fileUpload()',e.code+'->information/'+infofile);
    }
  );
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureUpload.controlUpdate()
// 工事写真の管理ファイルの写真枚数情報を更新
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureUpload.controlUpdate = function(directoryEntry, count) {
  _log(1,'function','pictureUpload.controlUpdate()');
  
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
            if(count === -1) {
              json_text.picture_count--;
              // アップロード済みの写真は削除できなくした
//            json_text.upload_count--;
            }else{
              json_text.picture_count = count;
              json_text.upload_count  = count;
            }
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
                _errorlog(1,'pictureUpload.controlUpdate()',e.code+'->information/'+infofile);
              }
            );
          };
        },
        function fail(e) {
          _errorlog(1,'pictureUpload.controlUpdate()',e.code+'->information/'+infofile);
        }
      );
    },
    function fail(e) {
      _errorlog(1,'pictureUpload.controlUpdate()',e.code+'->information/'+infofile);
    }
  );
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
  _log(1,'function','controlReset.controlUpdate()');
  
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
