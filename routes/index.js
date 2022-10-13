var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', function (req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Nunjucks' }); // index.html에 title이라는 변수를 전달
});

module.exports = router;
