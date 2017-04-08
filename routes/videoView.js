var express = require('express');
var router = express.Router();
//방송 리스트
router.get('/', function(req, res, next){
    
});
//방송 룸
router.get('/:room', function(req, res, next) {
    //room = 방 이름, auth = 로그인 여부
    res.render('videoView',{'room':req.params.room, 'auth':req.isAuthenticated()});
});

module.exports = router;
