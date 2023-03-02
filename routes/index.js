var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.cookie('multidomainCookie', 'valueCookie')
  res.render('index', { title: 'Express app One' });
});

module.exports = router;
