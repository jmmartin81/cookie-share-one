var express = require('express');
var router = express.Router();

/* POST home page. */
router.post('/', function(req, res, next) {
  res.cookie('multidomainCookie', 'valueCookie',{ sameSite: 'None'})
  res.render('index', { title: 'Creating a cookie on App 1' });
});

module.exports = router;
