var kokuban = function() {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// kokuban.touchmove()
// 黒板移動イベントの定義
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
kokuban.touchmove = function() {
  _log(1,'function','kokuban.touchmove()');
  
  var marginPosX = 0;
  var marginPosY = 0;

  // 現在の向き(rotate)を取得
  var transform = getTransformParam($('#kokuban').css('transform'));
  var rot = transform.rotate;

  // 黒板の初期表示位置の設定
  // [仮コード]前回位置を記憶して復元する
  var x = $('#pic-box').offset().left;
  var y = $('#pic-box').offset().top;
  $('#kokuban').css({'transform': 'translate(' + x + 'px, ' + y + 'px) rotate(' + rot + ')'});
  
  // 黒板をタッチ
  $('#kokuban').on('touchstart', function(event) {
    // 機能ボタンも薄くする
//  $('#tool-button1').css({opacity : 0.5});
//  $('#tool-button2').css({opacity : 0.5});
    // 黒板を透過表示
    if(kokubanShowFlag === true) {
      $('#kokuban').css('opacity', 0.5);
    }else{
      $('#kokuban').css('opacity', 0.3);
    };

    // ドラッグ開始時の黒板端からのオフセットを保存
    var gesture = event.originalEvent;
    marginPosX = gesture.touches[0].pageX - $('#kokuban').offset().left;
    marginPosY = gesture.touches[0].pageY - $('#kokuban').offset().top;
  });

  // ドラッグ終了で透過表示を終了
  $('#kokuban').on('touchend', function(event) {
    // 機能ボタンの濃度を元に戻す
//  $('#tool-button1').css({opacity : 0.8});
//  $('#tool-button2').css({opacity : 0.8});
    if(kokubanShowFlag === true) {
      $('#kokuban').css('opacity', 1.0);
    }else{
      $('#kokuban').css('opacity', 0.3);
    };
  });

  // スクロール禁止(android対策)
  $('#kokuban').on('touchmove', function(event) {
    event.preventDefault();
  });

  // 黒板をドラッグ
  $('#kokuban').on('drag', function(event) {
    
    // 現在の向き(rotate)を取得
    var transform = getTransformParam($('#kokuban').css('transform'));
    var rot = transform.rotate;
    
    // ジェスチャーによる移動を取得
    var gesture = event.originalEvent.gesture;
    var x = gesture.touches[0].pageX - marginPosX;
    var y = gesture.touches[0].pageY - marginPosY;
    
    // デバイスが横向きの場合は、黒板の縦横の差分だけ補正する為
    var TopHosei = 0;
    var LeftHosei = 0;
    if(devaiceOrientation==='landscape'){
      var TopHosei = ($('#kokuban').height() / 2) - ($('#kokuban').width() / 2);
      var LeftHosei = ($('#kokuban').width() / 2) - ($('#kokuban').height() / 2);
    };
    
    // 黒板がプレビューウィンドウ外に出ないように補正
    // 最上
    if(x < $('#pic-box').offset().left - LeftHosei) {
      x = $('#pic-box').offset().left - LeftHosei;
    }
    // 最左
    if(y < $('#pic-box').offset().top - TopHosei) {
      y = $('#pic-box').offset().top - TopHosei;
    }
    // 最下
    if(x > $('#pic-box').offset().left+$('#pic-box').width()-$('#kokuban').width() + LeftHosei) {
      x = $('#pic-box').offset().left+$('#pic-box').width()-$('#kokuban').width() + LeftHosei;
    }
    // 最右
    if(y > $('#pic-box').offset().top+$('#pic-box').height()-$('#kokuban').height() + TopHosei) {
      y = $('#pic-box').offset().top+$('#pic-box').height()-$('#kokuban').height() + TopHosei;
    }
    // 黒板の移動
    $('#kokuban').css({'transform': 'translate(' + x + 'px, ' + y + 'px) rotate(' + rot + ')'});
  });

};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// kokuban.makeframe()
// 黒板情報から黒板の作成
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
kokuban.makeframe = function() {
  _log(1,'function','kokuban.makeframe()');

  // ローカルストレージから黒板設定情報を読み込み
  var str = localStrage.getItems('firebase:group00/config/kokuban');
  
  // 読み込んだテキストをJSON形式に変換
  var k = JSON.parse(str);
  
  var kokubanColor  = 'rgb(29,47,51)'; // 深緑黒板
  var lineitemColor = '#FFFFFF';       // 白文字
  if(k.color === undefined) {k.color = 'darkslategray';};
  switch (k.color) {
    case 'darkslategray' :
      kokubanColor  = 'rgb(29,47,51)'; // 深緑黒板
      lineitemColor = '#FFFFFF';  // 白文字
      break;
    case 'green' :
      kokubanColor  = 'green'; //k.color;    // 緑黒板
      lineitemColor = '#FFFFFF';  // 白文字
      break;
    case 'white' :
      kokubanColor  = 'white'; //k.color;    // 白黒板
      lineitemColor = '#000000';  // 黒文字
      break;
  };

  // 黒板表示・非表示フラグ
  if(k.showFlag === undefined) {k.showFlag = true;};
  kokubanShowFlag = k.showFlag;
  if(kokubanShowFlag === true) {
    $('#kokuban').css('opacity', 1.0);
  }else{
    $('#kokuban').css('opacity', 0.2);
  }; 

  // 黒板サイズ
  if(k.size === undefined) {k.size = 'medium';};
  var kokubanSizeBairitu = getKokubanSizeBairitu(k.size);
  
  // 黒板タイプ番号
  if(k.typeNo === undefined) {k.typeNo = '0010';};
  if(k.typeNo <= '0010' || k.typeNo >= '9999') {k.typeNo = '0010';};
  
  // ローカルストレージから読み込み
  var str = localStrage.getItems('firebase:kokuban/'+k.typeNo);
  // 読み込んだテキストをJSON形式に変換
  var k = JSON.parse(str);

  // 黒板用カンバスを設定　
  var canvas = document.getElementById('kokuban');
  if(k.frame   === undefined) {k.frame = {};};
  if(k.frame.w === undefined) {k.frame.w = 0;};
  if(k.frame.h === undefined) {k.frame.h = 0;};
  canvas.width  = k.frame.w;  // 黒板横サイズ
  canvas.height = k.frame.h;  // 黒板縦サイズ
  
  // 黒板イメージのサイズ設定
  var style = canvas.style;
  // スタイルシートのサイズを変更する
  var width  = k.frame.w;
  var height = k.frame.h;
  var winWidth  = window.innerWidth;
  // 基準画面幅「320」との比率を求める
  var winSizeBairitu = winWidth / 320;
  width  = width  * winSizeBairitu * kokubanSizeBairitu; 
  height = height * winSizeBairitu * kokubanSizeBairitu; 
  style.width  = width  + "px";
  style.height = height + "px";
  const baseFont = "600 20px monospace,sans-serif";
	const baseAlign = "left";

  // 黒板の色
  var confKokubanBackColor = kokubanColor; 
  // 罫線と文字の色  
  var confKokubanItemColor = lineitemColor;

  // 黒板のコンテキストを作成
  var ctx = canvas.getContext('2d');
  
  // 黒板背景
  ctx.lineWidth = 0;
  ctx.fillStyle = confKokubanBackColor;  // 黒板の色
  ctx.fillRect(0, 0, k.frame.w, k.frame.h);
  ctx.textBaseline = "top";
  ctx.fillStyle = confKokubanItemColor;

  // 枠線
  if(k.box0    === undefined) {k.box0    = {};};
  if(k.box0.lw === undefined) {k.box0.lw = 0;};
  if(k.box0.x  === undefined) {k.box0.x  = 0;};
  if(k.box0.y  === undefined) {k.box0.y  = 0;};
  if(k.box0.w  === undefined) {k.box0.w  = 0;};
  if(k.box0.h  === undefined) {k.box0.h  = 0;};
  ctx.lineWidth = k.box0.lw;
  ctx.strokeStyle = confKokubanItemColor;  // 罫線の色
  if(ctx.lineWidth > 0) {
    ctx.strokeRect(k.box0.x, k.box0.y, k.box0.w, k.box0.h);
  };
  
  // 工事名
  if(k.box1          === undefined) {k.box1          = {};};
  if(k.box1.title    === undefined) {k.box1.title    = {};};
  if(k.box1.title.x  === undefined) {k.box1.title.x  = 0;};
  if(k.box1.title.lw === undefined) {k.box1.title.lw = 0;};
  if(k.box1.title.x  === undefined) {k.box1.title.x  = 0;};
  if(k.box1.title.y  === undefined) {k.box1.title.y  = 0;};
  if(k.box1.title.w  === undefined) {k.box1.title.w  = 0;};
  if(k.box1.title.h  === undefined) {k.box1.title.h  = 0;};
  if(k.box1.title.char  === undefined) {k.box1.title.char  = '工事名';};
  if(k.box1.title.font  === undefined) {k.box1.title.font  = baseFont;};
  if(k.box1.title.align === undefined) {k.box1.title.align = baseAlign;};
  if(k.box1.title.char.length > 0) {
    ctx.font = k.box1.title.font;
    ctx.textAlign = k.box1.title.align;
    ctx.fillText(k.box1.title.char, k.box1.title.x+5, k.box1.title.y+(k.box1.title.h-20)/2, k.box1.title.w-10);
  };
  if(k.box1.title.lw > 0) {
    ctx.lineWidth = k.box1.title.lw;
    ctx.strokeRect(k.box1.title.x, k.box1.title.y, k.box1.title.w, k.box1.title.h);
  };
  if(k.box1.item    === undefined) {k.box1.item    = {};};
  if(k.box1.item.lw === undefined) {k.box1.item.lw = 0;};
  if(k.box1.item.x  === undefined) {k.box1.item.x  = 0;};
  if(k.box1.item.y  === undefined) {k.box1.item.y  = 0;};
  if(k.box1.item.w  === undefined) {k.box1.item.w  = 0;};
  if(k.box1.item.h  === undefined) {k.box1.item.h  = 0;};
  if(k.box1.item.font   === undefined) {k.box1.item.font  = baseFont;};
  if(k.box1.title.align === undefined) {k.box1.title.align = baseAlign;};
  if(k.box1.item.lw > 0) {
    ctx.lineWidth = k.box1.item.lw;
    ctx.strokeRect(k.box1.item.x, k.box1.item.y, k.box1.item.w, k.box1.item.h);
  };
  
  // 工種
  if(k.box2          === undefined) {k.box2          = {};};
  if(k.box2.title    === undefined) {k.box2.title    = {};};
  if(k.box2.title.lw === undefined) {k.box2.title.lw = 0;};
  if(k.box2.title.x  === undefined) {k.box2.title.x  = 0;};
  if(k.box2.title.y  === undefined) {k.box2.title.y  = 0;};
  if(k.box2.title.w  === undefined) {k.box2.title.w  = 0;};
  if(k.box2.title.h  === undefined) {k.box2.title.h  = 0;};  
  if(k.box2.title.char  === undefined) {k.box2.title.char  = '工　種';};
  if(k.box2.title.font  === undefined) {k.box2.title.font  = baseFont;};
  if(k.box2.title.align === undefined) {k.box2.title.align = baseAlign;};
  if(k.box2.title.char.length > 0) {
    ctx.font = k.box2.title.font;
    ctx.textAlign = k.box2.title.align;
    ctx.fillText(k.box2.title.char, k.box2.title.x+5, k.box2.title.y+(k.box2.title.h-20)/2, k.box2.title.w-10);
  };
  if(k.box2.title.lw > 0) {
    ctx.lineWidth = k.box2.title.lw;
    ctx.strokeRect(k.box2.title.x, k.box2.title.y, k.box2.title.w, k.box2.title.h);
  };
  if(k.box2.item    === undefined) {k.box2.item    = {};};
  if(k.box2.item.lw === undefined) {k.box2.item.lw = 0;};
  if(k.box2.item.x  === undefined) {k.box2.item.x  = 0;};
  if(k.box2.item.y  === undefined) {k.box2.item.y  = 0;};
  if(k.box2.item.w  === undefined) {k.box2.item.w  = 0;};
  if(k.box2.item.h  === undefined) {k.box2.item.h  = 0;};
  if(k.box2.item.font  === undefined) {k.box2.item.font  = baseFont;};
  if(k.box2.item.align === undefined) {k.box2.item.align = baseAlign;};
  if(k.box2.item.lw > 0) {
    ctx.lineWidth = k.box2.item.lw;
    ctx.strokeRect(k.box2.item.x, k.box2.item.y, k.box2.item.w, k.box2.item.h);
  };
  
  // 測点
  if(k.box3          === undefined) {k.box3          = {};};
  if(k.box3.title    === undefined) {k.box3.title    = {};};
  if(k.box3.title.lw === undefined) {k.box3.title.lw = 0;};
  if(k.box3.title.x  === undefined) {k.box3.title.x  = 0;};
  if(k.box3.title.y  === undefined) {k.box3.title.y  = 0;};
  if(k.box3.title.w  === undefined) {k.box3.title.w  = 0;};
  if(k.box3.title.h  === undefined) {k.box3.title.h  = 0;};  
  if(k.box3.title.char  === undefined) {k.box3.title.char  = '測　点';};
  if(k.box3.title.font  === undefined) {k.box3.title.font  = baseFont;};
  if(k.box3.title.align === undefined) {k.box3.title.align = baseAlign;};
  if(k.box3.title.char.length > 0) {
    ctx.font = k.box3.title.font;
    ctx.textAlign = k.box3.title.align;
    ctx.fillText(k.box3.title.char, k.box3.title.x+5, k.box3.title.y+(k.box3.title.h-20)/2, k.box3.title.w-10);
  };
  if(k.box3.title.lw > 0) {
    ctx.lineWidth = k.box3.title.lw;
    ctx.strokeRect(k.box3.title.x, k.box3.title.y, k.box3.title.w, k.box3.title.h);
  };
  if(k.box3.item    === undefined) {k.box3.item    = {};};
  if(k.box3.item.lw === undefined) {k.box3.item.lw = 0;};
  if(k.box3.item.x  === undefined) {k.box3.item.x  = 0;};
  if(k.box3.item.y  === undefined) {k.box3.item.y  = 0;};
  if(k.box3.item.w  === undefined) {k.box3.item.w  = 0;};
  if(k.box3.item.h  === undefined) {k.box3.item.h  = 0;};
  if(k.box3.item.font  === undefined) {k.box3.item.font  = baseFont;};
  if(k.box3.item.align === undefined) {k.box3.item.align = baseAlign;};
  if(k.box3.item.lw > 0) {
    ctx.lineWidth = k.box3.item.lw;
    ctx.strokeRect(k.box3.item.x, k.box3.item.y, k.box3.item.w, k.box3.item.h);
  };

  // 日付
  if(k.box4          === undefined) {k.box4          = {};};
  if(k.box4.title    === undefined) {k.box4.title    = {};};
  if(k.box4.title.lw === undefined) {k.box4.title.lw = 0;};
  if(k.box4.title.x  === undefined) {k.box4.title.x  = 0;};
  if(k.box4.title.y  === undefined) {k.box4.title.y  = 0;};
  if(k.box4.title.w  === undefined) {k.box4.title.w  = 0;};
  if(k.box4.title.h  === undefined) {k.box4.title.h  = 0;};    
  if(k.box4.title.char  === undefined) {k.box4.title.char  = '日　付';};
  if(k.box4.title.font  === undefined) {k.box4.title.font  = baseFont;};
  if(k.box4.title.align === undefined) {k.box4.title.align = baseAlign;};
  if(k.box4.title.char.length > 0) {
    ctx.font = k.box4.title.font;
    ctx.textAlign = k.box4.title.align;
    ctx.fillText(k.box4.title.char, k.box4.title.x+5, k.box4.title.y+(k.box4.title.h-20)/2, k.box4.title.w-10);
  };
  if(k.box4.title.lw > 0) {
    ctx.lineWidth = k.box4.title.lw;
    ctx.strokeRect(k.box4.title.x, k.box4.title.y, k.box4.title.w, k.box4.title.h);
  };
  if(k.box4.item    === undefined) {k.box4.item    = {};};
  if(k.box4.item.lw === undefined) {k.box4.item.lw = 0;};
  if(k.box4.item.x  === undefined) {k.box4.item.x  = 0;};
  if(k.box4.item.y  === undefined) {k.box4.item.y  = 0;};
  if(k.box4.item.w  === undefined) {k.box4.item.w  = 0;};
  if(k.box4.item.h  === undefined) {k.box4.item.h  = 0;};
  if(k.box4.item.font  === undefined) {k.box4.item.font  = baseFont;};
  if(k.box4.item.align === undefined) {k.box4.item.align = baseAlign;};
  if(k.box4.item.lw > 0) {
    ctx.lineWidth = k.box4.item.lw;
    ctx.strokeRect(k.box4.item.x, k.box4.item.y, k.box4.item.w, k.box4.item.h);
  };
  
  // 備考
  if(k.box8          === undefined) {k.box8          = {};};
  if(k.box8.title    === undefined) {k.box8.title    = {};};
  if(k.box8.title.lw === undefined) {k.box8.title.lw = 0;};
  if(k.box8.title.x  === undefined) {k.box8.title.x  = 0;};
  if(k.box8.title.y  === undefined) {k.box8.title.y  = 0;};
  if(k.box8.title.w  === undefined) {k.box8.title.w  = 0;};
  if(k.box8.title.h  === undefined) {k.box8.title.h  = 0;};    
  if(k.box8.title.char  === undefined) {k.box8.title.char  = '備　考';};
  if(k.box8.title.font  === undefined) {k.box8.title.font  = baseFont;};
  if(k.box8.title.align === undefined) {k.box8.title.align = baseAlign;};
  if(k.box8.title.char.length > 0) {
    ctx.font = k.box8.title.font;
    ctx.textAlign = k.box8.title.align;
    ctx.fillText(k.box8.title.char, k.box8.title.x+5, k.box8.title.y+(k.box8.title.h-20)/2, k.box8.title.w-10);
  };
  if(k.box8.title.lw > 0) {
    ctx.lineWidth = k.box8.title.lw;
    ctx.strokeRect(k.box8.title.x, k.box8.title.y, k.box8.title.w, k.box8.title.h);
  };
  if(k.box8.item    === undefined) {k.box8.item    = {};};
  if(k.box8.item.lw === undefined) {k.box8.item.lw = 0;};
  if(k.box8.item.x  === undefined) {k.box8.item.x  = 0;};
  if(k.box8.item.y  === undefined) {k.box8.item.y  = 0;};
  if(k.box8.item.w  === undefined) {k.box8.item.w  = 0;};
  if(k.box8.item.h  === undefined) {k.box8.item.h  = 0;};
  if(k.box8.item.font  === undefined) {k.box8.item.font  = baseFont;};
  if(k.box8.item.align === undefined) {k.box8.item.align = baseAlign;};
  if(k.box8.item.lw > 0) {
    ctx.lineWidth = k.box8.item.lw;
    ctx.strokeRect(k.box8.item.x, k.box8.item.y, k.box8.item.w, k.box8.item.h);
  };
  
  // 社名
  var syameiprint = false;  // 社名の印字可否
  if(k.box9          === undefined) {k.box9          = {};};
  if(k.box9.title    === undefined) {k.box9.title    = {};};
  if(k.box9.title.lw === undefined) {k.box9.title.lw = 0;};
  if(k.box9.title.x  === undefined) {k.box9.title.x  = 0;};
  if(k.box9.title.y  === undefined) {k.box9.title.y  = 0;};
  if(k.box9.title.w  === undefined) {k.box9.title.w  = 0;};
  if(k.box9.title.h  === undefined) {k.box9.title.h  = 0;};    
  if(k.box9.title.char  === undefined) {k.box9.title.char  = '社　名';};
  if(k.box9.title.font  === undefined) {k.box9.title.font  = baseFont;};
  if(k.box9.title.align === undefined) {k.box9.title.align = baseAlign;};
  if(k.box9.title.char.length > 0) {
    ctx.font = k.box9.title.font;
    ctx.textAlign = k.box9.title.align;
    ctx.fillText(k.box9.title.char, k.box9.title.x+5, k.box9.title.y+(k.box9.title.h-20)/2, k.box9.title.w-10);
  };
  if(k.box9.title.lw > 0) {
    ctx.lineWidth = k.box9.title.lw;
    ctx.strokeRect(k.box9.title.x, k.box9.title.y, k.box9.title.w, k.box9.title.h);
  };
  if(k.box9.item    === undefined) {k.box9.item    = {};};
  if(k.box9.item.lw === undefined) {k.box9.item.lw = 0;};
  if(k.box9.item.x  === undefined) {k.box9.item.x  = 0;};
  if(k.box9.item.y  === undefined) {k.box9.item.y  = 0;};
  if(k.box9.item.w  === undefined) {k.box9.item.w  = 0;};
  if(k.box9.item.h  === undefined) {k.box9.item.h  = 0;};
  if(k.box9.item.font  === undefined) {k.box9.item.font  = baseFont;};
  if(k.box9.item.align === undefined) {k.box9.item.align = baseAlign;};
  if(k.box9.item.lw > 0) {
    ctx.lineWidth = k.box9.item.lw;
    ctx.strokeRect(k.box9.item.x, k.box9.item.y, k.box9.item.w, k.box9.item.h);
  };
  if(k.box9.item.h > 0) {
    syameiprint = true;
	};

  // イメージ情報
  if(k.image     === undefined) {k.image     = {};};
  if(k.image.x   === undefined) {k.image.x   = 0;};
  if(k.image.y   === undefined) {k.image.y   = 0;};
  if(k.image.w   === undefined) {k.image.w   = 0;};
  if(k.image.h   === undefined) {k.image.h   = 0;};
  if(k.image.src === undefined) {k.image.src = '';};
  if(k.image.src !== '') {
    var img = new Image;
    img.src = k.image.src;
    img.onload = function() {
      ctx.drawImage(img, k.image.x, k.image.y, k.image.w, k.image.h);
    };  
  };

  // ローカルストレージから黒板の内容を読み込み
  var str = localStrage.getItems('firebase:temp/kokuban');
  // 読み込んだテキストをJSON形式に変換
  var ik = JSON.parse(str);
  if(ik.kouji   === undefined) {ik.kouji   = '';}
  if(ik.kousyu  === undefined) {ik.kousyu  = '';}
  if(ik.sokuten === undefined) {ik.sokuten = '';}
  if(ik.hiduke  === undefined) {ik.hiduke  = '';}
  if(ik.bikou   === undefined) {ik.bikou   = '';}
  if(ik.syamei  === undefined) {ik.syamei  = '';}
  // 2018/01/24 ↓ ADD
  if(ik.shapeName  === undefined) {ik.shapeName = '';}
  if(ik.shapePosition === undefined) {ik.shapePosition = 'bottom-middle';}
  if(ik.shapeReverse === undefined) {ik.shapeReverse = true;}
  // 2018/01/24 ↑ ADD

  // 工事名称
  var str = ik.kouji;
  var kouji = str.split('\n');
  ctx.font = k.box1.item.font;
  ctx.textAlign = k.box1.item.align;
  if(kouji.length === 1) {
    ctx.fillText(kouji[0], k.box1.item.x+5, k.box1.item.y+(k.box1.item.h-20)/2, k.box1.item.w-10);
  }else{
    ctx.fillText(kouji[0], k.box1.item.x+5, k.box1.item.y+5, k.box1.item.w-10);
    ctx.fillText(kouji[1], k.box1.item.x+5, k.box1.item.y+25, k.box1.item.w-10);
  };
  
  // 工種
  ctx.font = k.box2.item.font;
  ctx.textAlign = k.box2.item.align;
  ctx.fillText(ik.kousyu,  k.box2.item.x+5, k.box2.item.y+(k.box2.item.h-20)/2, k.box2.item.w-10);
  
  // 測点
  ctx.font = k.box3.item.font;
  ctx.textAlign = k.box3.item.align;
  ctx.fillText(ik.sokuten, k.box3.item.x+5, k.box3.item.y+(k.box3.item.h-20)/2, k.box3.item.w-10);

  // 日付
  ctx.font = k.box4.item.font;
  ctx.textAlign = k.box4.item.align;
  ctx.fillText(ik.hiduke, k.box4.item.x+5, k.box4.item.y+(k.box4.item.h-20)/2, k.box4.item.w-10);

  // 社名
  ctx.font = k.box9.item.font;
  ctx.textAlign = k.box9.item.align;
  if(syameiprint) {
    ctx.fillText(ik.syamei, k.box9.item.x+5, k.box9.item.y+(k.box9.item.h-20)/2, k.box9.item.w-10);
  };
  
  // 備考
  // 縦横の表示位置によって調整を行う
  var str = ik.bikou;
  var bikou = str.split('\n');
  ctx.font = k.box8.item.font;
  ctx.textAlign = k.box8.item.align;
  var pos = {x : 0, y : 0, w : 0};
  // 横位置が中央の場合
  pos.x = k.box8.item.x + k.box8.item.w / 2;
  // 備考枠の縦開始位置
  pos.y = k.box8.item.y + 5;
  // 横幅
  pos.w = k.box8.item.w - 10;
  // 最大可能行数(枠の高さ÷(文字サイズ＋行間))
  var maxGyou = Math.floor(k.box8.item.h / (30 + 5));
  // データ行数
  var prnGyou = bikou.length;
  // データ行数が最大可能行数を超えている場合は、最大可能行数をセット
  if(prnGyou > maxGyou) { prnGyou = maxGyou; }
  // 2018/01/24 ADD ----- ↓
  // 略図がある場合は文字を上に表示する為
  if(ik.shapeName !== '') {
    prnGyou = maxGyou;
    // 備考枠の左寄せにする
    ctx.textAlign = "left";
    // 備考枠の横開始位置
    pos.x = k.box8.item.x + 5;
    // 備考枠の縦開始位置
    pos.y = k.box8.item.y + 5;
  }
  // 2018/01/24 ADD ----- ↑
  // 開始位置
  var bgnGyou = Math.floor((maxGyou - prnGyou) / 2);
  // 備考の表示
//  for (var i = 0; i < prnGyou; i++ ) {
  for (var i = 0; i < bikou.length; i++ ) {
    ctx.fillText(bikou[i], pos.x, pos.y + ((30 + 5) * (bgnGyou + i)) , pos.w);
  };
  
  // 2018/01/24 備考欄に略図を追加 ↓
  if(ik.shapeName !== '' && ik.shapeUri !== '') {
    // 略図がある場合は文字を上に表示する為
    // ※ 最終的には略図の表示位置を指定して、文字の位置を決定する
    prnGyou = maxGyou;
    // 備考枠の左寄せにする
    ctx.textAlign = "left";
    // 備考枠の横開始位置
    pos.x = k.box8.item.x + 5;
    // 備考枠の縦開始位置
    pos.y = k.box8.item.y + 5;
    
    // 選択された図形を取得
    var img = new Image;
    img.src = ik.shapeUri;
    img.onload = function() {

      // 黒板色が白以外の場合は、略図の色を反転させる
      if(ik.shapeReverse &&
        (kokubanColor === 'rgb(29,47,51)' || kokubanColor === 'green')) {
        img = toInverse(this);
      }else{
        img = this;
      }

      // 略図の表示位置設定から位置を計算
      var pos = {x : 0, y : 0, w : 0, h : 0};
      switch( ik.shapePosition ) {
        case 'full':
          pos.x = k.box8.item.x + 5;
          pos.y = k.box8.item.y + 5;
          pos.w = k.box8.item.w - 10;
          pos.h = k.box8.item.h - 10;
          break;
        case 'bottom-half':
          pos.x = k.box8.item.x + 5;
          pos.y = k.box8.item.y + k.box8.item.h / 2;
          pos.w = k.box8.item.w - 10;
          pos.h = (k.box8.item.h - 10) / 2;
          break;
        case 'bottom-right':
          pos.x = k.box8.item.x + k.box8.item.w / 2;
          pos.y = k.box8.item.y + k.box8.item.h / 2;
          pos.w = (k.box8.item.w - 10) / 2;
          pos.h = (k.box8.item.h - 10) / 2;
          break;
        case 'right-half':
          pos.x = k.box8.item.x + k.box8.item.w / 2;
          pos.y = k.box8.item.y + 5;
          pos.w = (k.box8.item.w - 10) / 2;
          pos.h = k.box8.item.h - 10;
          break;
        default:  // bottom-middle
          pos.x = k.box8.item.x + 5;
          pos.y = k.box8.item.y + k.box8.item.h / 3;
          pos.w = k.box8.item.w - 10;
          pos.h = (k.box8.item.h - 10) / 3 * 2;
          break;
      }

      // 図形とBOXの幅の比率を計算
      var bairit = {w : 0, h : 0, z : 0};
      bairit.w = pos.w / this.width;
      bairit.h = pos.h / this.height;
      // 縦横で比率の小さいほうの倍率を採用する
      if(bairit.w < bairit.h) {
        bairit.z = bairit.w;
      }else{
        bairit.z = bairit.h;
      }

      // 図形を中央に表示する為の位置を再計算
      pos.x = pos.x + (pos.w - (this.width  * bairit.z)) / 2;
      pos.y = pos.y + (pos.h - (this.height * bairit.z)) / 2;
      pos.w = this.width  * bairit.z;
      pos.h = this.height * bairit.z;

      // 図形を描画
      ctx.drawImage(img, pos.x, pos.y, pos.w, pos.h);
    };
  }

  // 黒板イメージデータを変換する
  var convert = function(fn) {
    return function(photoImage) {
      // キャンバスのコンテキストの取得
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      
      // キャンバスの描画サーフェイスのサイズを設定
      $(canvas).attr({
        width: photoImage.width,
        height: photoImage.height
      });

      // キャンバスにいちど、黒板を描画する
      context.drawImage(photoImage, 0, 0, photoImage.width, photoImage.height);

      // 黒板のイメージデータを全部取得する
      var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // イメージのカラーピクセルの入った配列
      var dataArray = imageData.data;

      // 1ピクセルめのカラー  [ r1, g1, b1, a1,
      // 2ピクセルめのカラー    r2, g2, b2, a2,
      //                        ...]
      try{
        // 画像データを加工する
        imageData.dataArray = fn(dataArray);
      } catch (e) {
        alert('Error: ' + e);
      }

      // イメージデータを戻す
      context.putImageData(imageData, 0, 0);

      return canvas;
    };
  };

  // 黒板色が白以外の場合、略図の背景色を透過色に変換する
  var toInverse = convert(function(dataArray) {
    var len = dataArray.length;

//    var rcode = 0; gcode = 0; bcode = 0;
//    if(kokubanColor === 'rgb(29,47,51)') {
//      rcode = 29;
//      gcode = 47;
//      bcode = 51;
//    } 
//    if(kokubanColor === 'green') {
//      rcode = 0;
//      gcode = 128;
//      bcode = 0;
//    } 

    // 色情報をループ
    for (var i = 0; i < len; i += 4) {
      // 背景色を透過色に変更する
      if(dataArray[i] > 200 && dataArray[i+1] > 200 && dataArray[i+2] > 200) {
//        dataArray[i]   = rcode;
//        dataArray[i+1] = gcode;
//        dataArray[i+2] = bcode;
        dataArray[i+3] = 0;

      }else{
      // 線･文字色を白色に変更する
      if(dataArray[i] < 100 && dataArray[i+1] < 100 && dataArray[i+2] < 100) {
        dataArray[i]   = 255;
        dataArray[i+1] = 255;
        dataArray[i+2] = 255;
      }}
    }
    
    return dataArray;
  });
  // 2018/01/24 ADD ----- ↑
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// kokuban.setDataInitialize()
// アプリ起動時に黒板日付を本日の日付に書き換える
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
kokuban.setDataInitialize = function() {
  _log(1,'function','kokuban.setDataInitialize()');
  
  // ローカルストレージから読み込み
  var str = localStrage.getItems('firebase:temp/kokuban');
  // 読み込んだテキストをJSON形式に変換
  var k = JSON.parse(str);

  // インストール後の初回起動時のみ
  if(k.kouji===undefined) {
    k.directory = '';
    k.kouji = '';
    k.top = 0;
    k.left = 0;
    k.kokubanX = 0;
    k.kokubanY = 0;
    k.kousyu = '';
    k.sokuten = '';
    k.bikou = '';
    k.pictureId = '';
    k.syamei = '';
  }
   
  // 値を変更する  
  var date = new Date();
  k.hiduke = kokuban.setDateFormat(date);
  
  // JSON形式をテキスト形式に変換
  str = JSON.stringify(k);
  // ローカルストレージに書き戻し
  localStrage.setItems('firebase:temp/kokuban', str);
};

//====================================================
// kokuban.setDateFormat()
// 黒板日付の表示フォーマット
//====================================================
kokuban.setDateFormat = function(date) {
  _log(1,'function','kokuban.setDateFormat()');
  
  // ローカルストレージから黒板設定情報を読み込み
  let str = localStrage.getItems('firebase:group00/config/field');
  // 読み込んだテキストをJSON形式に変換
  let json = JSON.parse(str);
  let Hiduke = '';
  try {
    Hiduke = json['field05']['item01']['name'];
	}catch(e){
		Hiduke = '元号YY年MM年DD日';
	}

  let newGengou = new Date( '2019/05/01 00:00' );
  if(Hiduke.indexOf('元号') > -1) {
		if(date > newGengou) {
      Hiduke = Hiduke.replace( '元号', '令和' );
		}else{
      Hiduke = Hiduke.replace( '元号', '平成' );
		}	
	}
  if(Hiduke.indexOf('YYYY') > -1) {
    Hiduke = Hiduke.replace( 'YYYY', date.getFullYear() );
	}
  if(Hiduke.indexOf('YY') > -1) {
		if(date > newGengou) {
			if(date.getFullYear() == 2019) {
        Hiduke = Hiduke.replace( 'YY', '元' );
			}else{
        Hiduke = Hiduke.replace( 'YY', date.getFullYear() - 2018 );
			}
		}else{
      Hiduke = Hiduke.replace( 'YY', date.getFullYear() - 1988 );
		}
	}
  if(Hiduke.indexOf('MM') > -1) {
    Hiduke = Hiduke.replace( 'MM', date.getMonth()+1 );
	}
  if(Hiduke.indexOf('DD') > -1) {
    Hiduke = Hiduke.replace( 'DD', date.getDate() );
	}

  return Hiduke;
};
