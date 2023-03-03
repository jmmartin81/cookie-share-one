var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Share Cookie app One' });
});
/* GET home page. */
router.get('/createCookie', function(req, res, next) {
  console.log('aca en create')
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Allow-Origin', 'https://5e66-181-117-166-245.sa.ngrok.io');
  res.cookie('multidomainCookie', 'valueCookie',{sameSite:'None',secure:true}) //,secure:true
  res.end();
});


module.exports = router;
