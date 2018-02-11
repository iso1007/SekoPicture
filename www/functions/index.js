/**
 * このソースはfirebase functions のバックアップ用
 * 
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for t`he specific language governing permissions and
 * limitations under the License.
 * 
 */
'use strict';

// firebase functions の初期化
const functions = require('firebase-functions');

// firebaseの初期化
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// サービスアカウント定義のインクルード
const gcs = require('@google-cloud/storage')({keyFilename: 'service-account-credentials.json'});

// node.js ファイルパスの文字列操作APIの定義
const spawn = require('child-process-promise').spawn;

// node.js フォルダの作成APIの定義
const mkdir = require('mkdirp-promise');

// node.js ファイルパスの文字列操作APIの定義
const path = require('path');

// node.js OSに関するAPIの定義(tempフォルダの取得用)
const os = require('os');

// node.js ファイルやフォルダに関するAPIの定義
const fs = require('fs');

// サムネイルファイルの縦横最大サイズ
const THUMB_MAX_HEIGHT = 320;
const THUMB_MAX_WIDTH = 320;

// 一時ファイル名
const THUMB_PREFIX = 'thumb_';

// サムネイルフォルダ名
const THUMB_PREFIX_PATH = '/thumbnail';

// データベースの階層名 yatamaapp01/%uid%/THUMB_DATABASE_PATH/%工事名称%/
const THUMB_DATABASE_PATH = '/group00/pictureList';

// 略図フォルダ名
const THUMB_COMMONSHAPE_PATH = 'CommonShape';

/**
 * Cloud Strageに保存されたjpegファイルのサムネイル(縮小画像)ファイルを自動生成して保存する
 **/
