var pictureCheckList = function() {};

//====================================================
// pictureCheckList.getCheckListName()
// 工事名称から撮影リスト番号と名称を取得
//====================================================
pictureCheckList.getCheckListName = function(koujiname) {
  _log(1,'function','pictureCheckList.getCheckListName()');

  // ローカルストレージから工事情報を読み込み
  var str = localStrage.getItems('firebase:group00/koujiList');
  // 読み込んだテキストをJSON形式に変換
  var json = JSON.parse(str);

  var keyname = 'shootinglistNo';
  var listno  = '';

  // ローカルストレージの工事情報から撮影リスト番号を取得する
  // 工事情報が無い場合はlistnoに空白をセット
  try {
    listno = json[koujiname][keyname];
  }catch(e){
  };
  if(listno === undefined) {listno = '';};

  // 撮影リスト名の種類を取得
  var str = localStrage.getItems('firebase:group00/config/shootingList');
  // 読み込んだテキストをJSON形式に変換
  var json = JSON.parse(str);

  var listindex = '';
  var keyname   = 'name';
  var listname  = '';

  // 撮影リストが１パターンしか定義されていない場合は、無条件に00を選択させる
  try {
    listindex = 'list01';
    listname  = json[listindex][keyname];
    listname  = '';
  }catch(e){
    listno    = '00';
  };

  // 工事情報が定義済みでリスト番号が指定されている場合
  if(listno >= '00' || listno <= '99') {
    // 撮影リストから名称を取得
    listindex = 'list'+listno;
    // 指定されたリストが存在する場合はリスト名称を取得する
    // リストが存在しない場合は番号と名称を初期化する
    try {
      listname = json[listindex][keyname];
    }catch(e){
      listno   = '';
      listname = '';
    }
    if(listname === undefined) {listno = '';};
  };

  // リストのhtmlヘッダーを生成
  pictureCheckList.htmlHeader(koujiname,listname);

  // 撮影リストが定義されていないか誤っている場合は検索ダイアログを表示
  if(listno === '') {
    // 撮影リストから名称を選択
    pictureCheckList.checkListSelectModal();
  }else{
    // 撮影リストの作成・表示
    pictureCheckList.checkListDisplay(koujiname,listindex,listname);
  };
};

//====================================================
// pictureCheckList.checkListDisplay()
// 撮影リストを作成・表示する
//====================================================
pictureCheckList.checkListDisplay = function(koujiname,listindex,listname) {
  _log(1,'function','pictureCheckList.checkListDisplay()');

  with (pictureCheckList) {
    // 撮影項目リストを取得し、リストのhtmlを生成
    getPictureItem(listindex,listname);
    // 撮影した写真を参照し、チェックリストの消込
    loopPictureList(koujiname);
  };
};

