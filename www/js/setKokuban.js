var setKokuban = function() {};
var commonShapeFolderName = 'CommonShape';

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// setKokuban.setItemInitialize()
// 黒板項目設定画面の読み込みと初期設定
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
setKokuban.setItemInitialize = function() {
  _log(1,'function','setKokuban.setItemInitialize()');

  // ローカルストレージから読み込み
  var str = localStrage.getItems('firebase:temp/kokuban');
  // 読み込んだテキストをJSON形式に変換
  var k = JSON.parse(str);
  if(typeof(k.kouji) === 'string') {
    $('#setInputKouji').val(k.kouji);
  };
  if(typeof(k.kousyu) === 'string') {
    $('#setInputKousyu').val(k.kousyu);
  };
  if(typeof(k.sokuten) === 'string') {
    $('#setInputSokuten').val(k.sokuten);
  };
  if(typeof(k.hiduke) === 'string') {
    $('#setInputHiduke').val(k.hiduke);
  };
  if(typeof(k.bikou) === 'string') {
    $('#setInputBikou').val(k.bikou);
  };
  if(typeof(k.syamei) === 'string') {
    $('#setInputSyamei').val(k.syamei);
  };
  if(typeof(k.pictureId) === 'string') {
    $('#setBikouPictureId').text(k.pictureId);
  };
  // 2018/01/24 -----↓ ADD
  if(k.shapeName === undefined) {k.shapeName  = '';}
  if(k.shapePosition === undefined) {k.shapePosition  = 'bottom-middle';}
  if(k.shapeReverse === undefined) {k.shapeReverse  = 'checked';}
  // 略図の縮小画像を表示
  if(k.shapeName !== '' && k.shapeUri !== '') {
    $('#setShapeButton').css({'display': 'none'});
    $('#setShapePanel').css({'display': 'block'});
    $('#setViewShape').attr({'src': k.shapeUri});
    $('#setShapePanelShapeName').text(k.shapeName);

    var objsrc = $('#'+k.shapePosition).attr('src');
    $('#setViewShapePosition').attr({'src': objsrc});

    $('#shapeReverseCheck').prop({'checked': k.shapeReverse});
  }
  // 2018/01/24 -----↑ ADD

  // ローカルストレージから工事情報を読み込み
  var str = localStrage.getItems('firebase:group00/koujiList');
  // 読み込んだテキストをJSON形式に変換
  var json_koji = JSON.parse(str);
  // 項目毎の検索イベントを定義する
  $('#setHelpKouji').off('click');
  $('#setHelpKouji').on('click',function() {
    setKokuban.setHelpKouji(json_koji);
  });

  // ローカルストレージから黒板設定情報を読み込み
  var str = localStrage.getItems('firebase:group00/config/field');
  // 読み込んだテキストをJSON形式に変換
  var json = JSON.parse(str);
  $('#setHelpKousyu').off('click');
  $('#setHelpKousyu').on('click',function() {
    setKokuban.setHelpKousyu(json);
  });
  $('#setHelpSokuten').off('click');
  $('#setHelpSokuten').on('click',function() {
    setKokuban.setHelpSokuten(json);
  });
  $('#setHelpHiduke').off('click');
  $('#setHelpHiduke').on('click',function() {
    setKokuban.setHelpHiduke();
  });
  $('#setHelpBikou').off('click');
  $('#setHelpBikou').on('click',function() {
    setKokuban.setHelpBikou(json);
  });
  $('#setHelpSyamei').off('click');
  $('#setHelpSyamei').on('click',function() {
    setKokuban.setHelpSyamei(json);
  });

  // 項目毎の入力項目クリック時に発生する検索を停止する
  $('#setInputKouji').off('click');
  $('#setInputKouji').on('click', function(e) {
    e.stopImmediatePropagation();
  });
  $('#setInputKousyu').off('click');
  $('#setInputKousyu').on('click', function(e) {
    e.stopImmediatePropagation();
  });
  $('#setInputSokuten').off('click');
  $('#setInputSokuten').on('click', function(e) {
    e.stopImmediatePropagation();
  });
  $('#setInputHiduke').off('click');
  $('#setInputHiduke').on('click', function(e) {
    e.stopImmediatePropagation();
  });
  $('#setInputBikou').off('click');
  $('#setInputBikou').on('click', function(e) {
    e.stopImmediatePropagation();
  });
  $('#setInputSyamei').off('click');
  $('#setInputSyamei').on('click', function(e) {
    e.stopImmediatePropagation();
  });

};

