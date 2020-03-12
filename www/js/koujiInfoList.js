var koujiInfoList = function() {};
var koujiInfoListSortIndex = 0;

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.koujiListDisplay()
// 工事情報の一覧を作成
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.koujiListDisplay = function() {
  _log(1,'function','koujiInfoList.koujiListDisplay()');

  // 工事情報のリストを初期化
  $("#koujiInfoList").empty();
  // 工事写真一覧の表示エリアの高さを計算
  $('#koujiInfoList').height('100%');
  let tabmenuHeight = $('#koujiInfoTabbarMenu').height();
  let koujilistHeight = $('#koujiInfoList').height();
  let koujilistHeaderHeight = $('#koujiInfoListHeader').height();
  $('#koujiInfoList').height(koujilistHeight-koujilistHeaderHeight-tabmenuHeight);

  // スプラッシュ表示
  $('#splashModal').show();

  // 撮影リストの種類を取得
  var str = localStrage.getItems('firebase:group00/config/shootingList');
  // 読み込んだテキストをJSON形式に変換
  var slst = JSON.parse(str);

  // ローカルストレージから工事情報を読み込み
  var str = localStrage.getItems('firebase:group00/koujiList');
  // 読み込んだテキストをJSON形式に変換
  var json = JSON.parse(str);

  // ローカルストレージのアイテム設定をループして検索リストにセット
  try {
    // jsonからsort用の配列を作成
    var koujilist = [];
    $.each( json, function(koujiname, data) {
      var kouji = [koujiname, data.fastDateTime, data.lastDateTime, data.address, data.builder, data.person, data.pictureCount, data.geoLocation, data.shootinglistNo, ''];
      if(!kouji[1]) {kouji[1] = ''}
      if(!kouji[2]) {kouji[2] = '2199/01/01'}
      if(!kouji[3]) {kouji[3] = ''}
      if(!kouji[4]) {kouji[4] = ''}
      if(!kouji[5]) {kouji[5] = ''}
      if(!kouji[6]) {kouji[6] = '0'}
      if(!kouji[7]) {kouji[7] = {lat : 0, lng : 0, alt : 0, tim : 0}}
      if(!kouji[8]) {kouji[8] = ''}
      try {
        kouji[9] = slst['list'+kouji[8]]['name'];
      }catch(e){
        kouji[9] = '';
      }
      
      koujilist.push(kouji);
    });
    // 選択した条件でソート
    koujilist = koujiInfoList.listSort(koujilist, koujiInfoListSortIndex);

    // 工事番号をループしリストを作成する
    $.each( koujilist, function(i, data) {
      var locat = '';
      if(data[7].lat !== 0) {
        locat = 'https://maps.google.co.jp/maps?q=' + data[7].lat + ',' + data[7].lng;
      }

      // 検索リストに要素を追加
      var elm = '';
      elm = elm + '<ons-list-item name="'+data[0]+'" class="textsize5" style="color:green;border-bottom:solid 2px gray;" onClick="koujiInfoList.koujiListItemClick(this)">'+data[0]+'\n';
      elm = elm + '  <ons-row style="border-top:solid 1px gray;border-bottom:dotted 1px gray">';
      elm = elm + '    <ons-col>';
      elm = elm + '      <ons-row style="border-bottom:dotted 1px gray;">';
      elm = elm + '        <ons-col width="1%"></ons-col>';
      elm = elm + '        <ons-col class="textsize4" align="right" width="25%" style="color:gray">撮影日時:</ons-col>';
      elm = elm + '        <ons-col width="3%"></ons-col>';
      if(data[2]==='2199/01/01') {
        elm = elm + '      <ons-col width="67" class="textsize4" style="padding:0px;color:darkorange">New!</ons-col>';
      }else{
        elm = elm + '      <ons-col width="67" class="textsize4" style="padding:0px;color:gray">'+data[1].slice(0,10)+' ～ '+data[2].slice(0,10)+'</ons-col>';
      }
      elm = elm + '      </ons-row>';
      elm = elm + '      <ons-row>';
      elm = elm + '        <ons-col width="1%"></ons-col>';
      elm = elm + '        <ons-col class="textsize4" align="right" width="25%" style="color:gray">施工場所:</ons-col>';
      elm = elm + '        <ons-col width="3%"></ons-col>';
      elm = elm + '        <ons-col width="67%" class="textsize4" style="color:gray">'+data[3]+'</ons-col>';
      elm = elm + '      </ons-row>';
      elm = elm + '    </ons-col>';
      elm = elm + '    <ons-col width="1%">';
      elm = elm + '    </ons-col>';
      elm = elm + '    <ons-col width="4%" align="bottom">';
      if(locat !== '') {
        elm = elm + '      <a href="#" class="locationUrl" url="'+locat+'" onClick="koujiInfoList.locationMap(this)">';
        elm = elm + '      <ons-icon class="iconsize6" icon="ion-location"></a>';
        elm = elm + '      </ons-icon>';
      }
      elm = elm + '    </ons-col>';
      elm = elm + '  </ons-row>';
      elm = elm + '  <ons-row>';
      elm = elm + '  <ons-row style="border-bottom:dotted 1px gray;">';
      elm = elm + '    <ons-col class="textsize4" align="right" width="25%" style="color:gray">元請会社:</ons-col>';
      elm = elm + '    <ons-col width="3%"></ons-col>';
      elm = elm + '    <ons-col class="textsize4 koujiInfoListBuilder" style="padding:0px;color:gray">'+data[4]+'</ons-col>';  // 2018/08/18
      elm = elm + '  </ons-row>';
      elm = elm + '  <ons-row style="border-bottom:dotted 1px gray;">';
      elm = elm + '    <ons-col class="textsize4" align="right" width="25%" style="color:gray">元請担当者:</ons-col>';
      elm = elm + '    <ons-col width="3%"></ons-col>';
      elm = elm + '    <ons-col class="textsize4" style="padding:0px;color:gray">'+data[5]+'</ons-col>';
      elm = elm + '  </ons-row>';
      elm = elm + '  <ons-row style="border-bottom:dotted 1px gray;">';
      elm = elm + '    <ons-col class="textsize4" align="right" width="25%" style="color:gray">撮影リスト:</ons-col>';
      elm = elm + '    <ons-col width="3%"></ons-col>';
      elm = elm + '    <ons-col class="textsize4" style="color:gray">'+data[9]+'</ons-col>';
      elm = elm + '  </ons-row>';
      elm = elm + '  <ons-row>';
      elm = elm + '    <ons-col class="textsize4" align="right" width="25%" style="color:gray">撮影済枚数:</ons-col>';
      elm = elm + '    <ons-col width="3%"></ons-col>';
      elm = elm + '    <ons-col class="textsize4" align="right" width="10%" style="color:gray">'+data[6]+'</ons-col>';
      elm = elm + '    <ons-col class="textsize4" style="color:gray">枚</ons-col>';
      elm = elm + '  </ons-row>';
      elm = elm + '  </ons-row>';
      elm = elm + '</ons-list-item>';
      $(elm).appendTo($('#koujiInfoList'));
    });
  } catch(e) {
    alert(e);
  };

  // 地図表示アイコンをタップした場合は、工事のクリックイベントを無効にする
	$('.locationUrl').click(function(e) {
    e.stopImmediatePropagation();
  });

  $('#splashModal').hide();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.locationMap()
// 地図表示アイコンクリックでgoogleMapを表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.locationMap = function(obj) {
  _log(1,'function','koujiInfoList.locationMap()');

  var url = $(obj).attr('url');
  window.open = cordova.InAppBrowser.open;
  window.open(url, '_system', 'location=yes');
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.toolMenuSelect()
// 工事情報一覧のツールメニューの選択
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.toolMenuSelect = function(obj) {
  _log(1,'function','koujiInfoList.toolMenuSelect()');

  var tabMenuButtonId = $(obj).attr('id');
  var options = [];
  if(tabMenuButtonId==='koujiInfoButton-sort'){
    options = [
      '撮影日時が新しい写真から表示',
      '工事名称(漢字)の順番に表示',
      '施工場所(漢字)の順番に表示',
      '元請会社(漢字)の順番に表示',
      'キャンセル'
    ];
  }

  ons.openActionSheet({
    cancelable: true,
    buttons: options
  }).then(function (index) {
    // ソートボタンをクリック
    if(tabMenuButtonId==='koujiInfoButton-sort'){
      if(index < 4) {
        koujiInfoListSortIndex = index;
        koujiInfoList.koujiListDisplay();
      }
    }
  });
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.listSort()
// 工事情報の表示順を並べ替える
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.listSort = function(koujilist, index) {
  _log(1,'function','koujiInfoList.listSort('+index+')');

  var koujiname = $('#koujiInfoSearchKoujiname').val();
  var address = $('#koujiInfoSearchAddress').val();
  var builder = $('#koujiInfoSearchBuilder').val();
  if(builder === null) builder = '';

  var trueCount = koujilist.length;
  var allCount = koujilist.length;

  if(koujiname+address+builder !== '') {
    for (var i=0; i < koujilist.length; i++) {
      var flg = false;
      koujilist[i][10] = '';
      if((koujilist[i][0]).indexOf(koujiname) == -1  ||
        (koujilist[i][3]).indexOf(address) == -1 ||
        (koujilist[i][4]).indexOf(builder) == -1) {
        koujilist[i][10] = '除外';
        trueCount--;
      }
    }
    if(trueCount > 0) {
      for(var i = 0; i < koujilist.length; i++) {
        if(koujilist[i][10] === '除外') {
           koujilist.splice(i,1);
           i--;
        }
      }
    }
  }
  $('#koujiInfoListCount').text(trueCount + '件／ ' + allCount + '件');

  switch(index) {
    // 撮影日時が新しい写真から表示
    case 0:
      koujilist.sort(function(a,b) {
        if( a[2] > b[2] ) return -1;
        if( a[2] < b[2] ) return 1;
        return 0;
      });
  	  break;
    // 工事名称(漢字)の順番に表示
    case 1:
      koujilist.sort(function(a,b) {
        if( a[0] > b[0] ) return -1;
        if( a[0] < b[0] ) return 1;
        return 0;
      });
  	  break;
    // 施工場所(漢字)の順番に表示
    case 2:
      koujilist.sort(function(a,b) {
        if( a[3] > b[3] ) return -1;
        if( a[3] < b[3] ) return 1;
        return 0;
      });
  	  break;
    // 元請会社(漢字)の順番に表示
    case 3:
      koujilist.sort(function(a,b) {
        if( a[4] > b[4] ) return -1;
        if( a[4] < b[4] ) return 1;
        return 0;
      });
  	  break;
  }

  // 並べ替えた配列を戻す
  return koujilist;
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.searchWindows()
// 工事情報の検索ウィンドウを表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.searchWindows = function() {
  _log(1,'function','koujiInfoList.searchWindows');

  if($('#koujiInfoSearchBuilder option').length == 0) {
    // 元請会社名をソートして集計し、検索窓のプルダウンを作成する
    var elm = '';
    var builders = $('#koujiInfoList .koujiInfoListBuilder');
    builders.sort(function(a, b){
      if( $(a).text() > $(b).text() ) return 1;
      if( $(a).text() < $(b).text() ) return -1;
      return 0;
    });

    $('#koujiInfoSearchBuilder').empty();
    var str = '';
    elm = $('<option value="'+str+'">'+str+'</option>');
    elm.appendTo($('#koujiInfoSearchBuilder'));
    for (var i=0; i < builders.length; i++) {
      if(str !== builders[i].innerHTML) {
        str = builders[i].innerHTML;
        elm = $('<option value="'+str+'">'+str+'</option>');
        elm.appendTo($('#koujiInfoSearchBuilder'));
      }
    }
  }

  $('#koujiInfoSearchModal').show();
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.listSearch()
// 工事情報の検索処理
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.listSearch = function() {
  _log(1,'function','koujiInfoList.listSearch');

  koujiInfoList.koujiListDisplay();
  $('#koujiInfoSearchModal').hide();
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.koujiListItemClick()
// 工事一覧のアイテムをクリック
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.koujiListItemClick = function(obj) {
  _log(1,'function','koujiInfoList.koujiListItemClick('+$(obj).attr('id')+')');

  var options = {
    // アニメーションの種類
    animation: 'slide',   //'slide', 'lift', 'fade'
    // 画面遷移後に実行されるコールバック
    callback: function() {
      // クリックをしたアイテムから工事名を取得
      var koujiname = $(obj).attr('name');

      // 写真一覧を表示
      koujiInfoList.koujiListItemSet(koujiname);

      // 工事写真一覧の処理イベントを登録
      koujiInfoList.koujiListAddEvent();
    }
  };

  // ネットワークの接続確認
  firebase.database().ref(".info/connected").once("value", function(snap) {
    if(snap.val() === true) {
      // 選択された工事の写真一覧を表示
      setNavigator.pushPage('koujiListItem.html', options);
    }else{
      _alert('ネットワークが接続されていない為、写真を表示する事が出来ません。');
    }
  });
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.koujiListAddEvent()
// 工事写真一覧の処理イベントを登録
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.koujiListAddEvent = function() {
  _log(1,'function','koujiInfoList.koujiListAddEvent()');

  // 工事写真一覧から戻る>>ボタンをクリック
  $('#koujiPictureBackButton').off('click');
  $('#koujiPictureBackButton').on('click', function() {
    koujiInfoList.toKoujiInfoList();
  });

  // 工事写真一覧からカメラに戻るボタンをクリック
  $('#koujiPictureToCameraButton').off('click');
  $('#koujiPictureToCameraButton').on('click', function() {
    koujiInfoList.toCamera();
  });

  // クラウドツールボタンをクリック
  $('#pictureListButton-cloud').off('click');
  $('#pictureListButton-cloud').on('click', function() {
    koujiInfoList.koujiFilesToolMenu(this);
  });

  // 並べ替えツールボタンをクリック
  $('#pictureListButton-display').off('click');
  $('#pictureListButton-display').on('click', function() {
    koujiInfoList.koujiFilesToolMenu(this);
  });

  // 表示切り替えツールボタンをクリック
  $('#pictureListButton-sort').off('click');
  $('#pictureListButton-sort').on('click', function() {
    koujiInfoList.koujiFilesToolMenu(this);
  });
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.koujiListItemSet()
// 工事写真一覧のアイテムをセット
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.koujiListItemSet = async function(koujiname) {
  _log(1,'function','koujiInfoList.koujiListItemSet('+koujiname+')');

  // 工事写真リストのアイテムをクリアする
  $('#koujiPictureList').empty();
  // 工事写真一覧の表示エリアの高さを計算
  $('#koujiPictureList').height('100%');
  let tabmenuHeight = $('#tabbarMenu').height();
  let piclistHeight = $('#koujiPictureList').height();
  let piclistHeaderHeight = $('#koujiPictureListHeader').height();
  $('#koujiPictureList').height(piclistHeight-piclistHeaderHeight-tabmenuHeight);

  // 工事写真リストのヘッダーの工事名をセット
  $('#koujiListItemName').text(koujiname);
  $('#koujiListItemTitle').text('工事写真一覧(クラウド)');

  if(koujiPictureListViewStyle !== 'list') {
    var elm = $('<ul style="margin: 0;padding: 0;">');
    elm.appendTo($('#koujiPictureList'));
  }

  // firebaseStorageの工事情報をjson形式で取得
  var json = await koujiInfoList.getCloudPictureList(koujiname);

  loopBreakflg = false;
  var errcode = '';
  for(key in json) {
    // ループ中にカメラ画面や戻るを選択された場合に、ループを中止する
    if(loopBreakflg) return;

    var filename = key;

    try {
      // 縮小写真のリンクをセット
      var url = await koujiInfoList.getThumbnailUrl(koujiname, filename);

      // 写真リストのhtmlを作成
      var ret = await koujiInfoList.koujiListAddElement(filename, url);

      // htmlにプレビュー･情報を付加
      var ret = await koujiInfoList.koujiListAddInfo(filename, json[key]);

    } catch(e) {
      errcode = e.code;
    }
  };
  if(errcode!=='') {
    _alert('全てのクラウド上の工事写真が取得できませんでした。('+errcode+')');
  }

  if(koujiPictureListViewStyle !== 'list') {
    var elm = $('</ul>');
    elm.appendTo($('#koujiPictureList'));
  }

  if(koujiPictureListSortIndex<0 && koujiPictureListSortIndex>3){
    koujiPictureListSortIndex = 0;
  }
  // 前回選択したソート順に並べ替える
  koujiInfoList.koujiPictureSort(koujiPictureListSortIndex);
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.getCloudPictureList()
// firebaseDatabase上にある選択した工事の写真一覧を表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.getCloudPictureList = function(koujiname) {
  return new Promise(function(resolve, reject) {
    _log(1,'function','koujiInfoList.getCloudPictureList('+koujiname+')');

    // firebaseDatabase上にある選択した工事の写真一覧を取得する
    var folder = activeuser.uid+'/group00/pictureList/'+koujiname;
    firebase.database().ref(folder).once('value', function(snapshot) {
      resolve(snapshot.val());
    });
  });
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.getThumbnailUrl()
// firebaseStorageにある選択した工事の写真一覧を表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.getThumbnailUrl = function(koujiname, filename) {
  return new Promise(function(resolve, reject) {
    _log(1,'function','koujiInfoList.getThumbnailUrl('+koujiname+' : '+filename+')');

    // firebaseStorage上にあるサムネイルのリンクをセット
    var thumbnailPath = firebase.storage().ref().child(activeuser.uid+'/'+koujiname+'/thumbnail/'+filename+'.jpg');
    thumbnailPath.getDownloadURL().then(function(url) {
      resolve(url);

    }).catch(function(e) {
      reject(e);

    });
  });
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.koujiListAddElement()
// 選択した工事の写真一覧を表示するhtmlを作成
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.koujiListAddElement = function(filename, uri) {
  return new Promise(function(resolve, reject) {
    _log(1,'function','koujiInfoList.koujiListAddElement('+filename+' : '+uri+')');

    // サムネイル画像をキャッシュさせない為の処理
    var thumbnailuri = uri + '?1';

    // 工事毎の行を作成
    if(koujiPictureListViewStyle === 'list') {
      // 詳細リスト表示
      var elm = $('<ons-list-item id="listItem'+filename+'" tappable modifier="chevron" style="padding:0px 5px;margin-top:-10px" pictureId="" onclick="koujiInfoList.koujiPictureView(this)">'+
                    '<ons-col align="top" width="40%">'+
                      '<img id="imag'+filename+'" class="thumbnail-s" src="'+thumbnailuri+'">'+
                    '</ons-col>'+

                    '<ons-col width=" 2%">'+
                      '<p id="upload'+filename+'" style="visibility:hidden"></p>'+
                    '</ons-col>'+

                    '<ons-col width="55%" align="top">'+
                      '<ons-row style="color:blue;">'+
                        '<ons-col width="94%" align="top">'+
                          '<p class="textsize3" id="date'+filename+'" style="margin:0">'+filename+'</p>'+
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
    }else{
      // タイル表示
      var elm = $('<li class="thumbnailTile" id="listItem'+filename+'" style="margin: 1px; float: left; list-style: none; position: relative;" pictureId="" onclick="koujiInfoList.koujiPictureView(this)">'+
                    '<img class="thumbnail '+koujiPictureListViewStyle+'" id="imag'+filename+'" src="'+thumbnailuri+'">'+
                    '<p id="upload'+filename+'" style="display:none"></p>'+
                    '<p id="date'+filename+'" style="display:none">'+filename+'</p>'+
                    '<p id="kousyu'+filename+'" style="display:none"></p>'+
                    '<p id="sokuten'+filename+'" style="display:none"></p>'+
                    '<p id="bikou'+filename+'" style="display:none"></p>'+
                  '</li>');
	  }
    elm.appendTo($('#koujiPictureList'));

    resolve(null);
  });
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.koujiListAddInfo()
// 写真リストにプレビューと黒板情報を表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.koujiListAddInfo = function(filename, json) {
  return new Promise(function(resolve, reject) {
    _log(1,'function','koujiInfoList.koujiListAddInfo('+filename+')');

    var k = json;

    // 撮影リストでのソートを可能にするためにclassにリストＩＤをセット
    if(k.pictureId === undefined) {k.pictureId = '';}
    $('#listItem'+filename).attr('pictureId',k.pictureId);

    // 撮影日時をセット
    if(k.datetime === undefined) {k.datetime = '';}
    $('#date'+filename).text('撮影:'+k.datetime);

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

    resolve(null);
  });
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.koujiFilesToolMenu()
// 工事写真一覧のツールメニュー
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.koujiFilesToolMenu = function(obj) {
  _log(1,'function','koujiInfoList.koujiFilesToolMenu()');

  var tabMenuButtonId = $(obj).attr('id');
  var options = [];
  if(tabMenuButtonId==='pictureListButton-cloud'){
    options = [
      '写真をサーバーからダウンロード',
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
  }else{
  if(tabMenuButtonId==='pictureListButton-display'){
    options = [
      '詳細リスト表示',
      'タイル表示(小)',
      'タイル表示(中)',
      'タイル表示(大)',
      'キャンセル'
    ];
  }}}

  ons.openActionSheet({
    cancelable: true,
    buttons: options
  }).then(function (index) {
    // クラウドボタンをクリック
    if(tabMenuButtonId==='pictureListButton-cloud'){
      if(index === 0) {
//        pictureUpload.checkPicture();
        koujiInfoList.koujiPicturesDownload($('#koujiListItemName').text());
      }
    }else{
    // ソートボタンをクリック
    if(tabMenuButtonId==='pictureListButton-sort'){
      koujiPictureListSortIndex = index;
      koujiInfoList.koujiPictureSort(index);
    }else{
    // ソートボタンをクリック
    if(tabMenuButtonId==='pictureListButton-display'){
      var beforeStyle = koujiPictureListViewStyle;
      switch (index) {
        case 0:
          koujiPictureListViewStyle = 'list';
          if(beforeStyle !== 'list') {
            koujiInfoList.koujiListItemSet($('#koujiListItemName').text());
          }
          break;
        case 1:
          koujiPictureListViewStyle = 'tile-s';
          break;
        case 2:
          koujiPictureListViewStyle = 'tile-m';
          break;
        case 3:
          koujiPictureListViewStyle = 'tile-l';
          break;
      }
      if(index > 0 && index < 4 && beforeStyle !== koujiPictureListViewStyle) {
        if(beforeStyle === 'list') {
          koujiInfoList.koujiListItemSet($('#koujiListItemName').text());
        }
        $('img.thumbnail').addClass(koujiPictureListViewStyle);
        $('img.thumbnail').removeClass(beforeStyle);
      }
    }}}
  });
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.koujiPictureSort()
// 工事写真の表示順を並べ替える
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.koujiPictureSort = function(index) {
  _log(1,'function','koujiInfoList.koujiPictureSort('+index+')');

  var items_wrapper = $('#koujiPictureList');
  var items = $('#koujiPictureList ons-list-item');
  if(items.length == 0) {
    items = $('#koujiPictureList li');
  }
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
        if( $(a).attr('pictureId')+$(a).attr('id') > $(b).attr('pictureId')+$(b).attr('id') ) return 1;
        if( $(a).attr('pictureId')+$(a).attr('id') < $(b).attr('pictureId')+$(b).attr('id') ) return -1;
        return 0;
      });
  	  break;
    // 撮影項目リストの逆順に表示
    case 3:
      items.sort(function(a, b){
        if( $(a).attr('pictureId')+$(a).attr('id') > $(b).attr('pictureId')+$(b).attr('id') ) return -1;
        if( $(a).attr('pictureId')+$(a).attr('id') < $(b).attr('pictureId')+$(b).attr('id') ) return 1;
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
// koujiInfoList.koujiPictureView()
// 選択した工事写真の詳細を表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.koujiPictureView = async function(obj) {
  _log(1,'function','koujiInfoList.koujiPictureView()');

  // 削除･編集 のボタンを非表示にする
  $('ons-button[onclick="koujiPictureDelete()"]').attr('style','display:none');
  $('ons-button[onclick="koujiPictureKokubanEdit()"]').attr('style','display:none');
  // 保存 のボタンを表示にする
  $('ons-button[onclick="koujiInfoList.pictureFileDownload()"]').attr('style','display:block');

  var itemname = $(obj).attr('id');
  var filename = itemname.replace( 'listItem' , '');
  $('#koujiviewName').text(filename);
  var koujiname = $('#koujiListItemName').text();

  try {
    // 縮小写真のリンクをセット
    var url = await koujiInfoList.getPicturelUrl(koujiname, filename);

    // 工事写真を読み取り表示
    $('#koujiviewPicture').attr('src', url);
    // イメージが縦型の場合は表示幅を80%にする
    var img = new Image();
    img.src = url;
    img.onload = function() {
      $('#koujiviewPicture').css({'width':'100%','height':'auto'});
      // 写真が縦の場合は、横幅を80%にして全体が画面に収まるようにする
      if(img.height>img.width) {
        $('#koujiviewPicture').css({'width':'75%','height':'auto'});
      };
    };
  } catch(e) {
    _alert('工事写真が取得できませんでした。'+e.code);
  }
  // 写真ビューの表示項目をクリアする
  $('#koujiviewDatetime').text('');
  $('#koujiviewKousyu').text('');
  $('#koujiviewSokuten').text('');
  $('#koujiviewHiduke').text('');
  $('#koujiviewPictureId').text('');
  $('#koujiviewBikou').text('');
  $('#koujiviewKokubanX').text('');
  $('#koujiviewKokubanY').text('');
  for(var i=0 ; i<6 ; i++) {
    $('#koujiviewBikou'+i).text('');
  }
  $('#koujiviewUpload').text('');

  try {
    // ローカルストレージの工事写真一覧を取得
    var json = await koujiInfoList.getCloudPictureList(koujiname);
    // 読み込んだ工事写真一覧JSONから指定したファイル名の情報を取得する
    var k = json[filename];
    if(typeof(k.datetime) === 'string') {
      $('#koujiviewDatetime').text(k.datetime);
    };
    if(typeof(k.kousyu) === 'string') {
      $('#koujiviewKousyu').text(k.kousyu);
    };
    if(typeof(k.sokuten) === 'string') {
      $('#koujiviewSokuten').text(k.sokuten);
    };
    if(typeof(k.hiduke) === 'string') {
      $('#koujiviewHiduke').text(k.hiduke);
    };
    if(typeof(k.pictureId) === 'string') {
      $('#koujiviewPictureId').text(k.pictureId);
    };
    if(typeof(k.bikou) === 'string') {
      $('#koujiviewBikou').text(k.bikou);
    };
    if(typeof(k.kokubanX) === 'number') {
      $('#koujiviewKokubanX').text(k.kokubanX);
    };
    if(typeof(k.kokubanY) === 'number') {
      $('#koujiviewKokubanY').text(k.kokubanY);
    };
    if(typeof(k.bikou) === 'string') {
      var bikou = k.bikou.split('\n');
      for(var i=0 ; i<6 ; i++) {
        $('#koujiviewBikou'+i).text('　');
        if(i<bikou.length) {
          $('#koujiviewBikou'+i).text(bikou[i]);
        }
      }
    };
    // 写真のアップロード済みフラグ
    if(typeof(k.upload) === 'string') {
      $('#koujiviewUpload').text(k.upload);
    };
  } catch(e) {
    _alert('写真の詳細情報の読み込みに失敗しました。'+e.code);
  }

  // 詳細画面を表示する
  $("#koujiviewModal").show();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.getPicturelUrl()
// firebaseStorageにある選択した写真のURLを取得
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.getPicturelUrl = function(koujiname, filename) {
  return new Promise(function(resolve, reject) {
    _log(1,'function','koujiInfoList.getPicturelUrl('+koujiname+' : '+filename+')');

    // firebaseStorage上にあるサムネイルのリンクをセット
    var thumbnailPath = firebase.storage().ref().child(activeuser.uid+'/'+koujiname+'/'+filename+'.jpg');
    thumbnailPath.getDownloadURL().then(function(url) {
      resolve(url);

    }).catch(function(e) {
      reject(e);

    });
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.koujiPicturesDownload()
// firebase上の選択した工事の写真をローカルにダウンロード
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.koujiPicturesDownload = async function(koujiname) {
  _log(1,'function','koujiInfoList.koujiPicturesDownload()');

  try {
    // ローカルドライブに必要なフォルダを作成する
    var ret = await koujiInfoList.makeDirectory(koujiname);
  } catch (e) {
    // (localStrage.makeDirectory)でエラー発生
    _alert('ローカルに「'+koujiname+'」フォルダが作成できませんでした。');
    _errorlog(1,'koujiInfoList.koujiPicturesDownload(ローカルに「'+koujiname+'」が作成できませんでした。',e.code+e.message);
    return;
  }

  // 表示形式がリスト形式かタイル形式か
  var elm = '';
  if(koujiPictureListViewStyle === 'list') {
    elm = 'ons-list-item';
  }else{
    elm = 'li';
  }

  var firebaseFolder = activeuser.uid + '/' + koujiname + '/';
  var select = '', filename = '', errorFlg = false;
  var downfile = '', fileEntry = null, file = null;
  var datetime = ''; fast_datetime = '9999/99/99 99:99'; last_datetime = '0000/00/00 00:00';
  var addcount = 0;
  var downloadStatusArray = new Array();
  // 写真の枚数を取得
  var pictureCount = $('#koujiPictureList').children(elm).length;
  if(pictureCount == 0) return;

  var downloadCount = 0, progressValue = 0;
  var downloadMaxCount = pictureCount;
  $('#download-dlg').show();
  $('#download-dlg-mesage').text('ダウンロード中です。');
  $('#download-dlg-progress').attr('value',String(progressValue));
  $('#download-dlg-progress').show();
  $('#download-dlg-button').hide();

  for(var i=0; i<pictureCount; i++) {
    select = $('#koujiPictureList').children(elm)[i].id;
    filename = select.replace( 'listItem' , '');

    datetime = $('#date'+filename).text();
    datetime = datetime.replace( '撮影:' , '');
    if(fast_datetime > datetime) {
      fast_datetime = datetime;
    }
    if(last_datetime < datetime) {
      last_datetime = datetime;
    }

    // 工事写真、サムネイル写真、ファイル情報のダウンロード
    downfile = '', fileEntry = null, file = null;
    try {
      // ローカルに同じファイルの存在確認
      downfile = filename + '.jpg';
      // directoryEntryオブジェクトを取得
      directoryEntry = await localFile.getFileSystemURL(localStorageDirectory+koujiname);
      // ディレクトリエントリーとファイルのパスからfileEntryオブジェクトを取得
      fileEntry = await localFile.getFileEntry(directoryEntry, downfile);
      // ファイルエントリーオブジェクトからfileオブジェクトを取得
      file = await localFile.getFileObject(fileEntry);
    } catch(e) {
      // ローカルに同じファイルがない場合は追加とみなす
      addcount++;
    }

    // firebaseから写真と写真情報ファイルをダウンロード
    errorFlg = false;
    try {
      downfile = filename + '.jpg';
      // directoryEntryオブジェクトを取得
      directoryEntry = await localFile.getFileSystemURL(localStorageDirectory+koujiname);
      // fileEntryオブジェクトを取得
      fileEntry = await localFile.getFileEntry(directoryEntry, downfile, true);
      // FileWriterオブジェクトを作成
      fileWriter = await localFile.getFileWriter(fileEntry);
      // データ書き込み成功
      downloadStatusArray.push(koujiInfoList.firebaseToLocal(firebaseFolder+downfile, fileWriter));
    } catch(e) {
      errorFlg = true;
      _alert('firebaseファイルのダウンロードに失敗しました。('+koujiname+'/'+downfile+' : '+e.message+')');
    }

    if(!errorFlg) {
      try {
        downfile = filename + '.jpg';
        // directoryEntryオブジェクトを取得
        directoryEntry = await localFile.getFileSystemURL(localStorageDirectory+koujiname+'/thumbnail/');
        // fileEntryオブジェクトを取得
        fileEntry = await localFile.getFileEntry(directoryEntry, downfile, true);
        // FileWriterオブジェクトを作成
        fileWriter = await localFile.getFileWriter(fileEntry);
        // データ書き込み成功
        downloadStatusArray.push(koujiInfoList.firebaseToLocal(firebaseFolder+'thumbnail/'+downfile, fileWriter));
      } catch(e) {
        _alert('firebaseファイルのダウンロードに失敗しました。('+koujiname+'/thumbnail/'+downfile+' : '+e.message+')');
      }

      try {
        downfile = filename + '.json';
        // directoryEntryオブジェクトを取得
        directoryEntry = await localFile.getFileSystemURL(localStorageDirectory+koujiname+'/information/');
        // fileEntryオブジェクトを取得
        fileEntry = await localFile.getFileEntry(directoryEntry, downfile, true);
        // FileWriterオブジェクトを作成
        fileWriter = await localFile.getFileWriter(fileEntry);
        // データ書き込み成功
        downloadStatusArray.push(koujiInfoList.firebaseToLocal(firebaseFolder+'information/'+downfile, fileWriter));
      } catch(e) {
        _alert('firebaseファイルのダウンロードに失敗しました。('+koujiname+'/information/'+downfile+' : '+e.message+')');
      }

      try {
        downfile = filename + '.jpg';
        // directoryEntryオブジェクトを取得
        directoryEntry = await localFile.getFileSystemURL(localStorageDirectory+koujiname+'/clipping/');
        // fileEntryオブジェクトを取得
        fileEntry = await localFile.getFileEntry(directoryEntry, downfile, true);
        // FileWriterオブジェクトを作成
        fileWriter = await localFile.getFileWriter(fileEntry);
        // データ書き込み成功
        downloadStatusArray.push(koujiInfoList.firebaseToLocal(firebaseFolder+'clipping/'+downfile, fileWriter));
      } catch(e) {
        _alert('firebaseファイルのダウンロードに失敗しました。('+koujiname+'/clipping/'+downfile+' : '+e.message+')');
      }
    }

    // プログレスバーの位置計算
    downloadCount++;
    progressValue = Math.ceil(downloadCount/downloadMaxCount*100);
    $('#download-dlg-progress').attr('value',String(progressValue));
    $('#download-dlg-counter').text(downloadCount+'/'+downloadMaxCount);
  }

  // 写真撮影日時・枚数 等の情報をセーブ (infomation/cotrol.json)
  koujiInfoList.setInformationHeader(koujiname, addcount, fast_datetime, last_datetime, function(ret) {
    if(ret === null) {
    }else{
      _alert('control.jsonが正常に保存できませんでした。('+ret+')');
    }
  })

  $('#download-dlg-progress').hide();
  $('#download-dlg-mesage').text('しばらくお待ちください。');

  // pending状態のPromiseが全て完了してから終了メッセージを表示
  Promise.all(downloadStatusArray).then(function(results) {
    // 工事写真管理ファイルの件数情報更新
    downloadEndMessage('ダウンロードが終了しました。');
  })
  .catch( function () {
    uploadEndMessage('一つ以上の写真がダウンロードに失敗しました。');
  });

  function downloadEndMessage(msg) {
    // 工事写真管理ファイルの件数情報更新
    $('#download-dlg-mesage').text(msg);
    $('#download-dlg-button').show();
  }
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.makeDirectory()
// ローカルに必要なフォルダを作成するpromise関数
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.makeDirectory = function(koujiname) {
  return new Promise(function(resolve, reject) {
    _log(1,'function','koujiInfoList.makeDirectory()');

    localStrage.makeDirectory(koujiname, function() {
      resolve(null);
    },
    // (dustbox)フォルダの作成エラー
    function fail(error) {
      reject(error);
    })
  })
}
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.firebaseToLocal()
// サーバーの写真ファイルをローカルにダウンロード
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.firebaseToLocal = function(firebaseFilePath, fileWriter) {
  return new Promise(function(resolve, reject) {
    // firbase StorageからURLを取得
    firebase.storage().ref().child(firebaseFilePath).getDownloadURL().then(function(url) {
      // urlのファイルをローカルストレージに保存
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = function(event) {
        fileWriter.write(xhr.response);
        resolve(null);
      };
      xhr.open('GET', url);
      xhr.send();

    }).catch(function(err) {
       reject(err);
    });
  });
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.downloadDlgHide()
// サーバーの写真ファイルダウンロードメッセージダイアログの非表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.downloadDlgHide = function() {
  $('#download-dlg').hide();
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.setInformationHeader()
// 写真撮影日時・枚数 等の情報をセーブ (infomation/cotrol.json)
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.setInformationHeader = function(koujiname, addcount, fast_datetime, last_datetime, callback) {
  _log(1,'function','koujiInfoList.setInformationHeader()');

  var json_text = { koujiname:'',fast_datetime:'',last_datetime:'',picture_count:0,upload_count:0,shootinglistNo:'',geoLocation:{} };
  var folderurl = koujiname + '/information';
  var filename = 'control.json';

  localStrage.getJsonFile(folderurl, filename, function(result) {
    // 読み込んだテキストをJSON形式に変換
    var text = result;
    var k = {};
    try {
      k = JSON.parse(text);
    }catch(e){
      k.fast_datetime  = '9999/99/99 99:99';
      k.last_datetime  = '0000/00/00 00:00';
      k.shootinglistNo = '';
    }

    json_text.koujiname = koujiname;
    // 最初撮影日時をセット
    if(k.fast_datetime > fast_datetime) {
      json_text.fast_datetime = fast_datetime;
    }else{
      json_text.fast_datetime = k.fast_datetime;
    }
    // 最終撮影日時をセット
    if(k.last_datetime < last_datetime) {
      json_text.last_datetime = last_datetime;
    }else{
      json_text.last_datetime = k.last_datetime;
    }
    json_text.shootinglistNo = k.shootinglistNo;
    // 撮影枚数をカウントアップ
    if(k.picture_count === undefined) {k.picture_count = 0;};
    if(k.upload_count  === undefined) {k.upload_count  = 0;};
    json_text.picture_count = k.picture_count + addcount;
    json_text.upload_count = k.upload_count + addcount;
    // jsonオブジェクトに変換
    var json_out  = JSON.stringify(json_text);
    blob = new Blob( [json_out], {type:"JSON\/javascript"} );
    // デバイスローカル(documentsDirectory)に保存
    localStrage.saveBlobFile(folderurl, filename, blob, function(url){
      _log(1,'localStrage.setInformationHeader','update normalend');
      callback(null);
    },
    function fail(message) {
      callback(message);
    });
  },
  function(e) {
    // エラーが返ってきた場合はファイルが無いとみなし、新規作成する
    // 工事名称をセット
    json_text.koujiname = koujiname;
    // 撮影開始日時をセット
    json_text.fast_datetime = fast_datetime;
    json_text.last_datetime = last_datetime;
    // 撮影枚数をセット
    json_text.picture_count = addcount;
    json_text.upload_count  = addcount;
    // jsonオブジェクトに変換
    var json_out  = JSON.stringify(json_text);
    blob = new Blob( [json_out], {type:"JSON\/javascript"} );
    // デバイスローカル(documentsDirectory)に保存
    localStrage.saveBlobFile(folderurl, filename, blob, function(url){
      _log(1,'localStrage.setInformationHeader','new normalend');
      callback(null);
    },
    function fail(message) {
      callback(message);
    });
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.toKoujiInfoList()
// 工事写真一覧から工事一覧画面に戻る
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.toKoujiInfoList = function() {
  _log(1,'function','koujiInfoList.toKoujiInfoList()');

  // 写真一覧表示ループを中断する
  loopBreakflg = true;

  // リストを初期化
  $("#koujiPictureList").empty();

  // 工事情報一覧画面に戻る
  setNavigator.popPage();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.toCamera()
// カメラ撮影画面への切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.toCamera = function() { 
  _log(1,'function','koujiInfoList.toCamera()');

  // 写真一覧表示ループを中断する
  loopBreakflg = true;

  // 工事情報のリストを初期化
  $("#koujiInfoList").empty();
  $("#koujiPictureList").empty();
  $('#koujiInfoSearchKoujiname').val('');
  $('#koujiInfoSearchAddress').val('');
  $('#koujiInfoSearchBuilder').val(null);
  $('#koujiInfoSearchBuilder').empty()

  app.cameraButtonClick();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// koujiInfoList.toPopPage()
// 各種設定メニューに戻る
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.toPopPage = function() { 
  _log(1,'function','koujiInfoList.toPopPage()');

  // 工事情報のリストを初期化
  $("#koujiInfoList").empty();
  $("#koujiPictureList").empty();
  $('#koujiInfoSearchKoujiname').val('');
  $('#koujiInfoSearchAddress').val('');
  $('#koujiInfoSearchBuilder').val(null);
  $('#koujiInfoSearchBuilder').empty()

  setNavigator.popPage();
};

