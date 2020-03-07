var pictureUpload = function() {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureUpload.checkPicture()
// 工事写真一覧のアイテムをループして、未処理の写真をアップロード
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureUpload.checkPicture = function() {
  _log(1,'function','pictureUpload.checkPicture()');

  if(activeuser.uid === '') {
    _alert('現在はオフラインの為、アップロードは出来ません。\nネットワークに接続し、ログオンをしてから実行してください。');
    return;
  }

  // 工事写真一覧からアイテムを取得
  var koujiname = $('#koujiListItemName').text();
  var listItem = $('#koujiPictureList').children('ons-list-item');
  if(listItem.length == 0) {
    listItem = $('#koujiPictureList').children('li');
  }
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

  // スリープモードを停止
  try {
    window.powerManagement.acquire();
  } catch(e) {
  }	

  $('#upload-dlg').show();

  $('#upload-dlg-mesage').text('アップロード中です。');
  $('#upload-dlg-progress').show();
  $('#upload-dlg-button').hide();

  // iosはDocuments/クラウド非同期フォルダ/工事名フォルダを参照
  var folderurl = localStorageDirectory + koujiname;
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
    var uploadStatusArray = new Array();

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
        uploadStatusArray.push(firebaseStorage.fileUpload(koujiname, jpgfile, src));
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
          // 写真ファイルのソースを取得
          src = await localFile.getTextFile(file);
          // 写真情報ファイル更新の為にfileWriterを取得
          fileWriter = await localFile.getFileWriter(fileEntry);
          // 写真情報ファイルのアップロード済みフラグを更新
          ret = await pictureUpload.infomationFileUpdate(fileWriter, src);
          // 写真ファイルのソースを取得
          src = await localFile.getTextFile(file);
          // 写真ファイルのアップロード
          uploadStatusArray.push(firebaseStorage.fileUpload(koujiname+'/information', infofile, src));
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

      // 黒板の背景画像ファイルをアップロード
      if(!errorFlg) {
        try {
          jpgfile = filename + '.jpg';
          // ディレクトリエントリーとファイルのパスからfileEntryオブジェクトを取得
          fileEntry = await localFile.getFileEntry(directoryEntry, 'clipping/'+jpgfile);
          // ファイルエントリーオブジェクトからfileオブジェクトを取得
          file = await localFile.getFileObject(fileEntry);
          // 黒板の背景画像ファイルのアップロード
          src = await localFile.getBlobFile(file);
          // ファイルのアップロード
          uploadStatusArray.push(firebaseStorage.fileUpload(koujiname+'/clipping', jpgfile, src));
        } catch(e) {
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
      ret = await pictureUpload.controlFileUpdate(fileWriter, src, pictureAllCount, '0');
    } catch(e) {
      var msg = '';
      if(e.code !== undefined) {msg = e.code;}
      if(e.message !== undefined) {msg = e.message;}
      _alert('写真情報管理データの更新に失敗しました。('+infofile+' : '+msg+')');
    }

    $('#upload-dlg-progress').hide();
		$('#upload-dlg-mesage').text('しばらくお待ちください。');

    // pending状態のPromiseが全て完了してから終了メッセージを表示
    Promise.all(uploadStatusArray).then(function(results) {
      // 工事写真管理ファイルの件数情報更新
      uploadEndMessage('アップロードが終了しました。');
    })
    .catch( function () {
      uploadEndMessage('一つ以上の写真がアップロードに失敗しました。');
    });

    function uploadEndMessage(msg) {
      // 工事写真管理ファイルの件数情報更新
      $('#upload-dlg-progress').hide();

      $('#upload-dlg-mesage').text(msg);
      $('#upload-dlg-button').show();

      // 工事一覧の件数表示を更新し、アイコンの色を青にする
      var koujiListCountId = $('#koujiListCountId').text();
      $('#'+koujiListCountId).text(pictureAllCount);
      $('#'+koujiListCountId).css('background-color', 'Blue');
    }
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
pictureUpload.controlFileUpdate = function(fileWriter, src, count, flg) {
  return new Promise(function(resolve, reject) {
    // 工事写真の管理ファイルを読み込み
    var json_text = JSON.parse(src);
    if(flg === '0') {
      json_text.picture_count = count;
      json_text.upload_count  = count;
    }
    if(flg === '-1') {
      json_text.picture_count--;
    }
    if(flg === '+1') {
      json_text.picture_count++;
    }

    var json = JSON.stringify(json_text);
    var blob = new Blob( [json], {type:"JSON\/javascript"} );

    fileWriter.onwriteend = function(e) {
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
pictureUpload.reset = async function() {
  _log(1,'function','pictureUpload.reset()');

  var koujiname = $('#koujiListItemName').text();
  // 表示形式がリスト形式かタイル形式か
  var elm = '';
  if(koujiPictureListViewStyle === 'list') {
    elm = 'ons-list-item';
  }else{
    elm = 'li';
  }
  // 写真の枚数を取得
  var listItem = $('#koujiPictureList').children(elm);
  var pictureAllCount = listItem.length;

  if(pictureAllCount === 0) {
    _information('リセットする写真がありません。');
    return;
  }

  // アップロード済み写真をカウント
  var pictureListArray = new Array();
  var resetMaxCount = 0;
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
    return;
  }

  // リセット中にスリープモードにならないように、スリープモードを停止
  try {
    window.powerManagement.acquire();
  } catch(e) {
  }

  $('#upload-dlg').show();

  $('#upload-dlg-mesage').text('リセット中です。');
  $('#upload-dlg-progress').show();
  $('#upload-dlg-button').hide();

  // iosはDocuments/クラウド非同期フォルダ/工事名フォルダを参照
  var folderurl = localStorageDirectory + koujiname;
  var directoryEntry = null;
  try {
    // directoryEntryオブジェクトを取得
    directoryEntry = await localFile.getFileSystemURL(folderurl);
  } catch(e) {
    _alert('写真一覧情報が取得できませんでした。'+e.code);
  }

  if(directoryEntry !== null) {
    var filename = '', infofile = '';
    var fileEntry = null, file = null, src = null, ret = null, fileWriter = null;
    var errorFlg = false;
    var progressValue = 0, resetCount = 0;

    for(var i = 0; i < resetMaxCount; i++) {
      try {
        filename = pictureListArray[i];
        infofile = filename + '.json';
        // ディレクトリエントリーとファイルのパスからfileEntryオブジェクトを取得
        fileEntry = await localFile.getFileEntry(directoryEntry, 'information/'+infofile);
        // ファイルエントリーオブジェクトからfileオブジェクトを取得
        file = await localFile.getFileObject(fileEntry);
        // 写真情報ファイルのソースを取得
        src = await localFile.getTextFile(file);
        // 写真情報ファイル更新の為にfileWriterを取得
        fileWriter = await localFile.getFileWriter(fileEntry);
        // 写真情報ファイルのアップロード済みフラグを未送信に更新
        ret = await pictureUpload.infomationFileReset(fileWriter, src);
      } catch(e) {
        if(!errorFlg) {
          var msg = '';
          if(e.code !== undefined) {msg = e.code;}
          if(e.message !== undefined) {msg = e.message;}
          _alert('写真情報ファイルのリセットに失敗しました。('+infofile+' : '+msg+')');
          errorFlg = true;
        }
      }

      if(!errorFlg) {
        resetCount++;

        // プログレスバーの位置計算
        progressValue = Math.ceil(resetCount/resetMaxCount*100);
        $('#upload-dlg-progress').attr('value',String(progressValue));
        $('#upload-dlg-counter').text(resetCount+'/'+resetMaxCount);

        // 写真毎のアップロード完了アイコンを青で表示する
        $('#upload-icon'+filename).attr('icon', 'ion-android-more-horizontal');
        $('#upload-icon'+filename).css('color', 'darkorange');
      }
    }
    try {
      // 工事写真管理ファイルを更新
      infofile = 'control' + '.json';
      // ディレクトリエントリーとファイルのパスからfileEntryオブジェクトを取得
      fileEntry = await localFile.getFileEntry(directoryEntry, 'information/'+infofile);
      // 写真情報管理ファイル更新の為にfileWriterを取得
      fileWriter = await localFile.getFileWriter(fileEntry);
      // ファイルエントリーオブジェクトからfileオブジェクトを取得
      file = await localFile.getFileObject(fileEntry);
      // 写真情報管理ファイルの読み込み
      src = await localFile.getTextFile(file);
      // 写真情報管理ファイルのアップロード済み件数をリセット
      ret = await pictureUpload.controlFileReset(fileWriter, src);
    } catch(e) {
      var msg = '';
      if(e.code !== undefined) {msg = e.code;}
      if(e.message !== undefined) {msg = e.message;}
      _alert('写真情報管理ファイルの更新に失敗しました。('+infofile+' : '+msg+')');
    }

    // 工事写真管理ファイルの件数情報更新
    $('#upload-dlg-progress').hide();
    $('#upload-dlg-mesage').text('リセットが終了しました。');
    $('#upload-dlg-button').show();

    // 工事一覧の件数表示を更新し、アイコンの色をオレンジ色にする
    var koujiListCountId = $('#koujiListCountId').text();
    $('#'+koujiListCountId).text(pictureAllCount);
    $('#'+koujiListCountId).css('background-color', 'darkorange');
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureUpload.infomationFileReset()
// 工事写真情報ファイルのアップロードフラグをリセット
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureUpload.infomationFileReset = function(fileWriter, src) {
  _log(1,'function','pictureUpload.infomationFileReset()');

  return new Promise(function(resolve, reject) {
    var json_text = JSON.parse(src);
    json_text.upload = 'Untreated'; // 未送信
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
// pictureUpload.controlFileReset()
// 工事写真の管理ファイルのアップデート写真枚数情報をリセット
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureUpload.controlFileReset = function(fileWriter, src) {
  _log(1,'function','pictureUpload.controlFileReset()');

  return new Promise(function(resolve, reject) {
    var json_text = JSON.parse(src);
    json_text.upload_count  = 0;
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
// pictureUpload.uploadDlgHide()
// 工事写真のアップロードダイアログの消去
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureUpload.uploadDlgHide = function() {
  _log(1,'function','pictureUpload.uploadDlgHide()');

  // スリープモードを再開
  try {
  	window.powerManagement.release();
  } catch(e) {
  }

  // firebaseDatabaseの工事情報を更新
  var koujiname = $('#koujiListItemName').text();
  setFirebaseKoujiinfo(koujiname);

  // 工事一覧に戻る
  koujiPictureListTokoujiList();
};
