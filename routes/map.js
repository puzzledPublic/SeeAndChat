var express = require('express');
var router = express.Router();
var multer = require('multer');
var mysql = require('../config/mysql');

var storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'public/upload/');
  },
  filename: function(req, file, cb){
    cb(null, file.fieldname + Math.ceil((Math.random()*100000+1)).toString() +'.jpg' );
  }
});
var upload = multer({storage: storage});
//자전거 공기 주입기 위치 나타내는 지도
router.get('/bicycleMap', function(req, res, next){

    res.render('bicycleMap');
});

/* GET 다음 지도 즐겨찾기 기능(mark사용)*/
router.get('/bookmark', function(req, res, next){
  //TODO : HTML에 navbar 추가 및 navbar 필요 데이터 넘기기
  let auth = req.isAuthenticated();
  let user = { 'HASROOM': false };
  if (auth) {
    user = req.user[0];
  }
  res.render('mapmark',{'title':'Express', 'auth':auth, 'user':user});
});

/* POST 다음 지도 즐겨찾기 저장*/
router.post('/bookmark', upload.single('image'), function(req, res, next){
    //req.body.comment 코멘트
    //req.file 이미지
    //console.log(req.body);
    //console.log(req.file);
    
    try{
      if(req.body.LAT == undefined ||req.body.LNG == undefined){
        throw new Error('즐겨찾기 저장 에러(lat, lng 부재)');
      } 
      mysql.query('insert into sac_mapbookmark_tb (LAT, LNG, FILENAME, COMMENT, MEMBERID) values(?,?,?,?,?)',
                   [req.body.LAT, req.body.LNG, req.file.filename ,req.sanitizeBody('comment').escape(), req.user[0].MEMBERID]);
      res.json({'result' : true, 'FILENAME':req.file.filename, 'COMMENT':req.sanitizeBody('comment').escape()});
    }catch(err){
      console.log(err);
      res.json({'result' : false});
    }
    
});

/* PUT 다음 지도 즐겨찾기 수정 */
router.put('/bookmark', upload.single('image'), function(req, res, next){
   //console.log(req.body);
   //console.log(req.file);

    try{
      if(req.body.LAT == undefined ||req.body.LNG == undefined){
       throw new Error('즐겨찾기 수정(lat, lng 부재)');
      }
      //사진 수정 없을시
      if(req.file == undefined){
        mysql.query('update sac_mapbookmark_tb set COMMENT = ? where LAT = ? and LNG = ? and MEMBERID = ?',
                    [req.sanitizeBody('comment').escape(), req.body.LAT, req.body.LNG, req.user[0].MEMBERID]);
        res.json({'result' : true, 'FILENAME':req.body.imagename, 'COMMENT':req.sanitizeBody('comment').escape()});
      }
      //사진도 수정시
      else{
        mysql.query('update sac_mapbookmark_tb set FILENAME = ?, COMMENT = ? where LAT = ? and LNG = ? and MEMBERID = ?',
                    [req.file.filename, req.sanitizeBody('comment').escape(), req.body.LAT, req.body.LNG, req.user[0].MEMBERID]);
        res.json({'result' : true, 'FILENAME':req.file.filename, 'COMMENT':req.sanitizeBody('comment').escape()});
      }

    }
    catch(err){
        console.log(err);
        res.json({'result' : false, 'msg' : '수정 중 에러 발생!\n 재시도 바랍니다.'});
    }
});
/* DELETE 다음 지도 즐겨찾기 삭제 */
router.delete('/bookmark',function(req, res, next){

    try{
      if(req.query.LAT == undefined ||req.query.LNG == undefined){
        throw Error('즐겨찾기 삭제(lat, lng 부재)');
      }
      mysql.query('delete from sac_mapbookmark_tb where LAT = ? and LNG = ? and MEMBERID = ?',
                  [req.query.LAT, req.query.LNG, req.user[0].MEMBERID]);
      res.json({'result' : true});
    }
    catch(err){
      console.log(err);
      res.json({'result' : false, 'msg' : '삭제 중 에러 발생!\n 재시도 바랍니다.'});
    }
});
//getJSON 즐겨찾기 데이터 전송
router.get('/bookmark/:id/data', function(req, res, next){
    try{
      mysql.query('select * from sac_mapbookmark_tb where MEMBERID = ?',[req.params.id],function(err, results, fields){
          
          if(results){
            res.send(results);
          }
          else{ 
            res.send(null);
          }
      });
    }catch(err){
      console.log(err);
    }
});
//injection 테스트
router.get('/test', function(req, res, next){
  console.log(req.query.q);
  console.log(mysql.escape(req.query.q));
  console.log(req.sanitize('q').escape());
  res.send(req.query.q);/*
  mysql.query('select * from member where memberid=? and password=1234 ',[req.body.q],function(err, results, fields){
    if(err){
      console.log(err);
    }
    if(results){
      console.log(results);
      res.send(results);
    }
  });*/
});

module.exports = router;