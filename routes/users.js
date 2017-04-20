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

  //아이디 체크
  //비밀번호 체크
  if (/^[a-z][a-z\d]{3,11}$/.test(req.body.userid) && req.body.password === req.body.passwordcheck) {
    try {
      //비밀번호 해싱
      //let hash = crypto.createHash('sha256').update(req.body.password).digest('base64');
      //console.log(hash);
      mysql.query('insert into member (memberid, password, name, hasroom, roomname) values("'
        + req.body.userid + '","' + req.body.password + '","' + req.body.userid + '",false,"' + req.body.userid + '")');
    }
    catch(err){    
      console.log("회원가입 error "+ err);
      res.send('회원 가입 오류');
    }
    //환영 페이지로
    res.render('greetpage');
  }
  else{
    //에러 출력
    res.send('회원 가입 오류');
  }
});
//아이디 체크
router.post('/idcheck', function(req, res, next){
  mysql.query('select * from member where MEMBERID ="'+req.body.userid+'"',function(err, results, fields){
    if(err){
      res.json({'result':false});
    } 
    if(results[0] == undefined){
      res.json({'result':true});
    }else{
      res.json({'result':false});
    }
  });
});
module.exports = router;