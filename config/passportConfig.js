var passport = require('passport');
var crypto = require('crypto');
var localStrategy = require('passport-local').Strategy;
var connection = require('./mysql');

module.exports = function () {
    passport.use(new localStrategy({
        usernameField: 'userid',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, userid, password, done) {
        connection.query('select * from member where memberid = "' + userid + '"',
            function (err, results, fields) {
                if(err){
                    return done(null,false);
                }
                if (results[0] && results[0].PASSWORD == password) {
                    //result = sql서 가져온 유저정보 session에 저장
                    return done(null, results);
                } else {
                    return done(null, false);
                }
            });
        //connection.end();
    }));
    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(function (user, done) {
        done(null, user);
    }); 
}