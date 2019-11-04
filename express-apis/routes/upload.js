var express = require('express');
var router = express.Router();
var fs = require('fs');
// multerのインポート
var multer = require('multer');
// 保存先を./uplods/以下へ指定
var uploads = multer({ dest: './local/uploads/' });

/* /uploadへのgetリクエスト時にアップロード画面を表示 */
router.get('/', function(req, res, next) {
  res.render('upload', { title: 'Upload' });
});

/* /uploadへのpostリクエスト時にアップロードを行い、画面を表示 */
router.post('/', uploads.fields([{ name: 'uploadFile' }]), function(
  req,
  res,
  next
) {
  var path = req.files.uploadFile[0].path;
  var filename = req.files.uploadFile[0].filename;
  var originalname = req.files.uploadFile[0].originalname;
  var targetPath = './local/uploads/' + originalname;

  console.log(path, filename, originalname);

  fs.rename(path, targetPath, function(err) {
    if (err) {
      throw err;
    }
    fs.unlink(path, function() {
      if (err) {
        throw err;
      }
      res.send(
        'File uploaded to: ' +
          targetPath +
          ' - ' +
          req.files.thumbnail[0].size +
          ' bytes'
      );
    });
  });

  res.render('upload', {
    title: 'Upload',
    message: 'アップロードが完了しました'
  });
});
/* /uploadへのpostリクエスト時にアップロードを行い、画面を表示 */
router.post('/multi', uploads.fields([{ name: 'uploadMultiFile' }]), function(
  req,
  res,
  next
) {
  var path = req.files.uploadMultiFile[0].path;
  var filename = req.files.uploadMultiFile[0].filename;
  var originalname = req.files.uploadMultiFile[0].originalname;
  var targetPath = './local/uploads/' + originalname;

  console.log(path, filename, originalname);

  fs.rename(path, targetPath, function(err) {
    if (err) {
      throw err;
    }
    fs.unlink(path, function() {
      if (err) {
        throw err;
      }
      res.send(
        'File uploaded to: ' +
          targetPath +
          ' - ' +
          req.files.thumbnail[0].size +
          ' bytes'
      );
    });
  });

  res.render('upload', {
    title: 'Upload',
    message: 'アップロードが完了しました',
    messageMulti: '複数ファイルのアップロードが完了しました'
  });
});

module.exports = router;
