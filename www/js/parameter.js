//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// getKokubanSizeBairitu()
// 黒板サイズ名から倍率を取得
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function getKokubanSizeBairitu(size) {
  var ret = 0.33;       // 0.4
  switch (size) {
    case 'minimum' :
      ret = 0.23;       // 0.2
      break;
    case 'small' :
      ret = 0.28;       // 0.3
      break;
    case 'medium' :
      ret = 0.33;       // 0.4
      break;
    case 'large' :
      ret = 0.38;       // 0.5
      break;
    case 'free' :
      ret = 0.33;       // 0.4
      break;
  };
  return ret;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// getPictureSize()
// 黒板サイズ名から倍率を取得
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function getPictureSize(size) {
  var ret = {width:768, height:1024, quality: 100};
  switch (size) {
    case 'minimum' :
      ret = {width:480, height:640, quality: 100};
      break;
    case 'small' :
      ret = {width:600, height:800, quality: 100};
      break;
    case 'medium' :
      ret = {width:768, height:1024, quality: 100};
      break;
    case 'large' :
      ret = {width:960, height:1280, quality: 100};
      break;
    case 'maximum' :
      ret = {width:1440, height:1920, quality: 100};
      break;
  };      
  return ret;
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// getPictureQuality()
// 写真のクオリティー（圧縮率）を取得
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function getPictureQuality(ratio) {
  var ret = 80;
  switch (ratio) {
    case 'normal' :
      ret = 60;
      break;
    case 'heightQuality' :
      ret = 80;
      break;
    case 'bestQuality' :
      ret = 100;
      break;
  };
  return ret;
};

// 2018/02/07 ADD -----↓
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// getDeviceName()
// 端末のデバイスモデルからデバイス名を取得
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
function getDeviceName() {
  var name = device.model;  
  
  if(device.platform === 'iOS') {
    
    switch (device.model) {
      case "iPad1,1" : name = "iPad"; break;
      case "iPad2,1" : name = "iPad 2"; break;
      case "iPad2,2" : name = "iPad 2"; break;
      case "iPad2,3" : name = "iPad 2"; break;
      case "iPad2,4" : name = "iPad 2"; break;
      case "iPad3,1" : name = "iPad (3rd generation)"; break;
      case "iPad3,2" : name = "iPad (3rd generation)"; break;
      case "iPad3,3" : name = "iPad (3rd generation)"; break;
      case "iPad3,4" : name = "iPad (4th generation)"; break;
      case "iPad3,5" : name = "iPad (4th generation)"; break;
      case "iPad3,6" : name = "iPad (4th generation)"; break;
      case "iPad4,1" : name = "iPad Air"; break;
      case "iPad4,2" : name = "iPad Air"; break;
      case "iPad4,3" : name = "iPad Air"; break;
      case "iPad5,3" : name = "iPad Air 2"; break;
      case "iPad5,4" : name = "iPad Air 2"; break;
      case "iPad6,7" : name = "iPad Pro (12.9)"; break;
      case "iPad6,8" : name = "iPad Pro (12.9)"; break;
      case "iPad6,3" : name = "iPad Pro (9.7)"; break;
      case "iPad6,4" : name = "iPad Pro (9.7)"; break;
      case "iPad6,11" : name = "iPad (5th generation)"; break;
      case "iPad6,12" : name = "iPad (5th generation)"; break;
      case "iPad7,1" : name = "iPad Pro (12.9, 2nd generation)"; break;
      case "iPad7,2" : name = "iPad Pro (12.9, 2nd generation)"; break;
      case "iPad7,3" : name = "iPad Pro (10.5)"; break;
      case "iPad7,4" : name = "iPad Pro (10.5)"; break;
      case "iPad2,5" : name = "iPad mini"; break;
      case "iPad2,6" : name = "iPad mini"; break;
      case "iPad2,7" : name = "iPad mini"; break;
      case "iPad4,4" : name = "iPad mini 2"; break;
      case "iPad4,5" : name = "iPad mini 2"; break;
      case "iPad4,6" : name = "iPad mini 2"; break;
      case "iPad4,7" : name = "iPad mini 3"; break;
      case "iPad4,8" : name = "iPad mini 3"; break;
      case "iPad4,9" : name = "iPad mini 3"; break;
      case "iPad5,1" : name = "iPad mini 4"; break;
      case "iPad5,2" : name = "iPad mini 4"; break;
      case "iPhone1,1" : name = "iPhone"; break;
      case "iPhone1,2" : name = "iPhone 3G"; break;
      case "iPhone2,1" : name = "iPhone 3GS"; break;
      case "iPhone3,1" : name = "iPhone 4"; break;
      case "iPhone3,2" : name = "iPhone 4"; break;
      case "iPhone3,3" : name = "iPhone 4"; break;
      case "iPhone4,1" : name = "iPhone 4S"; break;
      case "iPhone5,1" : name = "iPhone 5"; break;
      case "iPhone5,2" : name = "iPhone 5"; break;
      case "iPhone5,3" : name = "iPhone 5c"; break;
      case "iPhone5,4" : name = "iPhone 5c"; break;
      case "iPhone6,1" : name = "iPhone 5s"; break;
      case "iPhone6,2" : name = "iPhone 5s"; break;
      case "iPhone7,2" : name = "iPhone 6"; break;
      case "iPhone7,1" : name = "iPhone 6 Plus"; break;
      case "iPhone8,1" : name = "iPhone 6s"; break;
      case "iPhone8,2" : name = "iPhone 6s Plus"; break;
      case "iPhone8,4" : name = "iPhone SE"; break;
      case "iPhone9,1" : name = "iPhone 7"; break;
      case "iPhone9,3" : name = "iPhone 7"; break;
      case "iPhone9,2" : name = "iPhone 7 Plus"; break;
      case "iPhone9,4" : name = "iPhone 7 Plus"; break;
      case "iPhone10,1" : name = "iPhone 8"; break;
      case "iPhone10,4" : name = "iPhone 8"; break;
      case "iPhone10,2" : name = "iPhone 8 Plus"; break;
      case "iPhone10,5" : name = "iPhone 8 Plus"; break;
      case "iPhone10,3" : name = "iPhone X"; break;
      case "iPhone10,6" : name = "iPhone X"; break;
      case "iPod1,1" : name = "iPod touch"; break;
      case "iPod2,1" : name = "iPod touch (2nd generation)"; break;
      case "iPod3,1" : name = "iPod touch (3rd generation)"; break;
      case "iPod4,1" : name = "iPod touch (4th generation)"; break;
      case "iPod5,1" : name = "iPod touch (5th generation)"; break;
      case "iPod7,1" : name = "iPod touch (6th generation)"; break;
    };
  }
  
  return name;
};
// 2018/02/07 ADD -----↑
