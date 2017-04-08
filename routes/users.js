var express = require('express');
var crypto = require('crypto');
var router = express.Router();
var passport = require('passport');
var mysql = require('../config/mysql');
/* GET users listing. */
router.get('/', function (req, res, next) {
  
  req.requestTime = new Date();
  next();
}, function (req, res) {
  responseText = 'Hello User';
  responseText += ' You enter my website at ' + req.requestTime;
  res.send(responseText);
});
//로그인 화면
router.get('/login', function(req, res, next){
  //인증됐는지?
  if(req.isAuthenticated()){
    res.redirect('/');
  }else{
    res.render('login');
  }
});
//로그인
router.post('/login',passport.authenticate('local',
  {
    successRedirect:'/',
    failureRedirect:'./login'
  })
);
//로그아웃
router.get('/logout', function(req, res, next){
  req.logout();
  req.session.destroy();
  res.redirect('/');
});
//회원가입 화면
router.get('/signup',function(req, res, next){
  res.render('signup');
});
//회원가입 
router.post('/signup',function(req, res, next){
  if(req.body.password === req.body.passwordcheck){
    mysql.query('insert into member (memberid, password, name) values("'
    +req.body.userid+'","'+req.body.password+'","'+req.body.userid+'")');
  }
  res.end();
});
module.exports = router;