const express = require('express');
const router = express.Router();
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Share Cookie app One' });
});
/**
 * create Cookie endpoint.
 */
router.get('/createCookie', function(req, res) {
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Allow-Origin', 'https://1349-2803-9800-909f-80fc-dcf9-acb5-6acb-3c25.sa.ngrok.io'); // app2 
  res.cookie('multidomainCookie', 'valueCookie',{sameSite:'None',secure:true}) //,secure:true
  res.end();
});


module.exports = router;
