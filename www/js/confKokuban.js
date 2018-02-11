//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// confKokubanInitial()
// 黒板設定の設定値読み込みと初期設定
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function confKokubanInitial() {
  _log(1,'function','confKokubanInitial()');

  // 画面のサイズによってフォントサイズを変える
  if(displayDeviceSize()==='small') {
    $('#confKokubanItem ons-col').css({'font-size':'16px'});
    $('#confKokubanItem button').css({'font-size':'16px'});
    $('#confKokubanItem ons-icon').attr({'size':'20px'});
  };  
  if(displayDeviceSize()==='large') {
    $('#confKokubanItem ons-col').css({'font-size':'22px'});
    $('#confKokubanItem button').css({'font-size':'22px'});
    $('#confKokubanItem ons-icon').attr({'size':'30px'});
  };  
  
  // ローカルストレージから読み込み
  var str = localStrage.getItems('firebase:group00/config/kokuban');
  // 読み込んだテキストをJSON形式に変換
  var k = JSON.parse(str);
  
  // 黒板表示・非表示
  var showFlag = true;
  try {
    if(k.showFlag === false) {
      showFlag = false;
    }
  } catch(e) {
    _errorlog(1,'confKokubanInitial()',e);
  }
  if(showFlag) {
    $('#kokuban-showflag-on').attr('checked',true);
  } else {
    $('#kokuban-showflag-off').attr('checked',true);
  }
  // 黒板表示･非表示切り替え
  $('#kokuban-showflag-on').on('change', function(e) {
    kokubanChangeShowflag(true);
  });
  $('#kokuban-showflag-off').on('change', function(e) {
    kokubanChangeShowflag(false);
  });
  
  // 黒板サイズ指定
  $('#kokuban-size-medium').attr('checked',true);
  try {
    $('#kokuban-size-'+k.size).attr('checked',true);
  } catch(e) {
  }
  // 黒板サイズの切り替え
  $('input[name="kokuban-size"]').on('click', function() {
    kokubanChangeSize(this);
  });

  // 黒板色設定
  $('#kokuban-color-dg').attr('checked',true);
  try {
    if(k.color==='white') {
      $('#kokuban-color-w').attr('checked',true);
      kokubanChangeColor('#kokuban-color-w');
    } else {
      if(k.color==='green') {
        $('#kokuban-color-g').attr('checked',true);
        kokubanChangeColor('#kokuban-color-g');
      } else {   
        $('#kokuban-color-dg').attr('checked',true);
        kokubanChangeColor('#kokuban-color-dg');
      }  
    }  
  } catch(e) {
  }
  // 黒板色の切り替え
  $('input[name="kokuban-color"]').on('click', function() {
    kokubanChangeColor(this.id);
  });
  
  // 黒板の種類
  var typeNo = '0010';
  try {
    if(k.typeNo.length === 4) {
      typeNo = k.typeNo;
    }
  } catch(e) {
    _errorlog(1,'confKokubanInitial()',e);
  }
}

