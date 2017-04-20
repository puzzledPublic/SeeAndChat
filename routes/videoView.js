var express = require('express');
var mysql = require('../config/mysql');
//채팅 룸 리스트 
var ioRoom = require('../bin/www');
var router = express.Router();

//방송 리스트
router.get('/', function(req, res, next){
    /*
    let roomNames = [];
    for(let i in ioRoom.rooms){
        roomNames.push(i);
    }
    */
    //TODO::DB(memberroom table)에서 visible=true인 방 리스트를 가져온다
   
    mysql.query('select * from memberroom where visible = true',function(err, results, fields){
        //view의 nav 판단
        let auth = req.isAuthenticated();
        let user = { 'HASROOM': false };
        if (auth) {
            user = req.user[0];
        }
       if(results){
           //results[i].roomname, visible, streamkey, subject, category...
           res.render('videoList', {
               'auth': auth,
               'rooms': results,
               'user': user
           });
       } 
       else{
          res.render('videoList', {
               'auth': auth,
               'rooms': [],
               'user': user
           });
       }
    });
    
    
});
//방송 룸
router.get('/:room', function(req, res, next) {
    //로그인 유저면
    if(req.isAuthenticated()){
        //자기 방으로
        if(req.user[0].HASROOM == true && req.user[0].ROOMNAME == req.params.room){
            //room = 방 이름, auth = 로그인 여부
            res.render('videoView',{'room':req.params.room, 'auth':req.isAuthenticated()});
        }else{
            let flag = false;
            for(let roomName in ioRoom.rooms){
              //방이 존재하면
               if(req.params.room == roomName){
                   flag = true;
                   break;
              }
           }
            if(flag){
              res.render('videoView',{'room':req.params.room,'auth':req.isAuthenticated()});
            }else{
              res.redirect('back');
           }
        }
    }
    //비로그인 유저면
    else{
        let flag = false;
        for(let roomName in ioRoom.rooms){
            //방이 존재하면
            if(req.params.room == roomName){
                flag = true;
                break;
            }
        }
        if(flag){
            res.render('videoView',{'room':req.params.room,'auth':req.isAuthenticated()});
        }else{
            res.redirect('back');
        }
    }
});
//방 설정 페이지
router.get('/:room/config', function(req, res, next){
    //유저 별 설정 (방 리스트 보이기 유무(visible), 스트리밍 키(streamkey), 방 제목(roomsubject), 분류(category))
    if(!req.isAuthenticated() || req.user[0].ROOMNAME != req.params.room){
        res.send('잘못된 접근입니다');
    }else{
        mysql.query('select * from memberroom where roomname=?',[req.params.room],function(err, results, fields){
            if(results[0] != undefined){
                res.render('videoConfig',{'configInfo': results[0]});
            }
            else{
                res.render('videoConfig');
            }
        });
    }
});
//방 설정 정보 저장 및 방 리스트에 추가  
router.post('/:room/config',function(req, res, next){
    //check input이 체크표시 때는 'on'으로 들어옴
    let visible = false;
    if(req.body.visible == 'on'){
        visible = true;
    }

    mysql.query('update memberroom set visible = ?, subject = ?, category = ? where roomname = ?',
        [visible, req.body.roomsubject, req.body.category, req.params.room],function(err, results, fields){
            if(err){
                console.log('방 설정 저장 에러');
            }
        });
      
    res.redirect('../');
    
});
//방 신청 
router.get('/room/apply', function(req, res, next){
    //TODO 방이 이미 있다면 바로 리턴.

    //스트림키 생성
    let streamkey="";
    for(let i = 0 ; i < 10; i++){
        streamkey += String.fromCharCode(97 + ~~(Math.random()*26));
    }
    //2개 쿼리 순차적으로 하기 위해 트랜잭션
    mysql.beginTransaction(function (err) {
        if (err) {
            console.log(err);
            throw err;
        }
        mysql.query('update member set roomname = ?, hasroom = true',[req.user[0].memberid], function (err, results, fields) {
            //TODO::streamkey 생성
            if (err) {
                return mysql.rollback(function () {
                    console.log(err);
                    throw err;
                });
            }
            mysql.query('insert into memberroom (roomname, visible, streamkey, category) values(?,?,?,?)', [req.user[0].MEMBERID, false, streamkey, 1], function (err, results, fields) {
                if (err) {
                    return mysql.rollback(function () {
                        console.log(err);
                        throw err;
                    });
                }
                mysql.commit(function (err) {
                    if (err) {
                        return mysql.rollback(function () {
                            console.log(err);
                            throw err;
                        });
                    }
                    //세션 저장된 방 여부 수정
                    req.user[0].HASROOM = true;
                    req.flash('apply','방 생성 완료');
                });
            });
        });
    });
    res.redirect('./');
    
});
module.exports = router;
