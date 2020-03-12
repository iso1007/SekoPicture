var localFile = function() {};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// getFileSystemURL(url)
// ファイルシステムURLからdirectoryEntryオブジェクトを取得
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localFile.getFileSystemURL = function(url) {
  return new Promise(function(resolve, reject) {
    window.resolveLocalFileSystemURL(url, function(directoryEntry) {
      resolve(directoryEntry);
    },
    function(e) {
      reject(e);
    });
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// getReadEntrys(directoryEntry)
// directoryEntryオブジェクトからfileEntriesオブジェクトを取得
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localFile.getReadEntries = function(directoryEntry) {
  return new Promise(function(resolve, reject) {
    var directoryReader = directoryEntry.createReader();
    directoryReader.readEntries(function(fileEntrys) {
      resolve(fileEntrys);
    },
    function(e) {
      reject(e);
    });
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// getFileEntry(directoryEntry, filePath)
// directoryEntryとファイルURLからfileEntryオブジェクトを取得
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localFile.getFileEntry = function(directoryEntry, filePath, create) {
  return new Promise(function(resolve, reject) {
    var createParam = { create: false };
    if(create !== undefined || create === true) createParam = { create: true };
    directoryEntry.getFile(filePath, createParam, function(fileEntry) {
      resolve(fileEntry);
    },
    function(e) {
      reject(e);
    });
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// getFileObject(fileEntry)
// fileEntryオブジェクトからfileオブジェクトを取得
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localFile.getFileObject = function(fileEntry) {
  return new Promise(function(resolve, reject) {
    fileEntry.file(function(file) {
      resolve(file);
    },
    function(e) {
      reject(e);
    });
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// getTextFile(file)
// fileオブジェクトからtextファイルを読み込み
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localFile.getTextFile = function(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function(e) {
      resolve(e.target.result);
    };

    reader.onerror = function(e) {
      reject(e);
    };
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// getBlobFile(file)
// fileオブジェクトからblobファイルを読み込み
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localFile.getBlobFile = function(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function(e) {
      resolve(e.target.result);
    };

    reader.onerror = function(e) {
      reject(e);
    };
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// getFileWriter(fileEntry)
// fileEntryオブジェクトからfileWriterオブジェクトを取得する
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localFile.getFileWriter = function(fileEntry) {
  return new Promise(function(resolve, reject) {
    fileEntry.createWriter(function(fileWriter) {
      resolve(fileWriter);
    },
    function(e) {
      reject(e);
    });
  });
};

//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
// fileMoveTo(moveToDirectoryEntry, fileEntry)
// fileEntryオブジェクトを移動先ディレクトリ(moveToDirectoryEntry)に移動する
//_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_
localFile.fileMoveTo = function(moveToDirectoryEntry, fileEntry) {
  return new Promise(function(resolve, reject) {
    fileEntry.moveTo(moveToDirectoryEntry, fileEntry.name, function() {
      resolve(null);
    },
    function(e) {
      reject(e);
    });
  });
};