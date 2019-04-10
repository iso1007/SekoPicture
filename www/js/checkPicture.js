var pictureCheckList = function() {};
var saveTreeStyle = [];

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
    // リストのhtmlヘッダーを生成
    htmlHeader(koujiname,listname);
    // 撮影項目リストを取得し、リストのhtmlを生成
    var ary = getPictureItem(listindex,listname);
    // 撮影した写真を参照し、チェックリストの消込
    loopPictureList(koujiname, ary);
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

  var pictureCheckListArray = [];

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
    $.each(obj1, function(i, key1) {
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
            pictureCheckListArray[fid1] = {level: 1, item: str1, id: fid1, kubun: 'header', ico1:'fa-minus-square-o', ico2:'', max: num1, cnt: 0, prm: true};
          }else{
            pictureCheckListArray[fid1] = {level: 1, item: str1, id: fid1, kubun: 'item', ico1:'fa-caret-right', ico2:'', max: num1, cnt: 0, prm: true};
          };
        };
      };

      // 備考第2階層をループしリストを作成する
      var obj2 = Object.keys(json[field][key1]);
      $.each(obj2, function(i, key2) {
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
              pictureCheckListArray[fid2] = {level: 2, item: str2, id: fid2, kubun: 'header', ico1:'fa-minus-square-o', ico2:'', max: num2, cnt: 0, prm: true};
            }catch(e){
              pictureCheckListArray[fid2] = {level: 2, item: str2, id: fid2, kubun: 'item', ico1:'fa-caret-right', ico2:'', max: num2, cnt: 0, prm: true};
            };
          };

          // 備考第3階層をループしリストを作成する
          var obj3 = Object.keys(json[field][key1][key2]);
          $.each(obj3, function(i, key3) {
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
                  pictureCheckListArray[fid3] = {level: 3, item: str3, id: fid3, kubun: 'header', ico1:'fa-minus-square-o', ico2:'', max: num3, cnt: 0, prm: true};
                }catch(e){
                  pictureCheckListArray[fid3] = {level: 3, item: str3, id: fid3, kubun: 'item', ico1:'fa-caret-right', ico2:'', max: num3, cnt: 0, prm: true};
                };
              };

              // 備考第4階層をループしリストを作成する
              var obj4 = Object.keys(json[field][key1][key2][key3]);
              $.each(obj4, function(i, key4) {
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
                      pictureCheckListArray[fid4] = {level: 4, item: str4, id: fid4, kubun: 'header', ico1:'fa-minus-square-o', ico2:'', max: num4, cnt: 0, prm: true};
                    }catch(e){
                      pictureCheckListArray[fid4] = {level: 4, item: str4, id: fid4, kubun: 'item', ico1:'fa-caret-right', ico2:'', max: num4, cnt: 0, prm: true};
                    };
                  };

                  // 備考第5階層をループしリストを作成する
                  var obj5 = Object.keys(json[field][key1][key2][key3][key4]);
                  $.each(obj5, function(i, key5) {
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
                          pictureCheckListArray[fid5] = {level: 5, item: str5, id: fid5, kubun: 'header', ico1:'fa-minus-square-o', ico2:'', max: num5, cnt: 0, prm: true};
                        }catch(e){
                          pictureCheckListArray[fid5] = {level: 5, item: str5, id: fid5, kubun: 'item', ico1:'fa-caret-right', ico2:'', max: num5, cnt: 0, prm: true};
                        };
                      };

                      // 備考第6階層をループしリストを作成する
                      var obj6 = Object.keys(json[field][key1][key2][key3][key4][key5]);
                      $.each(obj6, function(i, key6) {
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
                              pictureCheckListArray[fid6] = {level: 6, item: str6, id: fid6, kubun: 'header', ico1:'fa-minus-square-o', ico2:'', max: num6, cnt: 0, prm: true};
                            }catch(e){
                              pictureCheckListArray[fid6] = {level: 6, item: str6, id: fid6, kubun: 'item', ico1:'fa-caret-right', ico2:'', max: num6, cnt: 0, prm: true};
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

  return pictureCheckListArray;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureCheckList.loopPictureList()
// 撮影写真の情報を取得
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureCheckList.loopPictureList = async function(koujiname, ary) {
  _log(1,'function','pictureCheckList.loopPictureList()');

  var pictureCheckListArray = ary;

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
  // 規定の条件に到達しているかをチェック
  promissPictureChecked();

  // htmlを作成･表示
  pictureCheckList.htmlItem(pictureCheckListArray);

  // 撮影済みの写真枚数をカウント
  function setPictureCount(pictureId) {
    // 管理コードを"-"区切りで配列に取得
    var ids = pictureId.split('-');
    var fid = '';
    // 撮影リストIDを分割してループ
    for(var i = 0 ; i < ids.length ; i++) {

      if(fid === '') {
        fid = ids[i];
      }else{
        fid = fid + '-' + ids[i];
      }

      // 写真枚数をカウントアップ
      try {
        var pcnt = pictureCheckListArray[fid].cnt;
        pcnt++;
        pictureCheckListArray[fid].cnt = pcnt;
      } catch(e) {
      }
    };
  }

  // 規定の条件に到達しているかをチェック
  function promissPictureChecked() {
    for(var key in pictureCheckListArray) {
      var kubun = pictureCheckListArray[key].kubun;

      if(kubun === 'item') {
        // 管理コードを"-"区切りで配列に取得
        var fid = key;
        var flg = true;
        var len = fid.split('-').length;
        var pcnt = 0; pmax = 0;
        // 撮影リストIDを分割してループ
        for(var i = len ; i > 0 ; i--) {

          fid = fid.substr(0, 2+(i-1)*3);
          pcnt = pictureCheckListArray[fid].cnt;  // 写真枚数
          pmax = pictureCheckListArray[fid].max;  // 規定枚数
          if(pmax > 0 && pcnt < pmax) {
            flg = false;
          }

          if(flg === false) {
            pictureCheckListArray[fid].prm = false;
          }

          if(pmax == 0 && pcnt == 0) {
            pictureCheckListArray[fid].prm = false;
          }
        }
      }
    }
  }
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
pictureCheckList.htmlItem = function(ary) {
  _log(1,'function','pictureCheckList.htmlItem()');

  var allCount = 0; untreatedCount = 0;
  // アイコンの表示スタイルを指定
  for(var key in ary) {
    if(ary[key].max > 0) {
      allCount++;
      if(ary[key].prm === false) {
        untreatedCount++;
      }
    }

    // 親階層のアイコンスタイル
    if(ary[key].kubun === 'header') {
      // 撮影枚数=0の場合は中抜き
      if(ary[key].cnt == 0) {
        ary[key].ico2 = 'fa-star-o';
      }else{
        // 撮影枚数 ＜ 規定枚数
        if(ary[key].prm === false || ary[key].cnt < ary[key].max) {
          // 規定枚数に達していない場合は半分中抜き
          ary[key].ico2 = 'fa-star-half-o';
        }else{
          // 規定枚数に達している場合は塗りつぶし
          ary[key].ico2 = 'fa-star';
        }
      }
    }else{
      // 子層のアイコンスタイル
      if(ary[key].kubun === 'item') {
        ary[key].ico2 = 'fa-camera';
      }
    }

    // 規定枚数に到達していない場合はアイコンをオレンジ表示
    var ico2Color = 'darkorange';
    if(ary[key].prm) {ico2Color = 'royalblue';}

    var html =
      '<ons-list-item id="'+key+'" class="'+key+'" list-item list-item--longdivider tappable modifier="longdivider" style="padding-left:0px" onclick="pictureCheckList.takeItemClick(this)">'+
      '  <ons-row>'+
      '    <ons-col class="textsize5" width="'+((ary[key].level-1)*4)+'%"></ons-col>'+
      '    <ons-col class="textsize5" width="7%">'+
      '      <ons-icon class="iconsize3" id="icon1'+key+'" fixed-width="true" style="color: green" icon="'+ary[key].ico1+'"></ons-icon>'+
      '    </ons-col>'+
      '    <ons-col class="textsize5" id="biko'+key+'" width="'+(69-((ary[key].level-1)*4))+'%">'+ary[key].item+'</ons-col>'+
      '    <ons-col>'+
      '      <ons-icon class="iconsize3" id="icon2'+key+'" fixed-width="true" icon="'+ary[key].ico2+'" style="color:'+ico2Color+'"></ons-icon>'+
      '    </ons-col>'+
      '    <ons-col class="textsize5" width="7%" style="color:blue;text-align:right" id="pcnt'+key+'"">'+ary[key].cnt+'</ons-col>'+
      '    <ons-col class="textsize5" width="2%" style="text-align:right">/</ons-col>'+
      '    <ons-col class="textsize5" width="7%" style="color:blue;text-align:right" id="pmax'+key+'"">'+ary[key].max+'</ons-col>'+
      '    <ons-col style="display:none" id="prms'+key+'"">'+ary[key].prm+'</ons-col>'+
      '  </ons-row>'+
      '</ons-list-item>';
    var elm = $(html);
    elm.appendTo($("#pictureCheckList"));
  }

  // ツリーの開閉状態を復元する
  $('#pictureCheckList').children('ons-list-item').each(function(i) {
    // 選択されたアイテムのIDを取得
    var select = $(this).attr('id');
    if(saveTreeStyle[select]　=== 'close') {
      pictureCheckList.takeItemClick(this);
    }
  });

  // 確認ボタンのインジケーターカラーを指定
  if(untreatedCount === 0) {
    $('#pictureCheckerIcon').attr('icon','fa-star');
    $('#pictureCheckerIcon').css({'color':'royalblue'});
  }else{
    try {
      if(allCount === untreatedCount) {
        $('#pictureCheckerIcon').attr('icon','fa-star-o');
      }else{
        $('#pictureCheckerIcon').attr('icon','fa-star-half-o');
      }
      var wariai = Math.round((allCount - untreatedCount) / allCount * 100);
      var rgbColor = 'rgb(255,'+(100+wariai)+',0)';
      $('#pictureCheckerIcon').css({'color':rgbColor});
    }catch(e){
    }
  }
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

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureCheckList.treeCheker()
// 撮影必須項目の確認リストを表示
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureCheckList.treeCheker = function() {
  _log(1,'function','pictureCheckList.treeCheker()');


  $('#pictureCheckList').children('ons-list-item').each(function(i) {
    // 選択されたアイテムのIDを取得
    var selectName = $(this).attr('id');

    // 規定枚数に達しているかどうかのフラグ
    var prms = $('#prms'+selectName).text();
    // 選択されたアイテムのアイコン[+][-]IDを取得
    var icon1 = $('#icon1'+selectName).attr('icon');
    // 規定枚数に到達していて、ツリーが開いている場合
    if(prms === 'true' && icon1 === 'fa-minus-square-o') {
      // 開いたツリーを閉じる
      pictureCheckList.takeItemClick(this);
    };
    // 規定枚数に到達していなくて、ツリーが閉じている場合
    if(prms === 'false' && icon1 === 'fa-plus-square-o') {
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
    // ツリーの開閉状態を保存
    pictureCheckList.saveChecked(selectName, 'close');
  };
  // アイコンが[+](ツリーを閉じている状態)の場合
  if(icon1 === 'fa-plus-square-o') {
    // アイコンを[-]に変更
    $('#icon1'+selectName).attr('icon','fa-minus-square-o');
    // 配下のツリーアイテムのクラス名先頭の'S'を削除
    takeItemSelect('show');
    // 配下のツリーアイテムを表示状態にする
    $('ons-list-item[class^="'+selectName+'-"]').show();
    // ツリーの開閉状態を保存
    pictureCheckList.saveChecked(selectName, 'open');
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
// pictureCheckList.saveChecked()
// アイコンツリーの開閉状態をローカルストレージに保存
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
pictureCheckList.saveChecked = function(select, style) {
  _log(1,'function','pictureCheckList.saveChecked()');

  saveTreeStyle[select] = style;
}

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
		},
		function(msg) {
      _errorlog(1,'工事名:'+koujiname+' 撮影リスト番号:'+shootinglistNo);
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
  $('#pictureCheckList').empty();
  // 設定メニューを初期メニューに戻す
//  chkNavigator.resetToPage('checkPicture.html');

  // カメラ画面の表示
  $('#camera').show();
  // ステータスバーの非表示
  StatusBar.hide();

  // 黒板イメージの再生成
  kokuban.makeframe();

  // 設定メニュー画面の非表示
  $('#chkNavigator').hide();
};
