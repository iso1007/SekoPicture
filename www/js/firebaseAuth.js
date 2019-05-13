var firebaseAuth = function() {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// firebaseInitialize()
// ログインダイアログの表示 
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
firebaseAuth.initialize = function(normal_callback, error_callback) {
  _log(1,'function','firebaseAuth.initialize()');

  // ログイン情報用変数をグローバル変数として定義
  activeuser = {email: '', uid: 'Initializing'};
  
  // Firebaseの初期化
  var config = {
      apiKey: "AIzaSyAu6NV-cBlo20N7n8YU-Ehjb0xiJp9Pq44",
      authDomain: "yatamaapp01.firebaseapp.com",
      databaseURL: "https://yatamaapp01.firebaseio.com",
      projectId: "yatamaapp01",
      storageBucket: "yatamaapp01.appspot.com",
      messagingSenderId: "606033164201"
  };
  
  try {
    firebase.initializeApp(config);
  
    // ユーザーログイン・ログオフ・新規登録時に実行
    firebase.auth().onAuthStateChanged(function(userinfo) {
      if(userinfo !== null) {
        // アクティブユーザーとUIDを取得
        activeuser.email = userinfo.email;
        activeuser.uid   = userinfo.uid;
      }else{  
        activeuser.email = "";
        activeuser.uid   = "";
      };
    });
    normal_callback(null);
  }catch(e){
    activeuser.email = "";
    activeuser.uid   = "";
    error_callback(e);
  };
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// firebaseAuth.loginDialogShow()
// ログインダイアログの表示 
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
firebaseAuth.loginDialogShow = function () {
//function loginDialogShow() {
  _log(1,'function','firebaseAuth.loginDialogShow()');
  
  // 非同期処理の為、[onAuthStateChanged]より先に実行されたら待つ
  var loop_count = 0;
  var waite = setInterval(function() {
    loop_count++;
    // 50秒待ってもログインされなければそのまま終了
    if(loop_count === 10) {
      alert('firebaseの初期化に失敗しました。');
      clearInterval(waite);
    };  
    // ログインされたらダイアログを終了
    if(activeuser.uid !== 'Initializing') {
      clearInterval(waite);
      // ログインダイアログの作成
      ons.createDialog("loginDialog.html").then(function(loginDialog) {
        if(activeuser.email.length === 0) { 
          // 新規･ログオフ時
          $("input#email-input").val("");
          $("input#pass-input").val("");
          $("input#passconf-input").val("");
          $('input#email-input').attr('readonly',false);
          $("ons-row#pass-input").show();
          $("ons-row#passconf-input").hide();
          $("ons-button#logoff")[0].innerText = "新しいユーザーを登録する";
        }else{
          // 前回正常ログイン
          $("input#email-input").val(activeuser.email);
          $("input#pass-input").val("");
          $("input#passconf-input").val("");
          $('input#email-input').attr('readonly',true);
          $("ons-row#pass-input").hide();
          $("ons-row#passconf-input").hide();
          $("ons-button#logoff")[0].innerText = "別のユーザーで使用する";
        };
        // ログインダイアログの表示
        loginDialog.show();
      });  
    };
  }, 500); // 1回のループを0.5秒とする
};
      
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// firebaseAuth.logoffLinkClick()
// ログオフ・新規登録 リンククリック
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
firebaseAuth.logoffLinkClick = function () {
//function logoffLinkClick() {
  _log(1,'function','firebaseAuth.logoffLinkClick()');

// 2018/11/15 仮 add ↓
if($("ons-button#logoff").text() === "新しいユーザーを登録する") {
  _confirm('新しいユーザーを登録する為には、別途契約が必要です。　続けますか？', function(status) {
	  if(status === 0) {
  // ユーザーのログオフ
  firebaseAuth.loginUserLogoff();
  
  // ユーザー・パスワードの入力画面を表示
  activeuser.email = '';
  activeuser.uid   = '';
  $("input#email-input").val("");
  $("input#pass-input").val("");
  $("input#passconf-input").val("");
  $('input#email-input').attr('readonly',false);
  $("ons-row#pass-input").show();
  if($("ons-button#logoff").text() === "新しいユーザーを登録する") {
    // 新規登録の場合は確認パスワードのボックスを表示
    $("ons-button#logoff")[0].innerText = "既存のユーザーで使用する";
    $("ons-row#passconf-input").show();
  }else{
    $("ons-button#logoff")[0].innerText = "新しいユーザーを登録する";
    $("ons-row#passconf-input").hide();
  };

  	}
  })
}else{	
// 2018/11/15 仮 add ↑

  // ユーザーのログオフ
  firebaseAuth.loginUserLogoff();
  
  // ユーザー・パスワードの入力画面を表示
  activeuser.email = '';
  activeuser.uid   = '';
  $("input#email-input").val("");
  $("input#pass-input").val("");
  $("input#passconf-input").val("");
  $('input#email-input').attr('readonly',false);
  $("ons-row#pass-input").show();
  if($("ons-button#logoff").text() === "新しいユーザーを登録する") {
    // 新規登録の場合は確認パスワードのボックスを表示
    $("ons-button#logoff")[0].innerText = "既存のユーザーで使用する";
    $("ons-row#passconf-input").show();
  }else{
    $("ons-button#logoff")[0].innerText = "新しいユーザーを登録する";
    $("ons-row#passconf-input").hide();
  };

}	// 2018/11/15 仮 add
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// firebaseAuth.loginChecked()
// ログインチェック
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
firebaseAuth.loginChecked = function () {
//function loginChecked() {
  _log(1,'function','firebaseAuth.loginChecked()');
  
  // ログオン画面消去時のオプション
  var options = {
    // アニメーションの種類
    animation: 'slide',   //'slide', 'lift', 'fade'
    // 画面遷移後に実行されるコールバック
    callback: function() { 
      // ログオン後に実行する処理
      app.afterLoginInitialize1();
    }
  };

  // 前回使用ユーザーでそのままログイン
  // オフラインの場合も可
  if(activeuser.uid.length !== 0) {
    loginDialog.hide(options);
  }else{    
    if($("ons-button#logoff").text() === "新しいユーザーを登録する") {
      // 既存のユーザーでログインをする場合
      firebaseAuth.loginUserLogin();
    }else{
      // 新しいユーザーを登録
      firebaseAuth.loginUserRegister();
    };  
  
    var loop_count = 0;
    var waite = setInterval(function() {
      loop_count++;
      // 10秒待ってもログインされなければそのまま終了
      if(loop_count === 10) {
        clearInterval(waite);
      };  
      // ログインされたらダイアログを終了
      if(activeuser.uid.length !== 0) {
        clearInterval(waite);
        loginDialog.hide(options);
      };
    }, 1000); // 1回のループを1秒とする
  };
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// firebaseAuth.loginUserRegister()
// 新規ユーザー登録処理
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
firebaseAuth.loginUserRegister = function () {
//function loginUserRegister() {
  _log(1,'function','firebaseAuth.loginUserRegister()');

  var mailAddress = $('input#email-input').val();
  var password = $('input#pass-input').val();
  var passwordconf = $('input#passconf-input').val();
  
  // パスワードと確認パスワードの比較
  if(password !== passwordconf) {
    alert('パスワードが誤っています。');
  }else{
    // 入力した新規ユーザーをチェック・登録しＯＫならログイン
    firebase.auth().createUserWithEmailAndPassword(mailAddress, password).catch(function(e) {
      alert(firebaseAuth.getErrorMessage(e.code));　
    });
  };  
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// firebaseAuth.loginUserLogin()
// ログイン処理
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
firebaseAuth.loginUserLogin = function () {
//function loginUserLogin() {
  _log(1,'function','firebaseAuth.loginUserLogin()');

  var mailAddress = $('input#email-input').val();
  var password = $('input#pass-input').val();
  
  // 入力したユーザー・パスワードをチェックしＯＫならログイン
  firebase.auth().signInWithEmailAndPassword(mailAddress, password).catch(function(e) {
    alert(firebaseAuth.getErrorMessage(e.code));　
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// firebaseAuth.loginUserLogoff()
// ログアウト処理
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
firebaseAuth.loginUserLogoff = function () {
//function loginUserLogoff() {
  _log(1,'function','firebaseAuth.loginUserLogoff()');

  firebase.auth().signOut();
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// firebaseAuth.getErrorMessage()
// ログアウト処理
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
firebaseAuth.getErrorMessage = function (ecode) {
//function getFirebaseAuthErrorMessage(ecode) {
  _log(1,'function','firebaseAuth.getErrorMessage()');

  var ret = '';
  switch (ecode) {
    case 'auth/email-already-in-use':
      ret = '指定されたメールアドレスは既に登録されています。';
      break;
    case 'auth/invalid-email':
      ret = '指定されたメールアドレスは有効なアドレスではありません。';
      break;
    case 'auth/operation-not-allowed':
      ret = 'メールアドレス・パスワードが無効です。ファイアウォールコンソールの[認証]タブで、電子メール/パスワードアカウントを有効にしてください。';
      break;
    case 'auth/weak-password':
      ret = 'パスワードが短いか単純すぎます。';
      break;
    case 'auth/invalid-email':
      ret = 'メールアドレスが誤っています。';
      break;
    case 'auth/user-disabled':
      ret = '指定されたメールアドレスは誤っています。';
      break;
    case 'auth/user-not-found':
      ret = '指定されたメールアドレスは登録されていません。';
      break;
    case 'auth/wrong-password':
      ret = '指定されたメールアドレスに対するパスワードが誤っています。';
      break;
    case 'auth/app-deleted':
      ret = 'FirebaseAppのインスタンスが削除されたました。';
      break;
    case 'auth/app-not-authorized':
      ret = 'ホストされているドメインによって識別されたアプリケーションが、提供されたAPIキーでFirebase認証を使用する権限を与えられていません。';
      break;
    case 'auth/argument-error':
      ret = '不正な引数でメソッドが呼び出されました。';
      break;
    case 'auth/invalid-api-key':
      ret = '指定されたAPIキーが無効です。';
      break;
    case 'auth/invalid-user-token':
      ret = 'ユーザーの資格情報が無効になりました。';
      break;
    case 'auth/network-request-failed':
      ret = 'ネットワークエラー（タイムアウト、接続の中断、到達不能など）が発生ました。';
      break;
    case 'auth/operation-not-allowed':
      ret = 'Firebaseコンソールでプロバイダを有効になっていません。';
      break;
    case 'auth/requires-recent-login':
      ret = 'ユーザーの最後のサインイン時間がセキュリティしきい値を満たしていません。';
      break;
    case 'auth/too-many-requests':
      ret = '異常な動作のために要求がデバイスからブロックされました。';
      break;
    case 'auth/unauthorized-domain':
      ret = 'FirebaseプロジェクトのOAuth操作がアプリドメインに許可されていません。';
      break;
    case 'auth/user-disabled':
      ret = '管理者によりユーザーアカウントが無効にされました。';
      break;
    case 'auth/user-token-expired':
      ret = 'ユーザーの資格情報が期限切れか削除されました。';
      break;
    case 'auth/web-storage-unsupported':
      ret = 'ブラウザがWebストレージをサポートしていません。';
      break;
  };

  ret = ret + '\n(' + ecode + ')';

  return ret;
};

