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
      elm = elm + '<ons-list-item class="textsize5" style="color:green;border-bottom:solid 2px gray;">'+data[0]+'\n';
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
        elm = elm + '      <a href="'+locat+'">';
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

  $('#splashModal').hide();
};

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
// koujiInfoList.toCamera()
// カメラ撮影画面への切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
koujiInfoList.toCamera = function() { 
  _log(1,'function','koujiInfoList.toCamera()');

  // 工事情報のリストを初期化
  $("#koujiInfoList").empty();
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
  $('#koujiInfoSearchKoujiname').val('');
  $('#koujiInfoSearchAddress').val('');
  $('#koujiInfoSearchBuilder').val(null);
  $('#koujiInfoSearchBuilder').empty()

  setNavigator.popPage();
};

