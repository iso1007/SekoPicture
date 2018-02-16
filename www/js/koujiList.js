var koujiPictureListViewIntervalId = -1;
var koujiPictureListSortIndex = 0;

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiListDisplay()
// 撮影後の工事一覧表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function koujiListDisplay() {
  _log(1,'function','koujiListDisplay()');
  
  // iosはDocuments配下のクラウド非同期フォルダに保存
//  var folderurl = cordova.file.documentsDirectory+'NoCloud';
  var folderurl = cordova.file.documentsDirectory;

  // 工事一覧ヘッダー作成
  koujiListHeader();
  // 工事リスト作成用jsonテーブル
  var koujiList = [];
  
  // dataDirectoryフォルダのDirectoryEntryオブジェクトを取得
  window.resolveLocalFileSystemURL(folderurl,
    // (resolveLocalFileSystemURL)成功時のコールバック関数
    function getdirectoryEntry(directoryEntry) {
      // DirectoryReaderを生成
      var directoryReader = directoryEntry.createReader();
      // ディレクトリ内のフォルダ一覧を取得
      directoryReader.readEntries(
        function getFileName(fileEntries) {
            // ディレクトリ内をループ
          var removeCount = 0;
          
          $.each( fileEntries, function() {

            // 'NoCloud'フォルダは処理対象外とする
//            if(this.name === 'NoCloud') {  // 2018/01/25 DEL
            if(this.name === 'NoCloud' || this.name === 'CommonShape') {  // 2018/01/25 ADD
              removeCount++;
              return true;
            }
            
            // ディレクトリ(工事)名から工事情報を取得
            koujiListAddDate(this, directoryEntry, function(koujiInfo) {
              // 工事情報をリストに追加(写真が１枚以上存在する工事のみ)
              if(koujiInfo.picture_count === 0) {
                removeCount++;
              }else{  
                koujiList.push(koujiInfo);
              }

              // 全てのディレクトリの処理が終わった時点で実行
              if( koujiList.length + removeCount === fileEntries.length ) {
                $('#koujiListCount').text(koujiList.length+'件');
                // 工事情報リストを最終撮影日付順･降順にソート
                // ================================================
                // ================================================
                // =========ソート条件は設定可能にする=============
                // ================================================
                // ================================================
                koujiList.sort(function(a,b) {
                  if( a.last_datetime > b.last_datetime ) return -1;
                  if( a.last_datetime < b.last_datetime ) return 1;
                  return 0;
                });
                // 工事情報リストからhtmlを作成
                $.each( koujiList, function(i) {
                  
                  // 写真枚数が1枚以上存在する工事のみ表示
                  if(this.picture_count === undefined) {this.picture_count = 0;}
                  if(this.picture_count > 0) {
                    // 工事リストに撮影日付と写真枚数情報を付加する
                    koujiListHtml(this, i);
                  }
                });
              }
            });
          });
        },
        function fail(e) {
          _errorlog(1,'koujiListDisplay',"getFileName Error: " + e.code);
        }
      );
    },
    // (resolveLocalFileSystemURL)不成功時のコールバック関数
    function fail(e) {
      _errorlog(1,'koujiListDisplay',"getdirectoryEntry Error: " + e.code);
    }
  );
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiListAddDate()
// 工事一覧に日付と枚数情報を表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function koujiListAddDate(fileEntrie, directoryEntry, callback) {
  _log(1,'function','koujiListAddDate('+fileEntrie.name+')');

  var koujiInfo = {picture_count:0};
  var koujiname = fileEntrie.name;
  var infoFile = koujiname + '/information/' + 'control' + '.json';
  
  directoryEntry.getFile(infoFile, null, function getFile(fileEntry) {
    // Fileオブジェクトを取得
    fileEntry.file(function addInfomation(file) {
      
      // Fileオブジェクトの読み込み
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onloadend = function(e) {
        
        // 読み込んだテキストをJSON形式に変換
        var koujiInfo = JSON.parse(reader.result);
        
        // 写真枚数情報が無い場合は0で追加
        if(koujiInfo.picture_count === undefined) { koujiInfo.picture_count = 0; }

        // コールバックで工事情報を戻す
        callback(koujiInfo);
      };
    },
    function fail(e) {
      _errorlog(1,'koujiListAddDate','fileEntry Error('+fileEntrie.name+'): ' + e.code);
      callback(koujiInfo);
    });
  },
  function fail(e) {
    _errorlog(1,'koujiListAddDate','getFile Error('+fileEntrie.name+'): ' + e.code);
    callback(koujiInfo);
  });  
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiListHeader()
// 撮影後の工事一覧のヘッダー表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function koujiListHeader() {
  _log(1,'function','koujiListHeader()');

  // 工事リストのアイテムをクリアする
  $('#koujiListBox').empty();
};      

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiListHtml()
// 撮影後の工事一覧の工事情報表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function koujiListHtml(obj, cnt) {
  _log(1,'function','koujiListHtml()');

  var elm = $('<ons-list-item id="koujiList_item_' + cnt + '" tappable modifier="longdivider" onClick="koujiListItemClick(this)">'+
                '<ons-col width="90%">'+
                  '<ons-row>'+
                    '<ons-col class="textsize5" id="koujiList_name_' + cnt + '"></ons-col>'+
                  '</ons-row>'+
                  '<ons-row>'+
                    '<ons-col class="textsize3" style="color:gray" id="koujiList_date_' + cnt + '"></ons-col>'+
                  '</ons-row>'+
                '</ons-col>'+
                '<ons-col width="10%">'+
                  '<ons-row>'+
                    '<ons-col><span id="koujiList_count_' + cnt + '" class="notification textsize5" style="background-color: darkorange"></span></ons-col>'+
                  '</ons-row>'+
                '</ons-col>'+
              '</ons-list-item>');
  elm.appendTo($('#koujiListBox'));
  
  if(obj.koujiname === undefined) {obj.koujiname = '';}
  if(obj.fast_datetime === undefined) {obj.fast_datetime = '';}
  if(obj.last_datetime === undefined) {obj.last_datetime  = '';}
  if(obj.picture_count === undefined) {obj.picture_count = 0;}
  if(obj.upload_count === undefined) {obj.upload_count = '';}

  $('#koujiList_name_'+cnt).text(obj.koujiname);
  $('#koujiList_date_'+cnt).text('\n' + obj.fast_datetime + ' ～ ' + obj.last_datetime);
  $('#koujiList_count_'+cnt).text(obj.picture_count);
  if(typeof(obj.upload_count) === 'number') {
    // 全てサーバーにアップロード済みの枚数は"青"表示
    // アップロード残がある枚数は"オレンジ"で表示
    if(obj.picture_count === obj.upload_count) {
      $('#koujiList_count_'+cnt).css('background-color', 'Blue');
    }else{
      $('#koujiList_count_'+cnt).css('background-color', 'darkorange');
    }
  }
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiListItemClick()
// 工事一覧のアイテムをクリック
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function koujiListItemClick(obj) {
  _log(1,'function','koujiListItemClick('+$(obj).attr('id')+')');

  var options = {
    // アニメーションの種類
    animation: 'slide',   //'slide', 'lift', 'fade'
    // 画面遷移後に実行されるコールバック
    callback: function() { 
      // クリックをしたアイテムから工事名を取得
      var koujiListItemId = $(obj).attr('id');
      var koujiListNameId = koujiListItemId.replace( 'koujiList_item_' , 'koujiList_name_');
      var koujiListCountId = koujiListItemId.replace( 'koujiList_item_' , 'koujiList_count_');

      // 要素IDから工事名称の取得
      var koujiname = $('#'+koujiListNameId).text();
      // 写真一覧を表示
      koujiListItemSet(koujiname, koujiListCountId);
    }
  };
  
  // 選択された工事の写真一覧を表示
  lstNavigator.pushPage('koujiListItem.html', options);
}  
  
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiListItemSet()
// 工事写真一覧のアイテムをセット
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function koujiListItemSet(koujiname, koujiListCountId) {
  _log(1,'function','koujiListItemSet('+koujiname+','+koujiListCountId+')');
  
  // iosはDocuments/クラウド非同期フォルダ/工事名フォルダを参照
//  var folderurl = cordova.file.documentsDirectory + 'NoCloud/' + koujiname;
  var folderurl = cordova.file.documentsDirectory + koujiname;
  
  // 工事写真一覧のヘッダー作成
  koujiPictureListHeader(koujiname, koujiListCountId);

  var pictureListArray = new Array();
  var pictureUriArray = new Array();  // 2018/01/25 ADD 
  
  // dataDirectoryフォルダのDirectoryEntryオブジェクトを取得
  window.resolveLocalFileSystemURL(folderurl,
    // (resolveLocalFileSystemURL)成功時のコールバック関数
    function getdirectoryEntry(directoryEntry) {
      // DirectoryReaderを生成
      var directoryReader = directoryEntry.createReader();
      // ディレクトリ内のフォルダ一覧を取得
      directoryReader.readEntries(
        function getFileName(fileEntries) {
          
          // ディレクトリ内をループ
          $.each( fileEntries, function(i) {
 
            // 写真ファイルのリストを作成
            var fname = this.name.split('.');
            var filename = fname[0];
            // .jpegファイルのみを処理対象とする
            if(fname[1]==='jpg') {
              pictureListArray.push(filename);
              pictureUriArray.push(this.nativeURL);  // 2018/01/25 ADD 
            }
                
            // リストの作成が完了した時点で実行
            if( pictureListArray.length > 0 && i === fileEntries.length - 1 ) {
              // 写真リストのビューを作成・表示
//              koujiPictureListView(directoryEntry, pictureListArray);// 2018/01/25 DEL
              koujiPictureListView(directoryEntry, pictureListArray,pictureUriArray);  // 2018/01/25 ADD
            }
          });  
        },
        function fail(e) {
          _errorlog(1,'koujiListItemSet()',e.code+'->'+folderurl);
        }
      );
    },
    // (resolveLocalFileSystemURL)不成功時のコールバック関数
    function fail(e) {
      _errorlog(1,'koujiListItemSet()',e.code+'->'+folderurl);
    }
  );
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiPictureListHeader()
// 選択した工事の写真一覧のヘッダー表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function koujiPictureListHeader(koujiname, koujiListCountId) {
  _log(1,'function','koujiPictureListHeader()');

  // 工事リストのアイテムをクリアする
  $('#koujiPictureList').empty();

  // 工事名をセット
  $('#koujiListItemName').text(koujiname);
  // 工事一覧の何番目が選択されたのかID
  $('#koujiListCountId').text(koujiListCountId);
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiPictureListView()
// 選択した工事の写真一覧のヘッダー表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
//function koujiPictureListView(directoryEntry, pictureListArray) {  // 2018/01/25 DEL
function koujiPictureListView(directoryEntry, pictureListArray, pictureUriArray) {  // 2018/01/25 ADD
  _log(1,'function','koujiPictureListView()');
  
  // 写真リストを作成中は非表示にする
  $('#koujiPictureList').hide();

  // 写真をファイル名順(撮影順)に並べ替える
//pictureListArray.sort(function(a,b){
//  if( a < b ) return -1;
//  if( a > b ) return 1;
//  return 0;
//});

  if(pictureListArray.length>20){
    $('#splashModal').show();
  };  

  // 写真リストをループ
  koujiPictureListViewIntervalId = -1;
  var i = 0;
  var intervalLoop = function(){
      
    var filename = pictureListArray[i];
    var uri = pictureUriArray[i];

    // 写真リストのhtmlを作成
//  koujiListAddElement(filename);  // 2018/01/25 DEL
    koujiListAddElement(filename, uri);  // 2018/01/25 ADD
    // htmlにプレビュー･情報を付加
    koujiListAddInfo(directoryEntry, filename);
    // htmlにプレビュー･情報を付加
//  koujiListAddPicture(directoryEntry, filename);  // 2018/01/25 DEL
    
    i++;
    // 写真枚数に達したらループを抜ける
    if(i === pictureListArray.length) {
      clearInterval(koujiPictureListViewIntervalId);
      
      if(koujiPictureListSortIndex<0 && koujiPictureListSortIndex>3){
        koujiPictureListSortIndex = 0;
      }
      // 前回選択したソート順に並べ替える
      koujiPictureSort(koujiPictureListSortIndex);
      
      if(pictureListArray.length>20){
        $('#splashModal').hide();
      };
      
     // 写真リストの表示
      $('#koujiPictureList').show();
    }
    
  };
  // 5ミリ秒間隔でサムネイルを作成
  koujiPictureListViewIntervalId = setInterval(intervalLoop, 5);
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiListAddElement()
// 選択した工事の写真一覧を表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
//function koujiListAddElement(filename) {  // 2018/01/25 DEL
//  _log(1,'function','koujiListAddElement('+filename+')');  // 2018/01/25 DEL
function koujiListAddElement(filename, uri) {  // 2018/01/25 ADD
  _log(1,'function','koujiListAddElement('+filename+' : '+uri+')');  // 2018/01/25 ADD

  // uriをサムネイルフォルダに変換
  var thumbnailuri = uri.replace( filename , 'thumbnail/'+filename);  // 2018/01/25 ADD

  // 工事毎の行を作成
  var elm = $('<ons-list-item id="listItem'+filename+'" tappable modifier="chevron" style="padding:0px 5px;margin-top:-10px" onclick="koujiPictureView(this)">'+
                '<ons-col align="top" width="40%">'+
//                  '<img id="imag'+filename+'" class="thumbnail-s">'+  // 2018/01/25 DEL
                  '<img id="imag'+filename+'" class="thumbnail-s" src="'+thumbnailuri+'">'+  // 2018/01/25 ADD
                '</ons-col>'+
                
                '<ons-col width=" 2%">'+
                  '<p id="upload'+filename+'" style="visibility:hidden"></p>'+
                '</ons-col>'+
                
                '<ons-col width="55%" align="top">'+
                  '<ons-row style="color:blue;">'+
                    '<ons-col width="94%" align="top">'+
                      '<p class="textsize3" id="date'+filename+'" style="margin:0">'+filename+'</p>'+
                    '</ons-col>'+
                    
                    '<ons-col width="6%" align="top">'+
                      '<ons-icon class="iconsize3" id="upload-icon'+filename+'" icon="ion-android-more-horizontal" style="color:darkorange"></ons-icon>'+
                    '</ons-col>'+
                  '</ons-row>'+
                  
                  '<ons-row style="color:gray;">'+
                    '<p class="textsize3" id="kousyu'+filename+'" style="margin:0"></p>'+
                  '</ons-row>'+
                  
                  '<ons-row style="color:gray;">'+
                    '<p class="textsize3" id="sokuten'+filename+'" style="margin:0"></p>'+
                  '</ons-row>'+
                  
                  '<ons-row style="color:black;">'+
                    '<p class="textsize4" id="bikou'+filename+'" style="margin:0"></p>'+
                  '</ons-row>'+
                '</ons-col>'+
              '</ons-list-item>');
  elm.appendTo($('#koujiPictureList'));
} 

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiListAddInfo()
// 写真リストにプレビューと黒板情報を表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function koujiListAddInfo(directoryEntry, filename) {
  _log(1,'function','koujiListAddInfo('+filename+')');

  // 写真リストに写真情報を表示
  var infoFile = 'information/' + filename + '.json';
  directoryEntry.getFile(infoFile, null, 
    function getFile(fileEntry) {
      // Fileオブジェクトを取得
      fileEntry.file(
        function addInfomation(file) {
          var reader = new FileReader();
          reader.readAsText(file);
          reader.onloadend = function(e) {
            // 読み込んだテキストをJSON形式に変換
            var text = reader.result;
            var k = {};
            try {
              var k = JSON.parse(text);
            } catch(e) {
              _errorlog(1,'koujiListAddInfo()',e+'->'+infoFile);
            }

            // 撮影リストでのソートを可能にするためにclassにリストＩＤをセット
            $('#listItem'+filename).attr('class',k.pictureId);
            
            // 撮影日時をセット
            if(k.datetime === undefined) {k.datetime ='';}
            $('#date'+filename).text('撮影:'+k.datetime);
            
            // サーバーへのアップロード状況(未処理:'Untreated'、済み:'Already’)
            if(k.upload === undefined) {k.upload = 'Untreated';}
            $('#upload'+filename).text(k.upload);
            if(k.upload === 'Already') {
              $('#upload-icon'+filename).attr('icon', 'ion-android-cloud-done');
              $('#upload-icon'+filename).css('color', 'Blue');
            }
            // 工種をセット
            if(k.kousyu === undefined) {k.kousyu = '';}
            if(k.kousyu !== '') {
              $('#kousyu'+filename).text('工種:'+k.kousyu);
            }
            
            // 測点をセット
            if(k.sokuten === undefined) {k.sokuten = '';}
            if(k.sokuten !== '') {
              $('#sokuten'+filename).text('測点:'+k.sokuten);
            }
            
            // 備考をセット
            if(k.bikou === undefined) {k.bikou = '';}
            // 改行コードをhtml形式に変換
            k.bikou = k.bikou.replace( /\n/g , '<br>' );
            $('#bikou'+filename).html(k.bikou);
          };
        },
        function fail(e) {
          _errorlog(1,'koujiListAddInfo()',e.code+'->'+infoFile);
        }
      );
    },
    function fail(e) {
      _errorlog(1,'koujiListAddInfo()',e.code+'->'+infoFile);
    }
  );
}

// 2018/01/25 ↓-----DEL
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiListAddPicture()
// 写真リストにプレビューと黒板情報を表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
//function koujiListAddPicture(directoryEntry, filename) {
//  _log(1,'function','koujiListAddPicture('+filename+')');
//
//  // 写真リストにサムネイル画像を表示
//  var jpgfile = 'thumbnail/' + filename + '.jpg'; 
//  // 一覧からファイル名を取得
//  directoryEntry.getFile(jpgfile, null, 
//    function getFile(fileEntry) {
//      // Fileオブジェクトを取得
//      fileEntry.file(
//        function addPicture(file) {
//          var reader = new FileReader();
//          reader.readAsDataURL(file);
//          reader.onloadend = function(e) {
//            // サムネイル画像をセット
//    　　      $('#imag'+filename).attr({"src":e.target.result});
//          };
//        },
//        function fail(e) {
//          _errorlog(1,'koujiListAddPicture()',e.code+'->'+jpgfile);
//        }
//      );
//    },
//    function fail(e) {
//      _errorlog(1,'koujiListAddPicture()',e.code+'->'+jpgfile);
//    }
//  );
//}
// 2018/01/25 ↑-----DEL

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiFilesToolMenu()
// 工事写真一覧のツールメニュー
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function koujiFilesToolMenu(obj) {
  _log(1,'function','koujiFilesToolMenu()');
  
  var tabMenuButtonId = $(obj).attr('id');
  var options = [];
  if(tabMenuButtonId==='pictureListButton-cloud'){
    options = [
      '写真をサーバーにアップロード',
      'アップロードをリセット',
      'キャンセル'
      ];
  }else{
  if(tabMenuButtonId==='pictureListButton-sort'){
    options = [
      '撮影日時が新しい写真から表示',
      '撮影日時が古い写真から表示',
      '撮影項目リストの順番に表示',
      '撮影項目リストの逆順に表示',
      'キャンセル'
    ];
  }}
  
  ons.openActionSheet({
    cancelable: true,
    buttons: options
  }).then(function (index) {
    // クラウドボタンをクリック
    if(tabMenuButtonId==='pictureListButton-cloud'){
      if(index === 0) {
        pictureUpload.checkPicture();
      }
      if(index === 1) {
        pictureUpload.reset();
      }
    }else{
    // ソートボタンをクリック
    if(tabMenuButtonId==='pictureListButton-sort'){
      koujiPictureListSortIndex = index;
      koujiPictureSort(index);
    }}
  });
} 

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiPictureSort()
// 工事写真の表示順を並べ替える
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function koujiPictureSort(index) {
  _log(1,'function','koujiPictureSort('+index+')');

  var items_wrapper = $('#koujiPictureList');
  var items = $('#koujiPictureList ons-list-item');
  switch(index) {
    // 撮影日時が新しい写真から表示
    case 0:
      items.sort(function(a, b){
        if( $(a).attr('id') > $(b).attr('id') ) return 1;
        if( $(a).attr('id') < $(b).attr('id') ) return -1;
        return 0;
      });
  	  break;
    // 撮影日時が古い写真から表示
    case 1:
      items.sort(function(a, b){
        if( $(a).attr('id') > $(b).attr('id') ) return -1;
        if( $(a).attr('id') < $(b).attr('id') ) return 1;
        return 0;
      });
  	  break;
    // 撮影項目リストの順番に表示
    case 2:
      items.sort(function(a, b){
        if( $(a).attr('class')+$(a).attr('id') > $(b).attr('class')+$(b).attr('id') ) return 1;
        if( $(a).attr('class')+$(a).attr('id') < $(b).attr('class')+$(b).attr('id') ) return -1;
        return 0;
      });
  	  break;
    // 撮影項目リストの逆順に表示
    case 3:
      items.sort(function(a, b){
        if( $(a).attr('class')+$(a).attr('id') > $(b).attr('class')+$(b).attr('id') ) return -1;
        if( $(a).attr('class')+$(a).attr('id') < $(b).attr('class')+$(b).attr('id') ) return 1;
        return 0;
      });
      break;
  }
  // 並べ替えた順番に再表示
  items_wrapper.empty();
  items.each(function(){
    items_wrapper.append($(this));
  });
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiPictureView()
// 選択した工事写真の詳細を表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function koujiPictureView(obj) {
  _log(1,'function','koujiPictureView()');

  var itemname = $(obj).attr('id');
  var filename = itemname.replace( 'listItem' , '');
  $('#koujiviewName').text(filename);
  var koujiname = $('#koujiListItemName').text();

  // iosはDocuments/クラウド非同期フォルダ/工事名フォルダを参照
//  var folderurl = cordova.file.documentsDirectory+'NoCloud/'+koujiname;
  var folderurl = cordova.file.documentsDirectory + koujiname;
  
  // dataDirectoryフォルダのDirectoryEntryオブジェクトを取得
  window.resolveLocalFileSystemURL(folderurl,
    // (resolveLocalFileSystemURL)成功時のコールバック関数
    function getdirectoryEntry(directoryEntry) {
      // DirectoryReaderを生成
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
                $("#koujiviewPicture").attr({"src":e.target.result});
                
                // イメージが縦型の場合は表示幅を80%にする
                var img = new Image();
                img.src = e.target.result; 
                img.onload = function() {                
                  $("#koujiviewPicture").css({'width':'100%','height':'auto'});
                  // 写真が縦の場合は、横幅を80%にして全体が画面に収まるようにする
                  if(img.height>img.width) {
                    $("#koujiviewPicture").css({'width':'75%','height':'auto'});
                  };
                
                  // 詳細画面を表示する
                  $("#koujiviewModal").show();
                };
              };
            },
            function fail(e) {
              _errorlog(1,'koujiPictureView()',e.code+'->'+jpgfile);
            }
          );
        },
        function fail(e) {
          _errorlog(1,'koujiPictureView()',e.code+'->'+jpgfile);
        }
      );

      var infoFile = 'information/' + filename + '.json';
      directoryEntry.getFile(infoFile, null, 
        function getFile(fileEntry) {
          // Fileオブジェクトを取得
          fileEntry.file(
            function addInfomation(file) {
              var reader = new FileReader();
              reader.readAsText(file);
              reader.onloadend = function(e) {
                // 読み込んだテキストをJSON形式に変換
                var text = reader.result;
                var k = JSON.parse(text);
                if(typeof(k.datetime) === 'string') {
                  $("#koujiviewDatetime").text(k.datetime);
                };
                if(typeof(k.kousyu) === 'string') {
                  $("#koujiviewKousyu").text(k.kousyu);
                };
                if(typeof(k.sokuten) === 'string') {
                  $("#koujiviewSokuten").text(k.sokuten);
                };
                if(typeof(k.hiduke) === 'string') {
                  $("#koujiviewHiduke").text(k.hiduke);
                };
                if(typeof(k.bikou) === 'string') {
                  var bikou = k.bikou.split('\n');
                  for(var i=0 ; i<6 ; i++) {
                    $("#koujiviewBikou"+i).text('　');
                    if(i<bikou.length) {
                      $("#koujiviewBikou"+i).text(bikou[i]);
                    }  
                  }  
                };
                // 写真のアップロード済みフラグ
                if(typeof(k.upload) === 'string') {
                  $("#koujiviewUpload").text(k.upload);
                };
              };
            },
            function fail(e) {
              _errorlog(1,'koujiPictureView()',e.code+'->'+infoFile);
            }
          );
        },
        function fail(e) {
          _errorlog(1,'koujiPictureView()',e.code+'->'+infoFile);
        }
      );
    }
  );  
}

