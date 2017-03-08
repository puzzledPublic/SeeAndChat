var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next){
  req.requestTime = new Date();
  next();
}, function(req, res) {
  responseText = 'Hello User';
  responseText += ' You enter my website at ' + req.requestTime;
  res.send(responseText);
});


module.exports = router;