//====================================================
// setKokuban.setHelpKouji()
// 工事の検索リストを作成・表示する
//====================================================
setKokuban.setHelpKouji = function(json) {
  _log(1,'function','setKokuban.setHelpKouji()');

  // 検索ダイアログのリストを初期化
  $("#setHelpList").empty();
  var elm = $("<ons-list-item tappable modifier='longdivider' onClick='setKokuban.setHelpKoujiClick(this)'></ons-list-item>");
  elm.appendTo($("#setHelpList"));

  // ローカルストレージのアイテム設定をループして検索リストにセット
  try {
    // jsonからsort用の配列を作成
    var koujilist = [];
    $.each( json, function(koujiname, data) {
      var kouji = [koujiname, data.fastDateTime, data.lastDateTime, data.builder];
      if(data.fastDateTime===undefined) {
        kouji[1] = '';
      }
      if(data.lastDateTime===undefined) {
        kouji[2] = '';
      }
      if(kouji[2]==='') {
        kouji[2] = '2199/01/01';
      }
      if(data.builder===undefined) {
        kouji[3] = '';
      }
      koujilist.push(kouji);
    });
    // 最終撮影日時でsort
    koujilist.sort(function(a,b) {
      if( a[2] > b[2] ) return -1;
      if( a[2] < b[2] ) return 1;
      return 0;
    });
    // 工事番号をループしリストを作成する
    $.each( koujilist, function(i, data) {
      // 検索リストに要素を追加
      var elm = '';
      elm = elm + '<ons-list-item class="textsize5" tappable modifier="longdivider" onClick="setKokuban.setHelpKoujiClick(this)">'+data[0]+'\n';
      elm = elm + '  <ons-row>';
      if(data[2]==='2199/01/01') {
        elm = elm + '    <ons-col class="textsize4" id="takeDateTime" width="50%" style="padding:0px;color:darkorange">New!</ons-col>';
      }else{
        elm = elm + '    <ons-col class="textsize3" id="takeDateTime" width="50%" style="padding:0px;color:gray">'+data[1].slice(0,10)+' ～ '+data[2].slice(0,10)+'</ons-col>';
      }
      elm = elm + '    <ons-col class="textsize3" id="builderName" width="50%" style="padding:0px;color:gray">'+data[3]+'</ons-col>';
      elm = elm + '  </ons-row>';
      elm = elm + '</ons-list-item>';
      $(elm).appendTo($('#setHelpList'));
    });
  } catch(e) {
    alert(e);
  };

  // 検索リストが存在する場合のみ表示
  if($("#setHelpList>ons-list-item").length>0) {
    $("#setInputKouji").blur();
    $("#setHelpTitle").text("工事名検索");
    $("#setHelpModal").show();
  };
};

//====================================================
// setKokuban.setHelpKoujiClick()
// 工事の検索リストのアイテムをクリック
//====================================================
setKokuban.setHelpKoujiClick = function(obj) {
  _log(1,'function','setKokuban.setHelpKoujiClick()');

  var str = $(obj).text();
  var koujiname = str.split('\n');

  // 選択項目を入力フィールドにコピー
  $('#setInputKouji').val(koujiname[0]);
  $("#setHelpModal").hide();
};

//====================================================
// setKokuban.setHelpKousyu()
// 工種の検索リストを作成・表示する
//====================================================
setKokuban.setHelpKousyu = function(json) {
  _log(1,'function','setKokuban.setHelpKousyu()');

  // 検索ダイアログのリストを初期化
  $("#setHelpList").empty();
  var elm = $("<ons-list-item tappable modifier='longdivider' onClick='setKokuban.setHelpKousyuClick(this)'></ons-list-item>");
  elm.appendTo($("#setHelpList"));

  // ローカルストレージのアイテム設定をループして検索リストにセット
  try {
    // 工種情報を配列で取得する
    var field = "field01";
    var name = "name";
    var obj = Object.keys(json[field]);
    // 工種設定をループしリストを作成する
    obj.forEach(function(key) {
      var str = json[field][key][name];
      // 検索リストに要素を追加
      var elm = $('<ons-list-item class="textsize5" tappable modifier="longdivider" onClick="setKokuban.setHelpKousyuClick(this)">'+str+'</ons-list-item>');
      elm.appendTo($("#setHelpList"));
    });
  } catch(e) {
    alert(e);
  };

  if($("#setHelpList>ons-list-item").length>0) {
    $("#setInputKousyu").blur();
    $("#setHelpTitle").text("工種検索");
    $("#setHelpModal").show();
  };
};

