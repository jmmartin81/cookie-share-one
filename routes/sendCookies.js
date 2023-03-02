const { Axios } = require('axios');
var express = require('express');
var router = express.Router();
const axios = require('axios');
/* GET users listing. */
router.post('/', async function(req, res, next) {

const axiosCall = {
    url: `https://34fb-2803-9800-909f-80fc-71aa-e3e7-c5c2-33ed.sa.ngrok.io/cookies`,
    headers: {'Content-Type':'application/json'},
    method: 'POST',
    data: {
        'username': 'something',
        
        }
      ,withCredentials: true,	
    
};
const result = await axios(axiosCall);
console.log(`AXIOS response: ${JSON.stringify(result.headers)} `)
res.send('Trying to send cookies to other App');
});

module.exports = router;
