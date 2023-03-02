var express = require('express');
var router = express.Router();

/* POST home page. */
router.get('/', function(req, res, next) {
  res.cookie('multidomainCookie', 'valueCookie')
  res.render('index', { title: 'Creating a cookie on App 1' });
});

module.exports = router;