//====================================================
// setKokuban.setHelpKousyuClick()
// 工種の検索リストのアイテムをクリック
//====================================================
setKokuban.setHelpKousyuClick = function(obj) {
  _log(1,'function','setKokuban.setHelpKousyuClick()');

  // 選択項目を入力フィールドにコピー
  $('#setInputKousyu').val($(obj).text());
  $("#setHelpModal").hide();
};

//====================================================
// setKokuban.setHelpSokuten()
// 測点の検索リストを作成・表示する
//====================================================
setKokuban.setHelpSokuten = function(json) {
  _log(1,'function','setKokuban.setHelpSokuten()');

  // 検索ダイアログのリストを初期化
  $("#setHelpList").empty();
  var elm = $("<ons-list-item tappable modifier='longdivider' onClick='setKokuban.setHelpSokutenClick(this)'></ons-list-item>");
  elm.appendTo($("#setHelpList"));

  // ローカルストレージのアイテム設定をループして検索リストにセット
  try {
    // 測点情報を配列で取得する
    var field = "field02";
    var name = "name";
    var obj = Object.keys(json[field]);
    // 測点設定をループしリストを作成する
    obj.forEach(function(key) {
      var str = json[field][key][name];
      // 検索リストに要素を追加
      var elm = $('<ons-list-item class="textsize5" tappable modifier="longdivider" onClick="setKokuban.setHelpSokutenClick(this)">'+str+'</ons-list-item>');
      elm.appendTo($("#setHelpList"));
    });
  } catch(e) {
    alert(e);
  };

  // 検索リストが存在する場合のみ表示
  if($("#setHelpList>ons-list-item").length>0) {
    $("#setInputSokuten").blur();
    $("#setHelpTitle").text("測点検索");
    $("#setHelpModal").show();
  };
};

//====================================================
// setKokuban.setHelpSokutenClick()
// 測点の検索リストのアイテムをクリック
//====================================================
setKokuban.setHelpSokutenClick = function(obj) {
  _log(1,'function','setKokuban.setHelpSokutenClick()');

  // 選択項目を入力フィールドにコピー
  $('#setInputSokuten').val($(obj).text());
  $("#setHelpModal").hide();
};

//====================================================
// setKokuban.setHelpHiduke()
// 日付の検索リストを作成・表示する
//====================================================
setKokuban.setHelpHiduke = function() {
  _log(1,'function','setKokuban.setHelpHiduke()');

  $("#setInputHiduke").blur();

  datePicker = window.plugins.datePicker;
  datePicker.show({
      "mode" : "date",
      "date" : new Date(),
      "doneButtonLabel" : 'ＯＫ',
      "doneButtonColor" : '#000000',
      "cancelButtonLabel" : 'キャンセル',
      "cancelButtonColor" : '#000000'
    }, function(date){
			if(typeof date !== 'undefined') {
        var Hiduke = kokuban.setDateFormat(date);
        $("#setInputHiduke").val(Hiduke);
			}
    });
};

