/*

  *** SHA-256 Secure Hash Class ***

  Reference: FIPS 180-2
             http://csrc.nist.gov/publications/fips/fips180-2/fips180-2.pdf

  Developed: StudioAREA WIZ.
             http://wiz-code.net/

*/
SHA256 = new function() {

  // バイト配列の指定したインデックスから32bit値を取得
  var BitConverterToInt = function(Bytes, Index) {
    return (Bytes[Index++] << 24) + (Bytes[Index++] << 16) + (Bytes[Index++] << 8) + (Bytes[Index++]);
  }

  // 32bit値をバイト配列に変換
  var BitConverterToBytes = function(Bytes, Value) {
    Bytes[Bytes.length] = (Value & 0xff000000) >>> 24
    Bytes[Bytes.length] = (Value & 0x00ff0000) >>> 16
    Bytes[Bytes.length] = (Value & 0x0000ff00) >>> 8
    Bytes[Bytes.length] = (Value & 0x000000ff)
  }

  // メッセージブロック処理用定数
  var k = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
           0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
           0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
           0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
           0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
           0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
           0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
           0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];

  var w = 32;

  var SHR  = function(v, n) { return v >>> n };
  var SHL  = function(v, n) { return v << n };
  var ROTR = function(v, n) { return (v >>> n) | (v << (w - n)) };
  var ROTL = function(v, n) { return (v >>> (w - n)) | (v << n) };

  var Ch   = function(x, y, z) { return (x & y) ^ (~x & z) };
  var Maj  = function(x, y, z) { return (x & y) ^ (x & z) ^ (y & z) };

  var SIGMA0 = function(v) { return ROTR(v,  2) ^ ROTR(v, 13) ^ ROTR(v, 22) };
  var SIGMA1 = function(v) { return ROTR(v,  6) ^ ROTR(v, 11) ^ ROTR(v, 25) };
  var sigma0 = function(v) { return ROTR(v,  7) ^ ROTR(v, 18) ^ SHR(v,  3) };
  var sigma1 = function(v) { return ROTR(v, 17) ^ ROTR(v, 19) ^ SHR(v, 10) };

  var safeAdd2 = function(v1, v2) { return (v1 + v2) & 0xffffffff };
  var safeAdd4 = function(v1, v2, v3, v4) { return (v1 + v2 + v3 + v4) & 0xffffffff };
  var safeAdd5 = function(v1, v2, v3, v4, v5) { return (v1 + v2 + v3 + v4 + v5) & 0xffffffff };

  // ハッシュ計算処理
  var Computation = function(hash, block) {
    var t1, t2;
    var w = [];
    var a, b, c, d, e, f, g, h;
    var i, j;

    // 現在のハッシュ値を記憶
    a = hash[0]; b = hash[1]; c = hash[2]; d = hash[3];
    e = hash[4]; f = hash[5]; g = hash[6]; h = hash[7];

      // ローテーション処理
      for(i = 0; i < 64; i++) {

          if(i < 16) {
            w[i] = BitConverterToInt(block, i << 2);

          } else {
            w[i] = safeAdd4(sigma1(w[i - 2]), w[i - 7], sigma0(w[i - 15]), w[i - 16]);

          }

        t1 = safeAdd5(h, SIGMA1(e), Ch(e, f, g), k[i], w[i]);
        t2 = safeAdd2(SIGMA0(a), Maj(a, b, c));

        h = g;
        g = f;
        f = e;
        e = safeAdd2(d, t1);
        d = c;
        c = b;
        b = a;
        a = safeAdd2(t1, t2);
      }

    var intHash = []
    intHash[0] = safeAdd2(hash[0], a);
    intHash[1] = safeAdd2(hash[1], b);
    intHash[2] = safeAdd2(hash[2], c);
    intHash[3] = safeAdd2(hash[3], d);
    intHash[4] = safeAdd2(hash[4], e);
    intHash[5] = safeAdd2(hash[5], f);
    intHash[6] = safeAdd2(hash[6], g);
    intHash[7] = safeAdd2(hash[7], h);

    return intHash;
  }


  // SHA256アルゴリズムによるハッシュ値を計算します。
  // input ... 入力データをバイト配列で指定
  this.ComputeHash = function(input) {
    var intBlock, i, j;
    var lngLength = input.length;               // 配列の長さを記憶


    //// パディング処理 ////

    input[input.length] = 0x80;                 // 入力データの末尾に0x80を追加
    intBlock = (input.length >>> 6) + 1;        // メッセージブロックの総数を求める
    if((input.length & 0x3f) > 56) intBlock++;  // 最後のブロックが56Byteを超えていたらブロックを追加

    // ブロック数に合わせて配列を拡張して0x00で埋める
    for(i = input.length; i < (intBlock << 6); i++) input[i] = 0x00;

    // 配列の長さを記入
    lngLength <<= 3;                            // bit数で記入するので8倍に

    input[(intBlock << 6) - 4] = (lngLength & 0xff000000) >>> 24;
    input[(intBlock << 6) - 3] = (lngLength & 0x00ff0000) >>> 16;
    input[(intBlock << 6) - 2] = (lngLength & 0x0000ff00) >>> 8;
    input[(intBlock << 6) - 1] =  lngLength & 0x000000ff;

    //// メッセージブロック処理 ////

    // ハッシュ値の初期値
    var intHash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var bytBlock = [];

      // ブロック処理ループ
      for(i = 0; i < intBlock; i++) {

        // メッセージブロックを入力データからコピー
        for(j = 0; j < 64; j++) bytBlock[j] = input[(i << 6) + j];

        // ハッシュ計算処理
        intHash = Computation(intHash, bytBlock);

      }

    var bytReturn = [];

      for(i = 0; i < 8; i++) {
        BitConverterToBytes(bytReturn, intHash[i]);
      }

    return bytReturn;
  }
}



// テキストからSHA256ハッシュを取得
function SHA256Hash(Text) {

  // バイト配列を16進数文字列に変換
  var BytesToString = function(input) {
    var i;
    var strReturn = "";

      for(i = 0; i < input.length; i++) {

        // 0x00～0x0fなら"0"を追加し値を16進数に変換
        strReturn += (input[i] > 0x0f ? "" : "0") + input[i].toString(16);

        /* デバッグ出力用(32bitごとにスペース、16byteごとに改行を追加)
          if((i & 0xf) == 0xf) {
            strReturn += "<br />";
            //strReturn += "&nbsp;";

          } else if((i & 0x3) == 0x3) {
            strReturn += "&nbsp;";

          }
         //*/
      }

    return strReturn;
  }

  // 文字列をバイト配列に変換
  // マルチバイトの文字コードセットは考慮してません。
  var StringToBytes = function(input) {
    var i, n;
    var bytReturn = [];
    var chrCode;

      for(i = n = 0; i < input.length; i++) {

        // 文字コードを取得
        chrCode = input.charCodeAt(i);

          // マルチバイトの場合は２つに分ける
          if(chrCode > 0xff) {
            bytReturn[n++] = chrCode >>> 8;
            bytReturn[n++] = chrCode & 0xff;

          } else {
            bytReturn[n++] = chrCode;

          }
      }

    return bytReturn;
  }

  var bytData = StringToBytes(Text);          // 文字列をバイト配列に変換
//  var bytData = Text;          // 文字列をバイト配列に変換
  var bytHash = SHA256.ComputeHash(bytData);  // バイト配列からハッシュを取得
  return BytesToString(bytHash);              // バイト配列を16進数文字列に変換して返す
}
