var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var passportConfig = require('./config/passportConfig');
var flash = require('connect-flash');

var routes = require('./routes/index');
var users = require('./routes/users');
var board = require('./routes/board');
var bicycleMap = require('./routes/bicycleMap');
var videoView = require('./routes/videoView');
var app = express();
//html코드가 잘 보이도록
app.locals.pretty = true;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//jade view를 사용하는 코드
//app.set('view engine', 'jade');
//ejs view를 사용하는 코드
app.set('view engine','ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//세션설정
var sessionMiddleware = session({
    secret: 'keyboard tank',
    resave: false,
    saveUninitialized: true,
});
app.sessionMiddleware = sessionMiddleware;
app.use(sessionMiddleware);
//connect-flash 설정(세션에 저장하므로 세션 설정 뒤에 위치)
app.use(flash());
/*
app.use(session({
    secret: 'keyboard tank',
    resave: false,
    saveUninitialized: true,
}));*/
//패스포트 설정
app.use(passport.initialize());
app.use(passport.session());
passportConfig();
//정적파일 제공 path
app.use(express.static(path.join(__dirname, 'public')));


//커스텀 라우팅
app.use('/', routes);
app.use('/users', users);
app.use('/videoView', videoView);
//인증 확인(순서주의)
app.use(function authenticationMiddleware(req, res, next){
  if(req.isAuthenticated()){
   next(); 
  }else{
    res.redirect('/users/login');
  }
});
app.use('/board', board);
app.use('/bicycleMap', bicycleMap);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;