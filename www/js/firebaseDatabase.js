//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// setFirebaseToLocalStrage()
// FirebaseDatabaseからローカルストレージに書き込み
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function setFirebaseToLocalStrage() {
  _log(1,'function','setFirebaseToLocalStrage()');

  var folder = '';
  var json_text = '';

  // firebaseから写真項目をlocalstrageにコピー
  folder = activeuser.uid+"/group00/config/field";
  // UIDフォルダ内の全てのキー・値 を1回だけ読み込む
//  firebase.database().ref(folder).once('value', function(snapshot) {
  // UIDフォルダ内の全てのキー・値 を読み込み、更新をリッスンする
  firebase.database().ref(folder).on('value', function(snapshot) {
    // 読み込んだJSONデータをテキスト形式に変換
    json_text = JSON.stringify(snapshot.val(), '', '    ');
    // ローカルストレージに書き込み
    localStrage.setItems("firebase:group00/config/field",json_text);
  });

  // firebaseから撮影リスト名をlocalstrageにコピー
  folder = activeuser.uid+"/group00/config/shootingList";
  // UIDフォルダ内の全てのキー・値 を1回だけ読み込む
//  firebase.database().ref(folder).once('value', function(snapshot) {
  // UIDフォルダ内の全てのキー・値 を読み込み、更新をリッスンする
  firebase.database().ref(folder).on('value', function(snapshot) {
    // 読み込んだJSONデータをテキスト形式に変換
    json_text = JSON.stringify(snapshot.val(), '', '    ');
    // ローカルストレージに書き込み
    localStrage.setItems("firebase:group00/config/shootingList",json_text);
  });

  // firebaseから黒板設定をlocalstrageにコピー
  if(localStrage.getItems("firebase:group00/config/kokuban")==='{}') {
    folder = activeuser.uid+"/group00/config/kokuban";
    // UIDフォルダ内の全てのキー・値 を1回だけ読み込む
    firebase.database().ref(folder).once('value', function(snapshot) {
      // 読み込んだJSONデータをテキスト形式に変換
      json_text = JSON.stringify(snapshot.val(), '', '    ');
      // ローカルストレージに書き込み
      localStrage.setItems("firebase:group00/config/kokuban",json_text);
    });
  }

  // firebaseから写真設定をlocalstrageにコピー
  if(localStrage.getItems("firebase:group00/config/picture")==='{}') {
    folder = activeuser.uid+"/group00/config/picture";
    // UIDフォルダ内の全てのキー・値 を1回だけ読み込む
    firebase.database().ref(folder).once('value', function(snapshot) {
      // 読み込んだJSONデータをテキスト形式に変換
      json_text = JSON.stringify(snapshot.val(), '', '    ');
      // ローカルストレージに書き込み
      localStrage.setItems("firebase:group00/config/picture",json_text);
    });
  }

  // firebaseから工事一覧リストをlocalstrageにコピー
  folder = activeuser.uid+"/group00/koujiList";
  // UIDフォルダ内の全てのキー・値 を1回だけ読み込む
//  firebase.database().ref(folder).once('value', function(snapshot) {
  // UIDフォルダ内の全てのキー・値 を読み込み、更新をリッスンする
  firebase.database().ref(folder).on('value', function(snapshot) {
    // 読み込んだJSONデータをテキスト形式に変換
    json_text = JSON.stringify(snapshot.val(), '', '    ');
    // ローカルストレージに書き込み
    localStrage.setItems("firebase:group00/koujiList",json_text);
  });

  // 2018/01/30 ADD -----↓
  // 略図ファイルの更新処理
  // iosはDocuments配下のクラウド非同期フォルダに保存
  var folderurl = localStorageDirectory;
  // dataDirectoryフォルダのDirectoryEntryオブジェクトを取得
  window.resolveLocalFileSystemURL(folderurl, function(directoryEntry) {
		// 略図保存用フォルダが無ければ作成
    directoryEntry.getDirectory('CommonShape', { create: true }, function() {

      // firebaseStorageの略図ファイルの追加をリッスン、追加があればローカルドライブにダウンロード
      var firebaseref = activeuser.uid+'/group00/pictureList/'+commonShapeFolderName;
      firebase.database().ref(firebaseref).on('child_added', function(snapshot) {

        // UID/CommonShape/フォルダ名の取得
        var uid = firebase.auth().currentUser.uid;
        var folderName = uid + '/' + commonShapeFolderName + '/';
        // ファイル名の取得
        var fileName = snapshot.key + snapshot.val();

        _log(1,'function','setFirebaseToLocalStrage()['+'child_added : '+fileName+']');

        // firebaseStrageから略図ファイルをダウンロード
        firebaseStorage.fileDownload(commonShapeFolderName, folderName, fileName);
      });

      // firebaseStorageの略図ファイルの削除をリッスン、削除があればローカルドライブからも削除
      var firebaseref = activeuser.uid+'/group00/pictureList/'+commonShapeFolderName;
      firebase.database().ref(firebaseref).on('child_removed', function(snapshot) {

        // CommonShape/フォルダ名の取得
        var folderName = commonShapeFolderName + '/';
        // ファイル名の取得
        var fileName = snapshot.key + snapshot.val();

        _log(1,'function','setFirebaseToLocalStrage()['+'child_removed : '+fileName+']');

        // ローカルストレージからファイルを削除
        localStrage.removeFile(folderName, fileName, function(status) {
//      console.log(status);
        });
      });
  // 2018/01/30 ADD -----↑
    });
	});

  // 2018/01/30 DEL -----↓
  // 2018/01/15 ↓
  // firebaseから略図リスト名をlocalstrageにコピー
//  folder = activeuser.uid+"/group00/pictureList/CommonShape";
//  // UIDフォルダ内の全てのキー・値 を読み込み、更新をリッスンする
//  firebase.database().ref(folder).on('value', function(snapshot) {
//    // 読み込んだJSONデータをテキスト形式に変換
//    json_text = JSON.stringify(snapshot.val(), '', '    ');
//    // ローカルストレージに書き込み
//    localStrage.setItems("firebase:group00/CommonShape",json_text);
////    // 略図ファイルをstorageからローカルにダウンロード
////    firebaseStorage.commonShapeDownload();
//  });
//  // 2018/01/15 ↑
  // 2018/01/30 DEL -----↑
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// setFirebaseKokubanToLocalStrage()
// FirebaseDatabaseの黒板情報をローカルストレージにセット
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function setFirebaseKokubanToLocalStrage() {
  _log(1,'function','setFirebaseKokubanToLocalStrage()');

  // firebaseから黒板情報をlocalstrageにコピー
  folder = "common/kokuban/list";
  // UIDフォルダ内の全てのキー・値 を1回だけ読み込む
  firebase.database().ref(folder).once('value', function(snapshot) {
    // 読み込んだJSONデータをテキスト形式に変換
    json_text = JSON.stringify(snapshot.val(), '', '    ');
    // ローカルストレージに書き込み
    localStrage.setItems("firebase:kokuban/list",json_text);

    Object.keys(snapshot.val()).forEach(function(key) {
      // firebaseから黒板情報をlocalstrageにコピー
      // UIDフォルダ内の全てのキー・値 を1回だけ読み込む
      firebase.database().ref('common/kokuban/'+key).once('value', function(kokuban) {
        // 読み込んだJSONデータをテキスト形式に変換
        json_text = JSON.stringify(kokuban.val(), '', '    ');
        // ローカルストレージに書き込み
        localStrage.setItems('firebase:kokuban/'+key, json_text);
      });
    });
  });
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// setFirebaseKoujiinfo()
// FirebaseDatabaseの工事情報を更新
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function setFirebaseKoujiinfo(json_text) {
  _log(1,'function','setFirebaseKoujiinfo()');

  // control.json からfirebaseDatabaseの工事情報を更新する
  var folder = activeuser.uid+"/group00/koujiList/"+json_text.koujiname;

  // 撮影開始日時･最終撮影日時･写真枚数 情報の更新
  firebase.database().ref(folder).update({
        fastDateTime : json_text.fast_datetime,
        lastDateTime : json_text.last_datetime,
        pictureCount : json_text.picture_count
    });

  // 撮影リスト番号が空白でない場合のみ更新する
  if(json_text.shootinglistNo !== '') {
    setFirebaseShootinglistNo(json_text.koujiname, json_text.shootinglistNo);
  }
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// setFirebaseShootinglistNo()
// FirebaseDatabaseの撮影リスト番号を更新
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function setFirebaseShootinglistNo(koujiname, listNo) {
  _log(1,'function','setFirebaseShootinglistNo('+listNo+')');

  // control.json からfirebaseDatabaseの工事情報を更新する
  var folder = activeuser.uid+"/group00/koujiList/"+koujiname;

  // 撮影リスト番号が空白でない場合のみ更新する
  firebase.database().ref(folder).update({
        shootinglistNo : listNo
    });
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// setFirebaseGeoLocation()
// FirebaseDatabaseの位置情報を更新
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function setFirebaseGeoLocation(koujiname, location) {
  _log(1,'function','setFirebaseGeoLocation('+location+')');

  // control.json からfirebaseDatabaseの工事情報を更新する
  var folder = activeuser.uid+"/group00/koujiList/"+koujiname;

  // 工事の位置情報を更新
  firebase.database().ref(folder).update({
        geoLocation : location
    });
}

/* functionsによってサーバーで作成する為に削除 2018/01/12
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// setFirebasePictureList()
// FirebaseDatabaseの写真リストを更新
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function setFirebasePictureList(koujiname, filename, obj) {
  _log(1,'function','setFirebasePictureList('+koujiname+','+filename+')');

  // infomationフォルダのxx.json からfirebaseDatabaseの工事情報を更新する
  var folder = activeuser.uid+'/group00/pictureList/'+koujiname+'/'+filename;

  // 写真情報を更新する
  firebase.database().ref(folder).update({
        kousyu   : obj.kousyu,
        sokuten  : obj.sokuten,
        hiduke   : obj.hiduke,
        bikou    : obj.bikou,
        syamei   : obj.syamei,
        datetime : obj.datetime
    });
}
*/
