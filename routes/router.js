var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Router Page' });
});

// ルートパラメーター
router.get('/name/:name_text', function(req, res, next) {
  // GET /user/name/name_text
  console.log(req.params.name_text);
  // => 'name_text'
  res.send(req.params.name_text);
});

// ルートハンドラー例
var cb0 = function(req, res, next) {
  console.log('0号です！次は、１号さんの出番');
  next();
};

var cb1 = function(req, res, next) {
  console.log('１号登場！ ブラウザにHello from Handler! と出力されるよ');
  next();
};
router.get(
  '/handler',
  [cb0, cb1],
  function(req, res, next) {
    console.log('the response will be sent by the next function ...');
    next();
  },
  function(req, res) {
    res.send('Hello from Handler!');
  }
);

module.exports = router;
