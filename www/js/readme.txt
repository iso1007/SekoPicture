monaca 覚え書き


※ 指定したリスト(ID)のons-list-itemをeachしたい時
    $('#pictureCheckList').children('ons-list-item').each(function(i) {
    };
  
	
※ 指定したエレメント配下の子エレメントを取得(each)  非同期処理
    listItem.each(function(){
      var itemname = $(this).attr('id');
      var filename = itemname.replace( 'listItem' , '');
      var upload   = $('#upload'+filename).text();
    });

※ 指定したエレメント配下の子エレメントを取得(for)　 同期処理
    var listItem = $('#koujiPictureList').children('ons-list-item');
    for(var i=0; i<listItem.length; i++) {
      var itemname = listItem.eq(i).attr('id');
      var upload   = $('#upload'+filename).text();
    }
    
	
※ 関数名をオブジェクト形式にしたい時
　　　　グローバルで
     > var オブジェクト名 = function() {};	
	を指定し、
	　オブジェクト名.関数名 = function(引数..) {
	 };
	 