const service = require('./azure-service');

// 以下そのままに
let express = require('express');
let router = express.Router();

// multerのインポート
let multer = require('multer');
// 保存先を./uplods/以下へ指定
let uploads = multer({ dest: './local/uploads/' });

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
  let path = req.files.uploadFile[0].path;
  let filename = req.files.uploadFile[0].filename;
  let originalname = req.files.uploadFile[0].originalname;
  let targetPath = './local/uploads/' + originalname;

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
  let path = req.files.uploadMultiFile[0].path;
  let filename = req.files.uploadMultiFile[0].filename;
  let originalname = req.files.uploadMultiFile[0].originalname;
  let targetPath = './local/uploads/' + originalname;

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
