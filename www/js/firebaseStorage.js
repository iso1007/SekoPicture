var firebaseStorage = function() {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// firebaseStorage.fileUpload()
// firebaseStorageへファイルをアップロード
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
firebaseStorage.fileUpload = function(directory, fileName, src, normal_callback) {
  _log(1,'function','firebaseStorage.fileUpload('+directory+'/'+fileName+')');

  // ローカルファイルをfirebaseStrageにコピー
  // firebaseStrageにUID付きで保存   
  var uid = firebase.auth().currentUser.uid;
  fileName = uid + '/' + directory + '/' + fileName;

  // ストレージオブジェクト作成
  var storageRef = firebase.storage().ref();
  var mountainsRef = storageRef.child(fileName);

  var text = fileName.split('.');
  if(text[1] === 'jpg') {
    // 拡張子がjpgの場合はblob型に変換
    var blob = _Base64toBlob(src);
    var uploadTask = mountainsRef.put(blob);
  }else{
    var uploadTask = mountainsRef.putString(src);
  };

  // ステータスを監視
  uploadTask.on('state_changed', function(snapshot) 
  {
  }, function(err) {
       alert(err);
  }, function() {
       // 正常にアップロードを完了した場合はコールバックを返す
       normal_callback(null);
  });
};    

// 2018/01/30 ADD ----- ↓
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// firebaseStorage.fileDownload()
// firebaseStorageからローカルフォルダにファイルをダウンロード
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
firebaseStorage.fileDownload = function(firebaseFolder, localFolder, fileName) {
  _log(1,'function','firebaseStorage.fileDownload('+firebaseFolder+' => '+localFolder+' : '+fileName+')');
  
  // ストレージオブジェクト作成
  var starsRef = firebase.storage().ref().child(localFolder+fileName);

  // firbase StoraeからURLを取得
  starsRef.getDownloadURL().then(function(url) {

    // urlのファイルをローカルストレージに保存
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.onload = function(event) {
      var blob = xhr.response;
      // デバイスローカル(documentsDirectory/localFolder)に保存
      localStrage.saveBlobFile(firebaseFolder, fileName, blob, function() {
        _log(1,'function','firebaseStorage.fileDownload() Download OK');
      });
      
    };
    xhr.open('GET', url);
    xhr.send();
  });  
};
// 2018/01/30 ADD ----- ↑

// 2018/01/30 DEL ----- ↓
//// 2018/01/15 ADD ----- ↓
////_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
//// firebaseStorage.commonShapeDownload()
//// firebaseStorageから共通の略図をダウンロード
////_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
//firebaseStorage.commonShapeDownload = function() {
//  _log(1,'function','firebaseStorage.commonShapeDownload()');
//  
//  // 2018/01/27 ADD -----↓
//  // 一旦、ローカル内の略図フォルダを削除する
//  var localFolder = 'CommonShape';
//  localStrage.removeDirectory(localFolder, 
//    function(status) {
//      if(status !== null){
//        return;
//      }
//    }
//  );
//  // 2018/01/27 ADD -----↑
//  
//  // ローカルファイルをfirebaseStrageにコピー
//  // firebaseStrageにUID付きで保存   
//  var uid = firebase.auth().currentUser.uid;
//  
//  // ローカルストレージから読み込み
//  var str = localStrage.getItems('firebase:group00/CommonShape');
//  
//  // 読み込んだテキストをJSON形式に変換
//  var json = JSON.parse(str);
//
//  $.each( json, function(key,val) {
//    // ダウンロードファイルのパスを作成
//    var storageFolder = uid + '/' + commonShapeFolderName + '/';
//    var fileName = key + val;
//    // ダウンロード処理
//    firebaseStorage.shapeFileDownload(storageFolder, fileName);
//  });
//};

//// 2018/01/15 ADD ----- ↓
////_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
//// firebaseStorage.shapeFileDownload()
//// firebaseStorageから略図をダウンロード
////_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
//firebaseStorage.shapeFileDownload = function(storageFolder, fileName) {
//  _log(1,'function','firebaseStorage.shapeFileDownload()');
//  
//  // ストレージオブジェクト作成
//  var starsRef = firebase.storage().ref().child(storageFolder+fileName);
//
//  // firbase StoraeからURLを取得
//  starsRef.getDownloadURL().then(function(url) {
//
//    // urlのファイルをローカルストレージに保存
//    var xhr = new XMLHttpRequest();
//    xhr.responseType = 'blob';
//    xhr.onload = function(event) {
//      var blob = xhr.response;
//      // デバイスローカル(documentsDirectory/CommonShape)に保存
//      localStrage.saveBlobFile(commonShapeFolderName, fileName, blob, function() {
//        _log(1,'function','firebaseStorage.shapeFileDownload() shapeFile normal Download');
//      });
//      
//    };
//    xhr.open('GET', url);
//    xhr.send();
//  });  
//};
// 2018/01/30 DEL ----- ↑
