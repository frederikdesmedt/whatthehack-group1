var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/page2', (req, res, next) => {
  res.render('page2');
});

router.get('/guide/:guideId', (req, res, next) => {
  res.render('page4');
});

module.exports = router;