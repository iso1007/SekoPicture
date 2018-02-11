//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// confKokubanClick()
// 管理メニューから黒板設定ボタンをクリック
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function confKokubanClick() {
  _log(1,'function','confKokubanClick()');

  var options = {
    // アニメーションの種類
    animation: 'slide',   //'slide', 'lift', 'fade'
    // 画面遷移後に実行されるコールバック
    callback: function() { 
      // 黒板設定画面の初期設定
      confKokubanInitial();
    }
  };
  
  // 黒板設定画面を表示
  setNavigator.pushPage('confKokuban.html', options);
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// confPictureClick()
// 管理メニューから写真設定ボタンをクリック
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function confPictureClick() {
  _log(1,'function','confPictureClick()');

  var options = {
    // アニメーションの種類
    animation: 'slide',   //'slide', 'lift', 'fade'
    // 画面遷移後に実行されるコールバック
    callback: function() { 
      // 黒板設定画面の初期設定
      confPictureInitial();
    }
  };
  
  // 写真設定画面を表示
  setNavigator.pushPage('confPicture.html', options);
};

