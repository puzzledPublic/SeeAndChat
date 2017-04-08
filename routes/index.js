var express = require('express');
var fs = require('fs');
var multer = require('multer');

var storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'upload/');
  },
  filename: function(req, file, cb){
    cb(null, file.fieldname + (Math.random*1000+1).toString().slice(0,3) +'.jpg' );
  }
});
var upload = multer({storage: storage});
//var upload = multer({dest:'upload/'});
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let auth = req.isAuthenticated();
  res.render('index', { title: 'Express', auth: auth });
});
//글 목록 및 글 id 있는 경우 글 내용 출력
router.get(['/topic','/topic/:id'], function(req, res, next){
  var id = req.params.id;

  fs.readdir('./public/write',function(err, files){
      if(err){
        res.status(500).send('Internal error');
      }
      if(id){
        fs.readFile('./public/write/'+id,'utf8',function(err, data){
          if(err){
            res.status(500).send('Internal error');
          }
            res.send(data);
        });
      }
      else{
        res.render('topic',{topics: files});
      }
  });
});
//글 내용 업로드 .txt
router.post('/topic',function(req, res, next){
  var title = req.body.title;
  var data = req.body.description;

  fs.writeFile('./public/write/'+title+'.txt', data, function(err){
    if(err){
      console.log(err);
      res.send('fail');
    }
    res.redirect('./topic');
  });
});
//파일 업로드
router.post('/upload', upload.single('uploadfile'),function(req, res){
  console.log(req.file);
  res.send('uploaded'+req.file.filename);
});
//파일 다운로드
router.get('/file/:filename', function(req, res, next){
  let filename = req.params.filename;

  res.download('./public/write/'+filename, function(err){
    if(err){
      console.log(err);
    }else{
      console.log('sent: ' + filename);
    }
  });
});

module.exports = router;