//====================================================
// pictureCheckList.getPictureItem()
// 撮影リストを作成・表示する
//====================================================
pictureCheckList.getPictureItem = function(listindex,listname) {
  _log(1,'function','pictureCheckList.getPictureItem('+listindex+':'+listname+')');

  // ローカルストレージから黒板備考情報を読み込み
  var str = localStrage.getItems('firebase:group00/config/field');
  // 読み込んだテキストをJSON形式に変換
  var json = JSON.parse(str);

  // ローカルストレージのアイテム設定をループして検索リストにセット
  try {
    // 備考を配列で取得する
    var field  = 'field03';
    var item01 = 'item01';
    var name   = 'name';
    var list   = listindex;
    var display = 'display';
    var number = 'number';

    var obj1 = Object.keys(json[field]);
    // 備考第1階層をループしリストを作成する
    $.each(obj1, function(i, key1) {     // 2018/01/30 ADD
//  obj1.forEach(function(key1) {        // 2018/01/30 DEL
      var str1 = json[field][key1][name];
      var fid1 = key1.slice(-2);
      if(key1.match(/item/) && str1 !== undefined) {
        var dsp1 = false;
        var num1 = 0;
        try {
          dsp1 = json[field][key1][list][display];
          num1 = json[field][key1][list][number];
        }catch(e){};
        // 検索リストに要素を追加
        if(dsp1 === true) {
          var str2 = json[field][key1][item01][name];  // 見出し判定
          if(str2 !== undefined) {
            pictureCheckList.htmlItem(1, str1, fid1, 'header', num1);
          }else{
            pictureCheckList.htmlItem(1, str1, fid1, 'item', num1);
          };
        };
      };

      // 備考第2階層をループしリストを作成する
      var obj2 = Object.keys(json[field][key1]);
      $.each(obj2, function(i, key2) {     // 2018/01/30 ADD
//    obj2.forEach(function(key2) {        // 2018/01/30 DEL
        var str2 = json[field][key1][key2][name];
        var fid2 = key1.slice(-2)+'-'+key2.slice(-2);
        if(key2.match(/item/) && str2 !== undefined) {
          var dsp2 = false;
          var num2 = 0;
          try {
            dsp2 = json[field][key1][key2][list][display];
            num2 = json[field][key1][key2][list][number];
          }catch(e){};
          // 検索リストに要素を追加
          if(dsp2 === true) {
            try {
              var str3 = json[field][key1][key2][item01][name];  // 見出し判定
              pictureCheckList.htmlItem(2, str2, fid2, 'header', num2);
            }catch(e){
              pictureCheckList.htmlItem(2, str2, fid2, 'item', num2);
            };
          };

          // 備考第3階層をループしリストを作成する
          var obj3 = Object.keys(json[field][key1][key2]);
          $.each(obj3, function(i, key3) {     // 2018/01/30 ADD
//        obj3.forEach(function(key3) {        // 2018/01/30 DEL
            var str3 = json[field][key1][key2][key3][name];
            var fid3 = key1.slice(-2)+'-'+key2.slice(-2)+'-'+key3.slice(-2);
            if(key3.match(/item/) && str3 !== undefined) {
              var dsp3 = false;
              var num3 = 0;
              try {
                dsp3 = json[field][key1][key2][key3][list][display];
                num3 = json[field][key1][key2][key3][list][number];
              }catch(e){};
              // 検索リストに要素を追加
              if(dsp3 === true) {
                // 検索リストに要素を追加
                try {
                  var str4 = json[field][key1][key2][key3][item01][name];  // 見出し判定
                  pictureCheckList.htmlItem(3, str3, fid3, 'header', num3);
                }catch(e){
                  pictureCheckList.htmlItem(3, str3, fid3, 'item', num3);
                };
              };

              // 備考第4階層をループしリストを作成する
              var obj4 = Object.keys(json[field][key1][key2][key3]);
              $.each(obj4, function(i, key4) {     // 2018/01/30 ADD
//            obj4.forEach(function(key4) {        // 2018/01/30 DEL
                var str4 = json[field][key1][key2][key3][key4][name];
                var fid4 = key1.slice(-2)+'-'+key2.slice(-2)+'-'+key3.slice(-2)+'-'+key4.slice(-2);
                if(key4.match(/item/) && str4 !== undefined) {
                  var dsp4 = false;
                  var num4 = 0;
                  try {
                    dsp4 = json[field][key1][key2][key3][key4][list][display];
                    num4 = json[field][key1][key2][key3][key4][list][number];
                  }catch(e){};
                  // 検索リストに要素を追加
                  if(dsp4 === true) {
                    // 検索リストに要素を追加
                    try {
                      var str5 = json[field][key1][key2][key3][key4][item01][name];  // 見出し判定
                      pictureCheckList.htmlItem(4, str4, fid4, 'header', num4);
                    }catch(e){
                      pictureCheckList.htmlItem(4, str4, fid4, 'item', num4);
                    };
                  };

                  // 備考第5階層をループしリストを作成する
                  var obj5 = Object.keys(json[field][key1][key2][key3][key4]);
                  $.each(obj5, function(i, key5) {     // 2018/01/30 ADD
//                obj5.forEach(function(key5) {        // 2018/01/30 DEL
                    var str5 = json[field][key1][key2][key3][key4][key5][name];
                    var fid5 = key1.slice(-2)+'-'+key2.slice(-2)+'-'+key3.slice(-2)+'-'+key4.slice(-2)+'-'+key5.slice(-2);
                    if(key5.match(/item/) && str5 !== undefined) {
                      var dsp5 = false;
                      var num5 = 0;
                      try {
                        dsp5 = json[field][key1][key2][key3][key4][key5][list][display];
                        num5 = json[field][key1][key2][key3][key4][key5][list][number];
                      }catch(e){};
                      // 検索リストに要素を追加
                      if(dsp5 === true) {
                        // 検索リストに要素を追加
                        try {
                          var str6 = json[field][key1][key2][key3][key4][key5][item01][name];  // 見出し判定
                          pictureCheckList.htmlItem(5, str5, fid5, 'header', num5);
                        }catch(e){
                          pictureCheckList.htmlItem(5, str5, fid5, 'item', num5);
                        };
                      };

                      // 備考第6階層をループしリストを作成する
                      var obj6 = Object.keys(json[field][key1][key2][key3][key4][key5]);
                      $.each(obj6, function(i, key6) {     // 2018/01/30 ADD
//                    obj6.forEach(function(key6) {        // 2018/01/30 DEL
                        var str6 = json[field][key1][key2][key3][key4][key5][key6][name];
                        var fid6 = key1.slice(-2)+'-'+key2.slice(-2)+'-'+key3.slice(-2)+'-'+key4.slice(-2)+'-'+key5.slice(-2)+'-'+key6.slice(-2);
                        if(key6.match(/item/) && str6 !== undefined) {
                          var dsp6 = false;
                          var num6 = 0;
                          try {
                            dsp6 = json[field][key1][key2][key3][key4][key5][key6][list][display];
                            num6 = json[field][key1][key2][key3][key4][key5][key6][list][number];
                          }catch(e){};
                          // 検索リストに要素を追加
                          if(dsp6 === true) {
                            // 検索リストに要素を追加
                            try {
                              var str7 = json[field][key1][key2][key3][key4][key5][key6][item01][name];  // 見出し判定
                              pictureCheckList.htmlItem(6, str6, fid6, 'header', num6);
                            }catch(e){
                              pictureCheckList.htmlItem(6, str6, fid6, 'item', num6);
                            };
                          };
                        };
                      });
                    };
                  });
                };
              });
            };
          });
        };
      });
    });
  } catch(e) {
    _errorlog(1,'pictureCheckList.getPictureItem()',e);
  };
};