//====================================================
// kokubanSelectModal()
// オリジナルの黒板を選択するダイアログを表示
//====================================================
function kokubanSelectModal() {
  _log(1,'function','kokubanSelectModal()');
  
  $("#kokubanSelected").empty();
  var str = '';
  
  // ローカルストレージから読み込み
  str = localStrage.getItems('firebase:group00/config/kokuban');
  // 読み込んだテキストをJSON形式に変換
  var k = JSON.parse(str);
  var fileEx = '_dg.jpg';
  if(k.color === 'darkslategray') {
    fileEx = '_dg.jpg';
  }else{  
    if(k.color === 'green') {
      fileEx = '_g.jpg';
    }else{
      if(k.color === 'white') {
        fileEx = '_w.jpg';
      }
    }
  }  

  // 黒板の種類を取得
  str = localStrage.getItems('firebase:kokuban/list');
  // 読み込んだテキストをJSON形式に変換
  var name = 'name';
  var k1 = JSON.parse(str);
  Object.keys(k1).forEach(function(code) {
    
    str = localStrage.getItems('firebase:kokuban/'+code);
    // 読み込んだテキストをJSON形式に変換
    var k2 = JSON.parse(str);
      
    var kokubanWidth  = k2.frame.w;
    var kokubanHeight = k2.frame.h;
    var imageBairit = window.innerWidth / 320 * 0.4;
    
    kokubanView(code, k1[code][name], kokubanWidth * imageBairit, kokubanHeight * imageBairit );
  });
  $('#kokubanViewModal').show();
  
  function kokubanView(code, name, width, height) {
      
    // 黒板イメージのリストを作成
    var html = '<ons-list-item id="kokuban-'+code+'" tappable modifier="longdivider chevron" style="padding-top:0px" onclick="kokubanSelected(this)">'+
               '  <ons-row><p>'+name+'</p></ons-row>'+
               '  <ons-row>'+
               '    <img id="image-'+code+'" width="'+width+'px" height="'+height+'px" src="img/kokuban/'+code+fileEx+'" style="padding-top:0px;margin-top:0px;">'+
               '  </ons-row>'+
               '</ons-list-item>';
    var elm = $(html);
    elm.appendTo($('#kokubanSelected'));
  }
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// kokubanSelected()
// 黒板リストから選択した番号を取得してストレージに保存
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function kokubanSelected(obj) {
  _log(1,'function','kokubanSelected()');

  // 黒板リストから選択した番号を取得
  var objid = $(obj).attr('id');
  var name = objid.split('-');
  var typeNo = '0010';
  if(name[1] > '0000' && name[1] < '9999') {
    typeNo = name[1];
  }
  // 選択した黒板番号を保存
  kokubanItemSet('typeNo', typeNo);
  
  // 黒板設定画面を再表示
  confKokubanInitial();
  // 黒板選択画面を非表示
  kokubanViewModal.hide();
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// kokubanChangeShowflg()
// 黒板表示･非表示切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function kokubanChangeShowflag(flg) {
  _log(1,'function','kokubanChangeShowflg()');
  
  // ローカルストレージに書き戻す
  kokubanItemSet('showFlag', flg);
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// kokubanChangeSize()
// 黒板サイズの切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function kokubanChangeSize(obj) {
  _log(1,'function','kokubanChangeSize('+obj.id+')');
  
  try {
    // 選択したボタン名からサイズ名を取得
    var size = obj.id.split('-');
    if(size[2]==='minimum' || size[2]==='small' || size[2]==='medium' || size[2]==='large' || size[2]==='free'){
      // ローカルストレージに書き戻す
      kokubanItemSet('size', size[2]);
    }
  } catch(e) {
    _log(2,'size error',e);
  }  
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// kokubanChangeColor()
// 黒板色の切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function kokubanChangeColor(id) {
  _log(1,'function','kokubanChangeColor('+id+')');

  // 黒板色指定
  try {
    // 選択したボタン名から色を取得
    var colorCd = id.split('-');
    var fileEx = '_dg.jpg';
    if(colorCd[2]==='dg' || colorCd[2]==='g' || colorCd[2]==='w'){
      // ローカルストレージに書き戻す
      if(colorCd[2]==='dg') {
        fileEx = '_dg.jpg';
        color  = 'darkslategray';
      }
      if(colorCd[2]==='g') {
        fileEx = '_g.jpg';
        color  = 'green';
      }
      if(colorCd[2]==='w') {
        fileEx = '_w.jpg';
        color  = 'white';
      }

      // 黒板の種類を取得
      var str = localStrage.getItems('firebase:group00/config/kokuban');
      // 読み込んだテキストをJSON形式に変換
      var k = JSON.parse(str);
      var fileName = 'img/kokuban/';
      var typeNo = '0010';
      typeNo = k.typeNo;
      // 標準の黒板サンプル表示を変更
      $('#kokuban-image').attr('src', fileName + typeNo + fileEx);
  
      // ローカルストレージに書き戻す
      kokubanItemSet('color', color);
    }
  } catch(e) {
    _log(2,'color error',e);
  }
}

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// kokubanItemSet()
// ローカルストレージに黒板設定情報を更新
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function kokubanItemSet(key, val) {
  _log(1,'function','kokubanItemSet('+key+' : '+val+')');
  
  // ローカルストレージから読み込み
  var str = localStrage.getItems('firebase:group00/config/kokuban');
  // 読み込んだテキストをJSON形式に変換
  var k = JSON.parse(str);
  
  // 値を変更する  
  k[key] = val;
  
  // JSON形式をテキスト形式に変換
  str = JSON.stringify(k);
  // ローカルストレージに書き戻し
  localStrage.setItems('firebase:group00/config/kokuban', str); 
}
