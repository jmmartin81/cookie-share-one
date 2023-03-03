var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Share Cookie app One' });
});
/* GET home page. */
router.get('/createCookie', function(req, res, next) {
  console.log('aca en create')
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Allow-Origin', 'https://8dd5-2803-9800-909f-80fc-69f8-103c-d1d-9dd1.sa.ngrok.io');
  res.cookie('multidomainCookie', 'valueCookie',{sameSite:'None',secure:true}) //,secure:true
  res.end();
});


module.exports = router;