// 2018/02/09 ADD -----↓
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// picturePreview()
// 選択した工事写真の拡大・縮小表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function picturePreview() {
  _log(1,'function','picturePreview()');

  $('#koujiviewModal').hide();
  $('#picturePreviewModal').show();

  var scale = 0.9;
  var prevScale = 0.9;
  var dragFlg = false;

  var marginPosX = 0;
  var marginPosY = 0;
  var adjustY = 0;
  var adjustX = 0;

  $("#pictureView").attr({"src":$("#koujiviewPicture").attr("src")});  
  $('#pictureView').css({'transform': 'scale(' + scale + ',' + scale +')'});
  
  resizeLeft = $('#pictureView').offset().left; 
  resizeTop  = $('#pictureView').offset().top; 

  // 2本指でピンチ動作を行なった場合は拡大・縮小
  $('#pictureView').on('transform', function(event) {
    scale = Math.max(0.9, Math.min(prevScale * event.originalEvent.gesture.scale, 4));
    $('#pictureView').css({'transform': 'translate(' + resizeLeft + 'px, ' + resizeTop + 'px) scale(' + scale + ',' + scale +')'});
  });

  // 画面から指を離した時に、スケール値を退避
  $('#pictureView').on('release', function(event) {
    prevScale = scale;
  });

  // 画面にタッチを開始した時
  $('#pictureView').on('touchstart', function(event) {
    // transformが1倍のサイズ位置を設定するための補正
    adjustY = ($('#pictureView').height() - ($('#pictureView').height() * scale)) / 2 + $('#pictureViewDiv').offset().top;
    adjustX = ($('#pictureView').width()  - ($('#pictureView').width()  * scale)) / 2;
    
    if(event.originalEvent.touches.length > 1) {
      dragFlg = false;
      // タッチの位置と画像の位置から画像のタッチ位置を取得
      resizeLeft = $('#pictureView').offset().left - adjustX;
      resizeTop  = $('#pictureView').offset().top  - adjustY;
    }else{
      dragFlg = true;
      // タッチの位置と画像の位置から画像のタッチ位置を取得
      marginPosX = event.originalEvent.touches[0].pageX - $('#pictureView').offset().left + adjustX;
      marginPosY = event.originalEvent.touches[0].pageY - $('#pictureView').offset().top  + adjustY;
    }
  });

  // 1本指でドラッグをした時は、イメージを移動
  $('#pictureView').on('drag', function(event) {
    if(dragFlg) {
      var x = event.originalEvent.gesture.touches[0].pageX - marginPosX; 
      var y = event.originalEvent.gesture.touches[0].pageY - marginPosY;
                  
      $('#pictureView').css({'transform': 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ',' + scale +')'});
    }
  });
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiPictureViewClose()
// 選択した工事写真の拡大・縮小表示画面を閉じる
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function picturePreviewClose() {
  _log(1,'function','picturePreviewClose()');
  
  $('#picturePreviewModal').hide();
  $('#koujiviewModal').show();
};
// 2018/02/09 ADD -----↑

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiPictureViewClose()
// 選択した工事写真の詳細画面を閉じる
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function koujiPictureViewClose() {
  _log(1,'function','koujiPictureViewClose()');
  
  $('#koujiviewModal').hide();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiPictureDelete()
// 選択した工事写真を削除する
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function koujiPictureDelete() {
  _log(1,'function','koujiPictureDelete()');
  
  var filename = $('#koujiviewName').text();
  var koujiname = $('#koujiListItemName').text();
  var uploadFlg = $('#koujiviewUpload').text();
  
  if(uploadFlg === 'Already') {
    _alert('既にサーバーにアップロード済みの写真を削除する事は出来ません');
    exit;
  }
  
  _confirm('この写真をごみ箱に移動します。<br>よろしいですか？', function(idx) {
    // [OK]ボタンクリック時
    if(idx === 0 ) {

      // iosはDocuments/クラウド非同期フォルダ/工事名フォルダを参照
//      var folderurl = cordova.file.documentsDirectory+'NoCloud/'+koujiname;
      var folderurl = cordova.file.documentsDirectory + koujiname;

      // 移動先フォルダのDirectoryEntryを取得
      window.resolveLocalFileSystemURL(folderurl+'/dustbox',
        function getdirectoryEntry(moveToDirectoryEntry) {

          // dataDirectoryフォルダのDirectoryEntryオブジェクトを取得
          window.resolveLocalFileSystemURL(folderurl,
  
            // (resolveLocalFileSystemURL)成功時のコールバック関数
            function getdirectoryEntry(directoryEntry) {
              // DirectoryReaderを生成
              var jpgfile = filename + '.jpg'; 
              // 一覧からファイル名を取得
              directoryEntry.getFile(jpgfile, null, 
                function getFile(fileEntry) {
            
                  // 写真をごみ箱フォルダ(dustbox)に移動する
                  fileEntry.moveTo( moveToDirectoryEntry, fileEntry.name,
                    function success() {
                  
                      // 工事写真管理ファイルの写真枚数を-1する
                      pictureUpload.controlUpdate(directoryEntry, -1);
                  
                      // 工事写真リストの再作成  
//                    koujiListItemSet( $('#koujiListItemName').text(), $('#koujiListCountId').text() );
                      // 工事写真リストからアイテムを削除
                      $('#listItem'+filename).remove();
                      
                    },
                    function fail(e) {
                      _errorlog(1,'koujiPictureDelete()',e.code+'->'+jpgfile);
                    }
                  );
                },
                function fail(e) {
                  _errorlog(1,'koujiPictureDelete()',e.code+'->'+jpgfile);
                }
              );
            },
            function fail(e) {
              _errorlog(1,'koujiPictureDelete()',e.code+'->'+folderurl);
            }
          );
        },
        function fail(e) {
          _errorlog(1,'koujiPictureDelete()',e.code+'->'+folderurl);
        }
      );
  
      $('#koujiviewModal').hide();
    }
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiPictureListTokoujiList()
// 工事写真一覧から工事一覧画面に戻る
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function koujiPictureListTokoujiList() {
  _log(1,'function','koujiPictureListTokoujiList()');
  
  // 表示中の写真リストを中止する
  clearInterval(koujiPictureListViewIntervalId);
  
  // リストを初期化
  $("#koujiPictureList").empty();

  // 工事一覧のリストを再作成
  koujiListDisplay();

  // 工事一覧画面に戻る
  lstNavigator.popPage();
    
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiListToCamera()
// 工事一覧を終了しカメラ画面に切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function koujiListToCamera() {
  _log(1,'function','koujiListToCamera()');

  // リストを初期化
  $("#koujiListBox").empty();
  $("#koujiPictureList").empty();
  // 設定メニューを初期メニューに戻す
  lstNavigator.resetToPage('koujiList.html');

  // カメラ画面の表示
  $('#camera').show();
  // ステータスバーの非表示
  StatusBar.hide();
  
  // 設定メニュー画面の非表示
  $('#lstNavigator').hide();
};
