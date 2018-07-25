//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// confPictureInitial()
// 写真設定の設定値読み込みと初期設定
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function confPictureInitial() {
  _log(1,'function','confPictureInitial()');

  // ローカルストレージから読み込み
  var str = localStrage.getItems('firebase:group00/config/picture');
  // 読み込んだテキストをJSON形式に変換
  var k = JSON.parse(str);

  // 写真サイズ指定
  var size = 'medium'; // 初期値
  try {
    size = k.size;
  } catch(e) {
  };
  $('#picture-size-'+size).attr('checked',true);
  pictureChangeSize(document.getElementById('picture-size-'+size));
  // 黒板サイズの切り替え
  $('input[name="picture-size"]').on('click', function() {
    pictureChangeSize(this);
  });

  // 写真の圧縮率
  var compressionRatio = 'normal';
  try {
    compressionRatio = k.compressionRatio;
  } catch(e) {
  };
  $('#picture-compress-'+compressionRatio).attr('checked',true);
  pictureChangeCompress(document.getElementById('picture-compress-'+compressionRatio));
  // 写真圧縮率の切り替え
  $('input[name="picture-compress"]').on('click', function() {
    pictureChangeCompress(this);
  });

  // 撮影後のプレレビュー表示時間指定(無しは0、HOLDは60秒)
  var previewTime = '2';
  try {
    previewTime = k.previewTime;
  } catch(e) {
  };
  $('#picture-preview-'+previewTime).attr('checked',true);
  pictureChangePreview(document.getElementById('picture-preview-'+previewTime));
  // プレビュー時間の切り替え
  $('input[name="picture-preview"]').on('click', function() {
    pictureChangePreview(this);
  });

  // 写真(黒板)の向き
  var direction = 'landscape';
  try {
    direction = k.direction;
  } catch(e) {
  };
  $('#picture-direction-'+direction).attr('checked',true);
  pictureChangeDirection(document.getElementById('picture-direction-'+direction));
  // 写真の向きを切り替え
  $('input[name="picture-direction"]').on('click', function() {
    pictureChangeDirection(this);
  });

  // 位置情報の保存
  var locationInformation = 'off';
  try {
    locationInformation = k.locationInformation;
  } catch(e) {
  };
  $('#picture-location-'+locationInformation).attr('checked',true);
  pictureChangeLocation(document.getElementById('picture-location-'+locationInformation));
  // 位置情報の付加切り替え
  $('input[name="picture-location"]').on('click', function() {
    pictureChangeLocation(this);
  });

  // 改ざん防止情報の保存
  var hashInformation = 'off';
  try {
    hashInformation = k.hashInformation;
  } catch(e) {
  };
  $('#picture-hash-'+hashInformation).attr('checked',true);
  pictureChangeHash(document.getElementById('picture-hash-'+hashInformation));
  // 改ざん防止情報の付加切り替え
  $('input[name="picture-hash"]').on('click', function() {
    pictureChangeHash(this);
  });
  
};
  
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureChangeSize()
// 写真サイズの切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function pictureChangeSize(obj) {
  _log(1,'function','pictureChangeSize()');
  
  try {
    // 選択したボタン名からサイズ名を取得
    var id = $(obj).attr('id');
    var size = id.split('-');
    var pixel = '1024×768(78万画素)';
    if(size[2]==='minimum' || size[2]==='small' || size[2]==='medium' || size[2]==='large' || size[2]==='maximum'){
      // 写真サイズ指定
      switch (size[2]) {
        case  'minimum' :
          pixel = '640×480(31万画素)';
          break;
        case 'small' :
          pixel = '800×600(48万画素)';
          break;
        case 'medium' :
          pixel = '1024×768(78万画素)';
          break;
        case 'large' :
          pixel = '1280×960(123万画素)';
          break;
        case 'maximum':
          pixel = '1920×1440(276万画素)';
          break;
      }; 
      // 画素数表示を変更
      $('#picture-pixelinfo').text(pixel);
      // ローカルストレージに書き戻す
      pictureItemSet('size', size[2]);
    };
  } catch(e) {
    _errorlog(1,'pictureChangeSize()',e);
  };  
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureChangeCompress()
// 写真圧縮率の切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function pictureChangeCompress(obj) {
  _log(1,'function','pictureChangeCompress()');
  
  try {
    // 選択したボタン名から圧縮率名を取得
    var id = $(obj).attr('id');
    var compress = id.split('-');
    
    var sizeinfo = '概算容量 1.0MB';       // <<  値は調整する
    if(compress[2]==='normal' || compress[2]==='heightQuality' || compress[2]==='bestQuality'){
      // 圧縮率指定
      switch (compress[2]) {
        case  'normal' :
          sizeinfo = '概算容量 30KB';       // <<  値は調整する
          break;
        case 'heightQuality' :
          sizeinfo = '概算容量 100KB';       // <<  値は調整する
          break;
        case 'bestQuality' :
          sizeinfo = '概算容量 350KB';       // <<  値は調整する
          break;
      }; 
      // 概算容量表示を変更
      $('#picture-sizeinfo').text(sizeinfo);
      // ローカルストレージに書き戻す
      pictureItemSet('compressionRatio', compress[2]);
    };
  } catch(e) {
    _errorlog(1,'pictureChangeCompress()',e);
  };  
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureChangePreview()
// プレビュー時間の切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function pictureChangePreview(obj) {
  _log(1,'function','pictureChangePreview()');
  
  // プレビュー時間指定
  try {
    // 選択したボタン名からプレビュー時間を取得
    var id = $(obj).attr('id');
    var preview = id.split('-');
    
    if(preview[2]==='0' || preview[2]==='1' || preview[2]==='2' || preview[2]==='3' || preview[2]==='60'){
      // ローカルストレージに書き戻す
      pictureItemSet('previewTime', preview[2]);
    };
  } catch(e) {
    _errorlog(1,'pictureChangePreview()',e);
  };  
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureChangeDirection()
// 写真の向きを切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function pictureChangeDirection(obj) {
  _log(1,'function','pictureChangeDirection()');
  
  // 写真の向き指定
  var id = $(obj).attr('id');
  var direction = id.split('-');
  try {
    // 選択したボタン名から写真の向きを取得
    if(direction[2]==='device' || direction[2]==='portrait' || direction[2]==='landscape'){
      // ローカルストレージに書き戻す
      pictureItemSet('direction', direction[2]);
    };
  } catch(e) {
    _errorlog(1,'pictureChangeDirection()',e);
  };

  // 縦・横固定の場合は画面の向き検出イベントを開始する
  // イベントが停止している場合のみ実行
  if(direction[2]==='device' && watchAccelerationID===null) {
    orientWatch('start');
  };  
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureChangeLocation()
// 位置情報の付加切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function pictureChangeLocation(obj) {
  _log(1,'function','pictureChangeLocation()');
  
  // 位置情報の付加指定
  try {
    // 選択したボタン名から位置情報の付加を取得
    var id = $(obj).attr('id');
    var location = id.split('-');
    
    if(location[2]==='on' || location[2]==='off'){
      // ローカルストレージに書き戻す
      pictureItemSet('locationInformation', location[2]);
    };
  } catch(e) {
    _errorlog(1,'pictureChangeLocation()',e);
  };  
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureChangeHash()
// 改ざん防止情報の付加切り替え
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function pictureChangeHash(obj) {
  _log(1,'function','pictureChangeHash()');
  
  // 改ざん防止情報の付加指定
  try {
    // 選択したボタン名から改ざん防止情報の付加を取得
    var id = $(obj).attr('id');
    var hash = id.split('-');
    
    if(hash[2]==='on' || hash[2]==='off'){
      // ローカルストレージに書き戻す
      pictureItemSet('hashInformation', hash[2]);
    };
  } catch(e) {
    _errorlog(1,'pictureChangeHash()',e);
  };  
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureItemSet()
// ローカルストレージに写真設定情報を更新
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function pictureItemSet(key, val) {
  _log(1,'function','pictureItemSet('+key+' : '+val+')');
  
  // ローカルストレージから読み込み
  var str = localStrage.getItems('firebase:group00/config/picture');
  // 読み込んだテキストをJSON形式に変換
  var k = JSON.parse(str);
  
  // 値を変更する  
  k[key] = val;
  
  // JSON形式をテキスト形式に変換
  str = JSON.stringify(k);
  // ローカルストレージに書き戻し
  localStrage.setItems('firebase:group00/config/picture', str); 
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// pictureItemGet()
// ローカルストレージから写真設定情報を取得
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function pictureItemGet(key) {
  _log(1,'function','pictureItemGet('+key+')');
  
  // ローカルストレージから読み込み
  var str = localStrage.getItems('firebase:group00/config/picture');
  // 読み込んだテキストをJSON形式に変換
  var k = JSON.parse(str);
  
  // 値を取得する
  if(k[key] === undefined) {k[key] = ''};
  return k[key];
};