//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureCheckList.htmlHeader()
// 写真撮影チェックリストのHTMLヘッダーを作成
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureCheckList.htmlHeader = function(koujiname,listname) {
  _log(1,'function','pictureCheckList.htmlHeader()');

  // チェックリストのアイテムをクリアする
  $('#pictureCheckList').empty();

  // チェックリスト名称を表示
  $('#pictureCheckListName').text(listname);
  $('#pictureCheckListName').css({'text-decoration':'underline'});

  // 工事名称を表示
  $('#pictureCheckKoujimei').text(koujiname);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureCheckList.htmlItem()
// 写真撮影チェックリストのHTMLアイテムリストを作成
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureCheckList.htmlItem = function(level, str, fid, flg, num) {
  _log(1,'function','pictureCheckList.htmlItem()');

  var html = '<ons-list-item id="'+fid+'" tappable modifier="longdivider" style="padding-left:0px" onclick="pictureCheckList.takeItemClick(this)">'+
             '  <ons-row>'+
             '    <ons-col class="textsize5" width="'+((level-1)*4)+'%"></ons-col>'+
             '    <ons-col class="textsize5" width="7%">'+
             '      <ons-icon class="iconsize3" id="icon1'+fid+'" fixed-width="true" style="color: green"></ons-icon>'+
             '    </ons-col>'+
             '    <ons-col class="textsize5" id="biko'+fid+'" width="'+(69-((level-1)*4))+'%">'+str+'</ons-col>'+
             '    <ons-col>'+
             '      <ons-icon class="iconsize3" id="icon2'+fid+'" fixed-width="true"></ons-icon>'+
             '    </ons-col>'+
             '    <ons-col class="textsize5" width="7%" style="color:blue;text-align:right" id="pcnt'+fid+'"">0</ons-col>'+
             '    <ons-col class="textsize5" width="2%" style="text-align:right">/</ons-col>'+
             '    <ons-col class="textsize5" width="7%" style="color:blue;text-align:right" id="pmax'+fid+'""></ons-col>'+
             '  </ons-row>'+
             '</ons-list-item>';
  var elm = $(html);
  elm.appendTo($("#pictureCheckList"));
  $('#'+fid).attr('class', fid + ' list-item list-item--longdivider');

  if(flg==='header') {
    $('#icon1'+fid).attr('icon', 'fa-minus-square-o');
    $('#icon2'+fid).attr('icon', 'fa-star-o');
  }else{
    $('#icon1'+fid).attr('icon', 'fa-caret-right');
    $('#icon2'+fid).attr('icon', 'fa-camera');
  };
  $('#icon2'+fid).css('color', 'darkorange');
  $('#pmax'+fid).text(num);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureCheckList.loopPictureList()
// 撮影写真の情報を取得
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureCheckList.loopPictureList = async function(koujiname) {
  _log(1,'function','pictureCheckList.loopPictureList()');

//  $('#splashModal').show();
//  $('#pictureCheckList').hide();
  $('#pictureCheckList').children('ons-list-item').each(function(i) {
    // 選択されたアイテムのIDを取得
    var fid = $(this).attr('id');
    // 写真枚数をクリア
    $('#pcnt'+fid).text('0');
    // アイコンの色をクリア
    $('#icon2'+fid).css('color', 'darkorange');
    // ☆アイコンのクリア
    if($('#icon2'+fid).attr('icon') === 'fa-star' ||
       $('#icon2'+fid).attr('icon') === 'fa-star-half-o') {
      $('#icon2'+fid).attr('icon', 'fa-star-o');
    }
  });

  // iosはDocuments/クラウド非同期フォルダ/工事名フォルダを参照
  var folderurl = cordova.file.documentsDirectory + koujiname;
  try {
    // directoryEntryオブジェクトを取得
    var directoryEntry = await localFile.getFileSystemURL(folderurl);
    // directoryReaderを生成してフォルダ内のファイル情報の配列を取得
    var fileEntrys = await localFile.getReadEntries(directoryEntry);

    var errcode = '';
    // ファイル情報の配列をループして、写真の詳細情報を取得する
    for(var i=0; i < fileEntrys.length; i++) {
      // 写真ファイルのリストを作成
      var fname = fileEntrys[i].name.split('.');
      var filename = fname[0];
      // .jpegファイルのみを処理対象とする
      if(fname[1]==='jpg') {
        try {
          // 撮影項目リストに写真情報を表示
          var infoFile = 'information/' + filename + '.json';
          // 写真情報ファイルのfileEntryオブジェクトを取得
          var fileEntry = await localFile.getFileEntry(directoryEntry, infoFile);
          // fileEntryオブジェクトからfileオブジェクトを取得
          var file = await localFile.getFileObject(fileEntry);
          // fileオブジェクトを読み込み
          var text = await localFile.getTextFile(file);
          // 読み込んだテキストをJSON形式に変換
          var json = JSON.parse(text);
          // 写真リストＩＤをセット
          if(json.pictureId === undefined) {json.pictureId = ''};
          // 写真枚数をセット
          setPictureCount(json.pictureId);
        } catch(e) {
          errcode = infoFile + '->' + e.code;
        }
      }
    }
    if(errcode !== '') {
      _alert('撮影済み工事写真のカウント処理が正常に行えませんでした。<br>('+errcode+')');
    }
  } catch(e) {
		if(e.code !== 1) {
      errcode = folderurl + '->' + e.code;
      _alert('撮影済み工事写真のフォルダ情報が正常に取得できませんでした。<br>('+errcode+')');
		}
  }
//  $('#pictureCheckList').show();
//  $('#splashModal').hide();

  // 撮影済みの写真枚数をカウント
  function setPictureCount(pictureId) {
    // 管理コードを"-"区切りで配列に取得
    var ary = pictureId.split('-');
    var fid = '';
    // 撮影リストIDを分割してループ
    for(var i = 0 ; i < ary.length ; i++) {

      if(fid === '') {
        fid = ary[i];
      }else{
        fid = fid + '-' + ary[i];
      }

      // 写真枚数をカウントアップ
      countUp(fid);
    };
  }
//===========================================================================
//===========================================================================
//==規定枚数以上の撮影をしている場合、親階層のカウントをしないようにする=====
//===========================================================================
//===========================================================================

  // 撮影リストＩＤに写真枚数をカウントアップ
  function countUp(fid) {
    var icon1 = $('#icon1'+fid).attr('icon');
    var pcnt = Number($('#pcnt'+fid).text());  // 写真枚数
    var pmax = Number($('#pmax'+fid).text());  // 規定枚数

    pcnt++;
    $('#pcnt'+fid).text(pcnt);

    // 撮影枚数 ＜ 規定枚数
    if(pcnt < pmax) {
      // オレンジ色
      $('#icon2'+fid).css('color', 'darkorange');
      // 親階層
      if(icon1 !== 'fa-caret-right') {
        // １枚も撮影していない場合は、中抜きの✩アイコン
        if(pcnt === '0') {
          $('#icon2'+fid).attr('icon', 'fa-star-o');
        }else{
        // 規定枚数に達していない場合は、半分中抜きのアイコン
          $('#icon2'+fid).attr('icon', 'fa-star-half-o');
        };
      };
    }else{
      // アイコンを青色にする
      $('#icon2'+fid).css('color', 'royalblue');
      // 親階層
      if(icon1 !== 'fa-caret-right') {
        // 塗りつぶしの★アイコン
        $('#icon2'+fid).attr('icon', 'fa-star');
      };
    };
  };
};

//====================================================
// pictureCheckList.treeOpen()
// チェックツリーを全て開いた状態にする
//====================================================
pictureCheckList.treeOpen = function() {
  _log(1,'function','pictureCheckList.treeOpen()');

  $('#pictureCheckList').children('ons-list-item').each(function(i) {
    // 選択されたアイテムのIDを取得
    var selectName = $(this).attr('id');

    // 選択されたアイテムのアイコン[+][-]IDを取得
    var icon1 = $('#icon1'+selectName).attr('icon');
    // アイコンが[-](ツリーを開いている状態)の場合
    if(icon1 === 'fa-plus-square-o') {

      // 開いたツリーを閉じる
      pictureCheckList.takeItemClick(this);
    };
  });
};

//====================================================
// pictureCheckList.treeClose()
// チェックツリーを全て閉じた状態にする
//====================================================
pictureCheckList.treeClose = function() {
  _log(1,'function','pictureCheckList.treeOpen()');

  $('#pictureCheckList').children('ons-list-item').each(function(i) {
    // 選択されたアイテムのIDを取得
    var selectName = $(this).attr('id');

    // 選択されたアイテムのアイコン[+][-]IDを取得
    var icon1 = $('#icon1'+selectName).attr('icon');
    // アイコンが[-](ツリーを開いている状態)の場合
    if(icon1 === 'fa-minus-square-o') {

      // 開いたツリーを閉じる
      pictureCheckList.takeItemClick(this);
    };
  });
};

//====================================================
// pictureCheckList.takeItemClick()
// チェックツリーアイテムクリック時、ツリーの開閉処理
//====================================================
pictureCheckList.takeItemClick = function(obj) {
  _log(1,'function','pictureCheckList.takeItemClick()');

  // 選択されたアイテムのIDを取得
  var selectName = $(obj).attr('id');

  // 選択されたアイテムのアイコン[+][-]IDを取得
  var icon1 = $('#icon1'+selectName).attr('icon');
  // アイコンが[-](ツリーを開いている状態)の場合
  if(icon1 === 'fa-minus-square-o') {
    // アイコンを[+]に変更
    $('#icon1'+selectName).attr('icon','fa-plus-square-o');
    // 配下のツリーアイテムを非表示にする
    $('ons-list-item[class^="'+selectName+'-"]').hide();
    // 配下のツリーアイテムのクラス名の先頭に'S'を付加
    // 閉じている状態を上位階層の開閉の影響を受けないように
    takeItemSelect('hide');
    // アイコンツリーの閉じた状態をローカルストレージに保存
    pictureCheckList.saveCheckStrage(obj);
  };
  // アイコンが[+](ツリーを閉じている状態)の場合
  if(icon1 === 'fa-plus-square-o') {
    // アイコンを[-]に変更
    $('#icon1'+selectName).attr('icon','fa-minus-square-o');
    // 配下のツリーアイテムのクラス名先頭の'S'を削除
    takeItemSelect('show');
    // 配下のツリーアイテムを表示状態にする
    $('ons-list-item[class^="'+selectName+'-"]').show();
  };
  // アイコンが[▸]撮影項目の場合
  if(icon1 === 'fa-caret-right') {
    // 備考をローカルストレージに保存
    setKokuban.itemSaveStrage('bikou', $('#biko'+selectName).text());
    // 撮影項目ＩＤをローカルストレージに保存
    setKokuban.itemSaveStrage('pictureId', selectName);
    // カメラ画面に戻る
    pictureCheckList.toCamera();
  };

  // 配下のツリーアイテムをループして、先頭の'S'を付加・削除
  function takeItemSelect(flg) {
    $('#pictureCheckList').children('ons-list-item').each(function(i) {
      var id = $(this).attr('id');
      // 選択したアイテムの配下のみを処理対象にする
      if(id > selectName+'-') {
        // 選択したアイテムの配下が終わったらループを抜ける
        if(id.indexOf(selectName+'-') !== 0) {
          return false;
        };

        // アイテムのclass名を取得
        var cl = $(this).attr('class');
        // 表示状態から非表示状態に変わったら先頭に'S'を付加する
        if(flg==='hide') {
          cl = 'S'+cl;
        };
        // 非表示状態から表示状態に変わったら先頭の'S'を削除する
        if(flg==='show') {
          if(cl.indexOf('S') === 0) {
            cl = cl.slice(1);
          };
        };
        // class名をセットする
        $(this).attr('class', cl);
      };
    });
  };
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureCheckList.saveCheckStrage()
// アイコンツリーの閉じた状態をローカルストレージに保存
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureCheckList.saveCheckStrage = function(obj) {
  _log(1,'function','pictureCheckList.saveCheckStrage()');

//  // 選択されたアイテムのIDを取得
//  var selectName = $(obj).attr('id');
//  var val = {selectName:""};
//  // 選択されたアイテムのアイコン[+]の状態を保存
//  localStrage.setItems('firebase:temp/checklist', val);
//
};

//====================================================
// pictureCheckList.checkListSelectModal()
// 撮影リストを選択するダイアログを表示
//====================================================
pictureCheckList.checkListSelectModal = function() {
  _log(1,'function','pictureCheckList.checkListSelectModal()');

  $('#pictureCheckListSelected').empty();

  // 撮影リストの種類を取得
  var str = localStrage.getItems('firebase:group00/config/shootingList');
  // 読み込んだテキストをJSON形式に変換
  var k = JSON.parse(str);
  Object.keys(k).forEach(function(key) {
    setCheckList(key, k[key]['name']);
  });
  $('#pictureCheckNameList').show();

  function setCheckList(key, name) {
    // 撮影リストの名前リストを作成
    var html = '<ons-list-item class="textsize5" id="pictureCheckList-'+key+'" tappable modifier="chevron" onclick="pictureCheckList.listSelected(this)">'+name+'</ons-list-item>';
    var elm = $(html);
    elm.appendTo($("#pictureCheckListSelected"));
  };
};

//====================================================
// pictureCheckList.listSelected()
// 撮影リストを選択した時の処理
//====================================================
pictureCheckList.listSelected = function(obj) {
  _log(1,'function','pictureCheckList.listSelected()');

  var koujiname = $('#pictureCheckKoujimei').text();
  var listname  = $(obj).text();
  var selectId  = $(obj).attr('id');
  var listno    = selectId.slice(-2);
  var listindex = selectId.split('-');

  // ローカルストレージから読み込み
//var str = localStrage.getItems('firebase:temp/koujiList');
  var str = localStrage.getItems('firebase:group00/koujiList');
  // 読み込んだテキストをJSON形式に変換
  var json = JSON.parse(str);

  // 該当の工事情報が無ければ作成する
  try {
    if(json[koujiname] === undefined){
      json[koujiname] = {};
    };
  }catch(e){
    json = {};
    json[koujiname] = {};
  };
  // 値を変更する
  var keyname = 'shootinglistNo';
  json[koujiname][keyname] = listno;

  // JSON形式をテキスト形式に変換
  str = JSON.stringify(json);
  // ローカルストレージに書き戻し
  //localStrage.setItems('firebase:temp/koujiList', str);
  localStrage.setItems('firebase:group00/koujiList', str);

  // firebaseDatabaseの工事情報の撮影リスト番号を更新
  setFirebaseShootinglistNo(koujiname, listno);

  // 撮影リストの情報を更新 (infomation/cotrol.json)
  pictureCheckList.setInformationHeader(koujiname, listno);

  // ダイアログを非表示にする
  pictureCheckNameList.hide();

  // 撮影リストの選択された名前からリストを再作成
  pictureCheckList.checkListDisplay(koujiname,listindex[1],listname);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureCheckList.setInformationHeader()
// 撮影リストの情報を更新 (infomation/cotrol.json)
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureCheckList.setInformationHeader = function(koujiname, shootinglistNo) {
  _log(1,'function','pictureCheckList.setInformationHeader()');

  var directory = koujiname+'/information';
  var filename = 'control.json';

  localStrage.getJsonFile(directory, filename, function(result) {
    // 読み込んだテキストをJSON形式に変換
    var text = result;
    var json_text = JSON.parse(text);

    // 撮影リスト番号を更新
    json_text.shootinglistNo = shootinglistNo;
    // jsonオブジェクトに変換
    var json_out = JSON.stringify(json_text);
    blob = new Blob( [json_out], {type:"JSON\/javascript"} );
    // デバイスローカル(documentsDirectory)に保存
    localStrage.saveBlobFile(directory, filename, blob, function(url){
      _log(1,'pictureCheckList.setInformationHeader','update normalend');
    });
  },
  function(e) {
    _errorlog(1,'pictureCheckList.setInformationHeader',directory+'/'+filename+'が見つかりませんでした。');
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureCheckList.toCamera()
// 撮影項目リストを終了しカメラ画面に切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureCheckList.toCamera = function() {
  _log(1,'function','pictureCheckList.toCamera()');

  // リストを初期化
//$('#pictureCheckList').empty();
  // 設定メニューを初期メニューに戻す
//chkNavigator.resetToPage('checkPicture.html');

  // カメラ画面の表示
  $('#camera').show();
  // ステータスバーの非表示
  StatusBar.hide();

  // 黒板イメージの再生成
  kokuban.makeframe();

  // 設定メニュー画面の非表示
  $('#chkNavigator').hide();
};