//====================================================
// setKokuban.setHelpBikou()
// 備考の検索リストを作成・表示する
//====================================================
setKokuban.setHelpBikou = function(json) {
  _log(1,'function','setKokuban.setHelpBikou()');

  // 検索ダイアログのリストを初期化
  $("#setHelpList").empty();

  // ローカルストレージのアイテム設定をループして検索リストにセット
  try {
    // 備考を配列で取得する
    var field  = "field03";
    var item01 = "item01";
    var name   = "name";

    var obj1 = Object.keys(json[field]);
    // 備考第1階層をループしリストを作成する
    $.each(obj1, function(i, key1) {     // 2018/01/30 ADD
//  obj1.forEach(function(key1) {        // 2018/01/30 DEL
      var str1 = json[field][key1][name];
      var fid1 = key1.slice(-2);
      // 検索リストに要素を追加
      if(key1.match(/item/) && str1 !== undefined) {    // 2018/01/30 ADD
//    if(str1 !== undefined) {                          // 2018/01/30 DEL
        var str2 = json[field][key1][item01][name];  // 見出し判定
        if(str2 !== undefined) {
          addListItem(1, str1, fid1, 'header');
        }else{
          addListItem(1, str1, fid1, 'item');
        };
      };

      // 備考第2階層をループしリストを作成する
      var obj2 = Object.keys(json[field][key1]);
      $.each(obj2, function(i, key2) {     // 2018/01/30 ADD
//    obj2.forEach(function(key2) {        // 2018/01/30 DEL
        var str2 = json[field][key1][key2][name];
        var fid2 = key1.slice(-2)+'-'+key2.slice(-2);
        if(key2.match(/item/) && str2 !== undefined) {    // 2018/01/30 ADD
//      if(str2 !== undefined) {                          // 2018/01/30 DEL
          // 検索リストに要素を追加
          try {
            var str3 = json[field][key1][key2][item01][name];  // 見出し判定
            addListItem(2, str2, fid2, 'header');
          }catch(e){
            addListItem(2, str2, fid2, 'item');
          };

          // 備考第3階層をループしリストを作成する
          var obj3 = Object.keys(json[field][key1][key2]);
          $.each(obj3, function(i, key3) {     // 2018/01/30 ADD
//        obj3.forEach(function(key3) {        // 2018/01/30 DEL
            var str3 = json[field][key1][key2][key3][name];
            var fid3 = key1.slice(-2)+'-'+key2.slice(-2)+'-'+key3.slice(-2);
            if(key3.match(/item/) && str3 !== undefined) {    // 2018/01/30 ADD
//          if(str3 !== undefined) {                          // 2018/01/30 DEL
              // 検索リストに要素を追加
              try {
                var str4 = json[field][key1][key2][key3][item01][name];  // 見出し判定
                addListItem(3, str3, fid3, 'header');
              }catch(e){
                addListItem(3, str3, fid3, 'item');
              };

              // 備考第4階層をループしリストを作成する
              var obj4 = Object.keys(json[field][key1][key2][key3]);
              $.each(obj4, function(i, key4) {     // 2018/01/30 ADD
//            obj4.forEach(function(key4) {        // 2018/01/30 DEL
                var str4 = json[field][key1][key2][key3][key4][name];
                var fid4 = key1.slice(-2)+'-'+key2.slice(-2)+'-'+key3.slice(-2)+'-'+key4.slice(-2);
                if(key4.match(/item/) && str4 !== undefined) {    // 2018/01/30 ADD
//              if(str4 !== undefined) {                          // 2018/01/30 DEL
                  // 検索リストに要素を追加
                  try {
                    var str5 = json[field][key1][key2][key3][key4][item01][name];  // 見出し判定
                    addListItem(4, str4, fid4, 'header');
                  }catch(e){
                    addListItem(4, str4, fid4, 'item');
                  };

                  // 備考第5階層をループしリストを作成する
                  var obj5 = Object.keys(json[field][key1][key2][key3][key4]);
                  $.each(obj5, function(i, key5) {     // 2018/01/30 ADD
//                obj5.forEach(function(key5) {        // 2018/01/30 DEL
                    var str5 = json[field][key1][key2][key3][key4][key5][name];
                    var fid5 = key1.slice(-2)+'-'+key2.slice(-2)+'-'+key3.slice(-2)+'-'+key4.slice(-2)+'-'+key5.slice(-2);
                    if(key5.match(/item/) && str5 !== undefined) {    // 2018/01/30 ADD
//                  if(str5 !== undefined) {                          // 2018/01/30 DEL
                      // 検索リストに要素を追加
                      try {
                        var str6 = json[field][key1][key2][key3][key4][key5][item01][name];  // 見出し判定
                        addListItem(5, str5, fid5, 'header');
                      }catch(e){
                        addListItem(5, str5, fid5, 'item');
                      };

                      // 備考第6階層をループしリストを作成する
                      var obj6 = Object.keys(json[field][key1][key2][key3][key4][key5]);
                      $.each(obj6, function(i, key6) {     // 2018/01/30 ADD
//                    obj6.forEach(function(key6) {        // 2018/01/30 DEL
                        var str6 = json[field][key1][key2][key3][key4][key5][key6][name];
                        var fid6 = key1.slice(-2)+'-'+key2.slice(-2)+'-'+key3.slice(-2)+'-'+key4.slice(-2)+'-'+key5.slice(-2)+'-'+key6.slice(-2);
                        if(key6.match(/item/) && str6 !== undefined) {    // 2018/01/30 ADD
//                      if(str6 !== undefined) {                          // 2018/01/30 DEL
                          // 検索リストに要素を追加
                          addListItem(6, str6, fid6, 'item');

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
    alert(e);
  };

  // 検索リストに要素を追加する(level*15 はインデント)
  function addListItem(level, str, fid, flg) {
    var elm = $('');
    if(flg === 'header') {
      elm = $('<ons-list-header class="textsize4" id="'+fid+'" modifier="longdivider uniform" style="padding-left:'+(level*14)+'px;color:blue">'+str+'</ons-list-header>');
    }else{
      elm = $('<ons-list-item class="textsize5" tappable id="'+fid+'" modifier="longdivider" onclick="setKokuban.setHelpBikouClick(this)" style="padding-left:'+(level*14)+'px">'+str+'</ons-list-item>');
    }
    elm.appendTo($('#setHelpList'));
  };

  // 検索リストが存在する場合のみ表示
  if($("#setHelpList>ons-list-item").length>0) {
    $("#setInputBikou").blur();
    $("#setHelpTitle").text("備考検索");
    $("#setHelpModal").show();
  };
};

//====================================================
// setKokuban.setHelpBikouClick()
// 備考の検索リストのアイテムをクリック
//====================================================
setKokuban.setHelpBikouClick = function(obj) {
  _log(1,'function','setKokuban.setHelpBikouClick()');

  // 選択項目を入力フィールドにコピー
  $('#setInputBikou').val($(obj).text());
  $('#setBikouPictureId').text($(obj).attr('id'));
  $("#setHelpModal").hide();
};

//====================================================
// setKokuban.bikouTextSupport()
// 備考の入力支援機能
//====================================================
setKokuban.bikouTextSupport = function() {
  _log(1,'function','setKokuban.bikouTextSupport()');

  var val = $('#setInputBikou').val();

  var bikou = val.split('\n');

  // 備考を１行ずつ処理
  for( var i = 0; i < bikou.length; i++ ) {

    // 文字・数字の拡張入力設定を確認
    var bikou_line = bikou[i];
    var pos = -1;
    var flg = '';
    var type = 'text';
    if(bikou_line.indexOf('^9') !== -1) {
      flg = '9';
      type = 'number';
      pos = bikou_line.indexOf('^9');
    };
    if(bikou_line.indexOf('^X') !== -1) {
      flg = 'X';
      type = 'text';
      pos = bikou_line.indexOf('^X');
    };

    if(pos !== -1) {
      $('#setInputBikou').blur();

      // 入力文字列の桁数をカウント
      for(var len = 1; bikou_line.substr(pos+len,1) === flg; len++) {
      };

      // ダイアログ画面で入力
      var text = bikou_line.substr(0,pos)+'_'.repeat(len)+bikou_line.substr(pos+len);

      if(flg==='9') {
        // 数字入力文字列を表示
        $('#numberInputText').text('_'.repeat(len));
        $('#numberFrontLabel').text(bikou_line.substr(0,pos));
        $('#numberBackLabel').text(bikou_line.substr(pos+len));
        $('#numberString').text(bikou_line);
        $('#numberLength').text(len);
        // ダイアログＢＯＸを画面中央に表示
        var windowWidth = window.innerWidth;
        var margin = Math.round((windowWidth - $('#numberInputPanel').width()) / 2);
        $('#numberInputPanel').css({
            'margin-left'  : margin+'.px' ,
            'margin-right' : margin+'.px'
        });

        // 数字入力ダイアログを表示
        numberInputModal.show();

      }else{

        // 文字入力ダイアログを表示
        var options = { title: '',
                        buttonLabel: 'OK',
                        placeholder: '',
                        inputType: type,
                        modifier: 'material',
                        autofocus: true,
                        submitOnEnter: true,
                        // OK後のコールバック
                        callback: function(str) {
                          var ret = text.substr(0,pos)+str.substr(-len)+text.substr(pos+len);
                          var pos2 = val.indexOf(bikou_line);
                          var len2 = text.length;
                          var text2 = val.substr(0,pos2)+ret+val.substr(pos2+len2);
                          var text2 = val.substr(0,pos2)+ret+val.substr(pos2+len2);
                          $('#setInputBikou').val(text2);
                          $('#setInputBikou').focus();
                        }
                      };
        ons.notification.prompt(text, options);
      }

      return null;
    };
  };
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// setKokuban.numberKeyInput()
// 数字キーをクリック時の処理
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
setKokuban.numberKeyInput = function(obj) {
  _log(1,'function','setKokuban.numberKeyInput()');

  var key = obj.innerText;
  var beforeString = $('#numberInputText').text();
  if(beforeString[0]==='_') {
    beforeString = '';
  }

  // 1文字目を切り出し
  var firstString = '';
  var afterString = '';
  if(key==='') {
    afterString = beforeString.substring( 0, beforeString.length-1 );
  }else{
    // '+'か'-'をタップされた場合は、先頭文字を書き換える
    if(key==='+' || key==='-' || key==='±') {      // 2018/01/23 '±'を追加
      if(beforeString.length>0) {
        firstString = beforeString.substr(0,1);
      }
      if(firstString==='+' || firstString==='-' || firstString==='±') {  // 2018/01/23 '±'を追加
        beforeString = beforeString.substr(1);
      }else{
        firstString = '';
      }
      afterString = key + beforeString;
    }else{
      afterString = beforeString + key;
    }
  }

  // 入力桁数が設定値を超えた場合は、先頭から桁数分を切り出す
  var len = Number($('#numberLength').text());
  if(len>0) {
    afterString = afterString.substr(0,len);
  }

  $('#numberInputText').text(afterString);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// setKokuban.numberKeyInputHide()
// 数字キーパネルを閉じた時の処理
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
setKokuban.numberKeyInputHide = function() {
  _log(1,'function','setKokuban.numberKeyInputHide()');

  var val = $('#setInputBikou').val();
  var bikou_line = $('#numberString').text();
  var pos = bikou_line.indexOf('^9');
  var flg = '9';

  // 入力文字列の桁数をカウント
  for(var len = 1; bikou_line.substr(pos+len,1) === flg; len++) {
  };

  var text = $('#numberString').text();
  var str  = $('#numberInputText').text();
  var ret  = text.substr(0,pos)+str.substr(-len)+text.substr(pos+len);
  var pos2 = val.indexOf(bikou_line);
  var len2 = text.length;
  var text2 = val.substr(0,pos2)+ret+val.substr(pos2+len2);
  var text2 = val.substr(0,pos2)+ret+val.substr(pos2+len2);
  numberInputModal.hide();

  $('#setInputBikou').val(text2);
};

//====================================================
// setKokuban.setHelpSyamei()
// 社名の検索リストを作成・表示する
//====================================================
setKokuban.setHelpSyamei = function(json) {
  _log(1,'function','setKokuban.setHelpSyamei()');

  // 検索ダイアログのリストを初期化
  $("#setHelpList").empty();
  var elm = $("<ons-list-item tappable modifier='longdivider' onClick='setKokuban.setHelpSyameiClick(this)'></ons-list-item>");
  elm.appendTo($("#setHelpList"));

  // ローカルストレージのアイテム設定をループして検索リストにセット
  try {
    // 社名情報を配列で取得する
    var field = "field04";
    var name = "name";
    var obj = Object.keys(json[field]);
    // し社名設定をループしリストを作成する
    obj.forEach(function(key) {
      var str = json[field][key][name];
      // 検索リストに要素を追加
      var elm = $('<ons-list-item class="textsize5" tappable modifier="longdivider" onClick="setKokuban.setHelpSyameiClick(this)">'+str+'</ons-list-item>');
      elm.appendTo($('#setHelpList'));
    });
  } catch(e) {
    alert(e);
  };

  // 検索リストが存在する場合のみ表示
  if($("#setHelpList>ons-list-item").length>0) {
    $("#setInputSyamei").blur();
    $("#setHelpTitle").text("社名検索");
    $("#setHelpModal").show();
  };
};

//====================================================
// setKokuban.setHelpSyameiClick()
// 社名の検索リストのアイテムをクリック
//====================================================
setKokuban.setHelpSyameiClick = function(obj) {
  _log(1,'function','setKokuban.setHelpSyameiClick()');

  // 選択項目を入力フィールドにコピー
  $('#setInputSyamei').val($(obj).text());
  $("#setHelpModal").hide();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// setKokuban.itemToCamera()
// ローカルストレージに黒板設定情報を更新しカメラに切り替える
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
setKokuban.itemToCamera = function() {
  _log(1,'function','setKokuban.itemToCamera()');

  // 入力した内容を取得
  setKokuban.itemSaveStrage('kouji', $('#setInputKouji').val());
  setKokuban.itemSaveStrage('kousyu', $('#setInputKousyu').val());
  setKokuban.itemSaveStrage('sokuten', $('#setInputSokuten').val());
  setKokuban.itemSaveStrage('hiduke', $('#setInputHiduke').val());
  setKokuban.itemSaveStrage('bikou', $('#setInputBikou').val());
  setKokuban.itemSaveStrage('pictureId', $('#setBikouPictureId').text());
  setKokuban.itemSaveStrage('syamei', $('#setInputSyamei').val());

  // 改行コードの削除した工事名を保存
  var str = $('#setInputKouji').val();
  setKokuban.itemSaveStrage('directory', str.replace( /\n/g , '' ));

  // 検索ダイアログのリストを初期化
  $("#setHelpList").empty();

  // カメラ画面の表示
  $('#camera').show();
  // ステータスバーの非表示
  StatusBar.hide();

  // 黒板イメージの再生成
  kokuban.makeframe();

  // 設定メニュー画面の非表示
  $('#topNavigator').hide();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// setKokuban.itemSaveStrage()
// 入力した値をローカルストレージに保存する
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
setKokuban.itemSaveStrage = function(key, val) {
  _log(1,'function','setKokuban.itemSaveStrage(key:'+key+' val:'+val);

  // ローカルストレージから読み込み
  var str = localStrage.getItems('firebase:temp/kokuban');
  // 読み込んだテキストをJSON形式に変換
  var k = JSON.parse(str);

  // 値を変更する
  k[key] = val;

  // JSON形式をテキスト形式に変換
  str = JSON.stringify(k);
  // ローカルストレージに書き戻し
  localStrage.setItems('firebase:temp/kokuban', str);
};

// 2018/01/24 ↓-----ADD
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// setKokuban.shapeSelectedMenu()
// 略図の参照先選択メニュー
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
setKokuban.shapeSelectedMenu = function () {
  _log(1,'function','setKokuban.shapeSelectedMenu()');

  // ローカルストレージから黒板の内容を読み込み
  var str = localStrage.getItems('firebase:temp/kokuban');
  // 読み込んだテキストをJSON形式に変換
  var ik = JSON.parse(str);
  if(ik.shapeName  === undefined) {ik.shapeName  = '';}

  var options = [];
  if(ik.shapeName === '') {
     options = ['登録された略図から選択',
                '端末のアルバムから選択',
                'キャンセル'];
  }else{
     options = ['登録された略図から選択',
                '端末のアルバムから選択',
                '選択された図形を削除',
                'キャンセル'];
  }

  // 略図選択メニューを表示
  ons.openActionSheet({
    cancelable: true,
    buttons: options
  }).then(function (index) {
    if(index === 0) {
      setKokuban.shapeSelectedModal();
    }
    if(index === 1) {
      setKokuban.openAlbumPicker();
    }
    if(index === 2) {
      setKokuban.shapeSelectedClear();
    }
  });
};

//====================================================
// setKokuban.shapeSelectedModal()
// 標準登録の略図を選択するダイアログを表示
//====================================================
setKokuban.shapeSelectedModal = function () {
  _log(1,'function','setKokuban.shapeSelectedModal()');

  $("#shapeSelected").empty();
  var str = '';

  // iosはDocuments/クラウド非同期フォルダ/工事名フォルダを参照
  var folderurl = localStorageDirectory + commonShapeFolderName;
  
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
          $.each( fileEntries, function() {
            // 略図ダイアログの作成
            shapeView(this.name, this.nativeURL);
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
  $('#shapeViewModal').show();

  // 略図ダイアログの作成
  function shapeView(filename, uri) {

    var name = filename.split('.');

    // 略図イメージのリストを作成
//    var html = '<ons-list-item class="textsize5" id="shapeItem-'+name[0]+'" tappable modifier="longdivider chevron" style="padding-top:0px" onclick="setKokuban.shapeSelected(this)">'+filename+
    var html = '<ons-list-item class="textsize5" id="shapeItem-'+name[0]+'" tappable modifier="longdivider chevron" onclick="setKokuban.shapeSelected(this)">'+filename+
               '  <ons-row>'+
//               '    <img id="shape-'+name[0]+'" width="auto" style="padding-top:0px;margin-top:0px;">'+
               '    <img id="shape-'+name[0]+'" width="auto">'+
               '  </ons-row>'+
               '</ons-list-item>';
    var elm = $(html);
    elm.appendTo($('#shapeSelected'));

    // 写真リストにサムネイル画像を表示
    $('#shape-'+name[0]).attr({'src': uri});
    $('#shape-'+name[0]).css({height:($('#shapeViewModal').height() / 10)});
  }
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// setKokuban.shapeSelected()
// 略図リストから選択した番号を取得してストレージに保存
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
setKokuban.shapeSelected = function(obj) {
  _log(1,'function','setKokuban.shapeSelected()');

  // 黒板リストから選択した番号を取得
  var objid = $(obj).attr('id');

  var filename = $('#'+objid).text();
  var name = filename.split('.');

  var src   = '';
  // ローカルストレージに書き戻し
  src = $('#shape-'+name[0]).attr('src');
  // 黒板設定画面を再表示
  $('#setViewShape').attr({'src': src});

  // 略図のプレビューを表示して、選択ボタンを非表示にする
  $('#setShapeButton').css({'display': 'none'});
  $('#setShapePanel').css({'display': 'block'});
  $('#setShapePanelShapeName').text(filename);

  // 選択した図形のファイル名を保存する
  setKokuban.itemSaveStrage('shapeName', filename);

  // ファイルのUriをローカルストレージに保存
  setKokuban.itemSaveStrage('shapeUri', src);

  $("#shapeSelected").empty();

  // 略図選択画面を非表示
  shapeViewModal.hide();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// setKokuban.shapeSelectedClear()
// 選択されている略図をクリアする
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
setKokuban.shapeSelectedClear = function(obj) {
  _log(1,'function','setKokuban.shapeSelectedClear()');

  // ローカルストレージ上の略図名をクリア
  setKokuban.itemSaveStrage('shapeName', '');

  // 略図のプレビューを非表示にして、選択ボタンを表示する
  $('#setShapeButton').css({'display': 'block'});
  $('#setShapePanel').css({'display': 'none'});
  $('#setViewShape').attr({'src': null});
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// setKokuban.openAlbumPicker()
// 端末内のアルバムを表示して略図を選択
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
setKokuban.openAlbumPicker = function() {
  _log(1,'function','setKokuban.openAlbumPicker()');

  const options = {
      quality        : 50,  // Some common settings are 20, 50, and 100
      targetWidth    : 300,
      targetHeight   : 300,
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType     : Camera.PictureSourceType.SAVEDPHOTOALBUM,
      encodingType   : Camera.EncodingType.JPEG,
      mediaType      : Camera.MediaType.PICTURE,
      allowEdit      : false,
      correctOrientation: false  //Corrects Android orientation quirks
  };

  navigator.camera.getPicture(function cameraSuccess(imageUri) {

    // 黒板設定画面を再表示
    $('#setShapeButton').css({'display': 'none'});
    $('#setShapePanel').css({'display': 'block'});
    $('#setViewShape').attr({'src': imageUri});

    // Uriからのファイル名を取得
    var str = imageUri.split('/');
    const filename = str[str.length - 1];
    $('#setShapePanelShapeName').text(filename);

    // ファイル名を略図の名前としてローカルストレージに保存
    setKokuban.itemSaveStrage('shapeName', filename);

    // ファイルのUriをローカルストレージに保存
    setKokuban.itemSaveStrage('shapeUri', imageUri);

//    // ローカルストレージから読み込み
//    var str = localStrage.getItems('firebase:temp/kokuban');
//    // 読み込んだテキストをJSON形式に変換
//    var k = JSON.parse(str);
//    var directory = k.directory;
//    if(k.directory===undefined) {directory = 'その他';}
//    directory = directory+'/shape';
//
//    // 略図の保存先フォルダをローカルストレージに保存
//    setKokuban.itemSaveStrage('shapeFolder', directory);
//
//    // 取り込んだ画像をローカルに保存する関数を呼び出す
//    imgToFile(imageUri, directory, filename);

  }, function cameraError(error) {

    _errorlog(1,'setKokuban.openAlbumPicker()',e);
  }, options);


//  // 取り込んだ画像をローカルに保存
//  const imgToFile = function(imageUri, directory, filename) {
//
//    // 出力写真・黒板合成用canvasの作成
//    const cvs = document.createElement('canvas');
//    const ctx = cvs.getContext('2d');
//
//    // 写真イメージを出力用canvasに描画
//    const img = new Image();
//    img.src = imageUri;
//    img.onload = function() {
//      cvs.width  = img.width;
//      cvs.height = img.height;
//
//      ctx.drawImage(img, 0, 0, img.width, img.height);
//      const image = cvs.toDataURL( "image/jpeg" , 1.0 );
//
//      // 略図をローカルの 「工事名称/shape」フォルダ内に保存
//      localStrage.pictureSave(image, img.width, img.height, 0, directory, filename);
//    };
//  };
//
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// setKokuban.shapePosition()
// 略図の表示位置リストから選択した位置ファイル名を取得してストレージに保存
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
setKokuban.shapePosition = function(obj) {
  _log(1,'function','setKokuban.shapePosition()');

  // 略図配置リストから選択した位置を取得
  var objid = $(obj).attr('id');
  setKokuban.itemSaveStrage('shapePosition', objid);

  // img/shape/xxxx.gif を表示用イメージにセット
  var objsrc = $(obj).attr('src');
  $('#setViewShapePosition').attr({'src': objsrc});

  // 黒板の色に合わせるチェックの状態を保存
  var selchk = $('#shapeReverseCheck').prop('checked');
  setKokuban.itemSaveStrage('shapeReverse', selchk);

  // 略図表示位置選択画面を非表示
  shapePositionModal.hide();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// setKokuban.shapePositionModalHide()
// 略図の表示位置選択ウィンドウを閉じる
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
setKokuban.shapePositionModalHide = function() {
  _log(1,'function','setKokuban.shapePositionModalHide()');

  // 黒板の色に合わせるチェックの状態を保存
  var selchk = $('#shapeReverseCheck').prop('checked');
  setKokuban.itemSaveStrage('shapeReverse', selchk);

  // 略図表示位置選択画面を非表示
  shapePositionModal.hide();
};
// 2018/01/24 ↑-----ADD
