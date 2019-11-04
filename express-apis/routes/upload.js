var express = require('express');
var router = express.Router();
var fs = require('fs');
// multerのインポート
var multer = require('multer');
// 保存先を相対ルートの./uplods/以下へ指定
var upload = multer({ dest: './uploads/' });

/* /uploadへのgetリクエスト時にアップロード画面を表示 */
router.get('/', function(req, res, next) {
  res.render('upload', { title: 'Upload' });
});

/* /uploadへのpostリクエスト時にアップロードを行い、画面を表示 */
router.post('/', upload.fields([{ name: 'uploadFile' }]), function(
  req,
  res,
  next
) {
  var path = req.files.uploadFile[0].path;
  var filename = req.files.uploadFile[0].filename;
  var originalname = req.files.uploadFile[0].originalname;
  var targetPath = './uploads/' + originalname;

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

module.exports = router;