exports.afterUploadStorage = functions.storage.object().onChange(event => {

//  // リソースが削除済みの場合は処理を終了する
//  if (event.data.resourceState === 'not_exists') {
////  console.log('event.data.resourceState.', event.data.name+'not_exists');
//    return null;
//  }

  // filePath. UID/工事名称/ファイル名.jpg
  const filePath = event.data.name;
//console.log('filePath.',filePath);

  // fileDir. UID/工事名称/
  const fileDir = path.dirname(filePath);

  // ディレクトリ名の末尾に"thumbnail"が付いている場合は処理を終了する
  if (fileDir.endsWith(THUMB_PREFIX_PATH)) {
//  console.log('thumbnail folder.', fileDir);
    return null;
  }

  var result = fileDir.split('/');
  const uid = result[0];
//console.log('UID.',uid);
  const koujiName = result[1];
//console.log('koujiName.',koujiName);

  // contentType. image/jpeg
  const contentType = event.data.contentType;
//console.log('contentType.',contentType);

  // fileName. ファイル名.jpg
  const fileName = path.basename(filePath);
//console.log('fileName.',fileName);

  // thumbFilePath. UID/工事名称/thumb_ファイル名.jpg
  const thumbFilePath = path.normalize(path.join(fileDir, THUMB_PREFIX+fileName));
//console.log('thumbFilePath..',thumbFilePath);

  // thumbUploadPath. UID/工事名称/thumbnail/ファイル名.jpg
  const thumbUploadPath = path.normalize(path.join(fileDir,THUMB_PREFIX_PATH,fileName));
//console.log('thumbUploadPath.',thumbUploadPath);

  // tempLocalFile. /tmp/UID/工事名称/ファイル名.jpg
  const tempLocalFile = path.join(os.tmpdir(), filePath);
//console.log('tempLocalFile.',tempLocalFile);

  // tempLocalDir. /tmp/UID/工事名称
  const tempLocalDir = path.dirname(tempLocalFile);
//console.log('tempLocalDir.',tempLocalDir);

  // tempLocalThumbFile. /tmp/UID/工事名称/thumbnail/thumb_ファイル名.jpg
  const tempLocalThumbFile = path.join(os.tmpdir(), thumbFilePath);
//console.log('tempLocalThumbFile.',tempLocalThumbFile);

  // 保存されたファイルのファイル名から、名前と拡張子を取得
  var fileBaseName = path.basename(fileName, path.extname(fileName));
  var fileExtname = path.extname(fileName);
//console.log(fileBaseName);
//console.log(fileExtname);

  const bucket = gcs.bucket(event.data.bucket);
  const file = bucket.file(filePath);
//const thumbFile = bucket.file(thumbFilePath);

  // 保存されたファイルがイメージファイルの場合
  // Cloud Strageに保存されたjpegファイルからサムネイル(縮小画像)ファイルを自動生成して保存する
  if (contentType.startsWith('image/')) {

    // 処理対象が略図ファイルの場合は、ファイル名と拡張子をDatabaseに保存する
    if (koujiName === THUMB_COMMONSHAPE_PATH) {
    
      // firebase realtime databaseに保存するキー名を作成
      var infopath = path.join(uid, THUMB_DATABASE_PATH, koujiName, fileBaseName);

      if (event.data.resourceState === 'not_exists') {
        console.log('CommonShapefileinfo remove : ','['+infopath+']');
        
        // 略図ファイルが削除された場合、Cloud Database から対象の写真情報を削除する
        return admin.database().ref(infopath).set(null);
      }else{
        console.log('CommonShapefileinfo set : ','['+infopath+']');

        // 2018/01/27 ADD -----↓
        // 既存の略図ファイルを変更した場合に'child_changed'が発生しない為、一旦削除して追加する
        admin.database().ref(infopath).set(null);
        // 2018/01/27 ADD -----↑
        
        // Cloud Database に、写真情報を保存する
        return admin.database().ref(infopath).set(fileExtname);
      }
    }else{
      // 対象ファイルが追加された場合
      if (event.data.resourceState !== 'not_exists') {
        console.log('Upload File : ','['+filePath+']');

        const metadata = { contentType: contentType };
        // 作業用フォルダを作成する
        return mkdir(tempLocalDir).then(() => {
          // 保存されたイメージを、作成した作業フォルダにコピー
          return file.download({destination: tempLocalFile});
        }).then(() => {
          // 作業フォルダのイメージファイルをImageMagickを使用して縮小イメージを作成する
//        console.log(THUMB_MAX_WIDTH+'x'+THUMB_MAX_HEIGHT);
          return spawn('convert', [tempLocalFile, '-thumbnail', THUMB_MAX_WIDTH+'x'+THUMB_MAX_HEIGHT+'>', tempLocalThumbFile], {capture: ['stdout', 'stderr']});
        }).then(() => {
          // 作成した縮小イメージを一時ファイル名で保存する
          return bucket.upload(tempLocalThumbFile, { destination: thumbUploadPath, metadata: metadata });
        });
      }
    }  
  }else{

  // ファイルがjsonファイルの場合
  // 内容を読み込んでfirebase realtime database に保存する
  if (fileExtname === '.json') {
    // firebase realtime databaseに保存するキー名を作成
    var infopath = path.join(uid, THUMB_DATABASE_PATH, koujiName, fileBaseName);
    
    if (event.data.resourceState === 'not_exists') {
      console.log('jsonfileinfo remove : ','['+infopath+']');
      
      // 対象ファイルが削除された場合、Database から写真情報を削除する
      return admin.database().ref(infopath).set(null);
    }else{
      console.log('jsonfileinfo set : ','['+infopath+']');
      
      // 作業用フォルダを作成する
      return mkdir(tempLocalDir).then(() => {
        // 保存されたイメージを、作成した作業フォルダにコピー
        return file.download({destination: tempLocalFile});
      }).then(() => {
        // xxxxxxxx.jsonの内容を変数に引き渡す
        var jsonFile = require(tempLocalFile);
        // Cloud Database に、写真情報を保存する
        return admin.database().ref(infopath).set(
          { pictureId: jsonFile.pictureId,
            kousyu   : jsonFile.kousyu,
            sokuten  : jsonFile.sokuten,
            hiduke   : jsonFile.hiduke,
            bikou    : jsonFile.bikou,
            syamei   : jsonFile.syamei,
            datetime : jsonFile.datetime
          }
        );
      });
    }  
  }};
});

exports.newUserCreate = functions.auth.user().onCreate(event => {
  console.log('新しいユーザーが作成されました。');
});