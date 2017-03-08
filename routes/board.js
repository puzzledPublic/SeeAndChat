var express = require('express');
var router = express();
var events = require('events');

router.get('/:id', function(req, res, next){
    if(req.params.id === '0' ){
        req.session.destroy();
        res.redirect('./1');
    }else{
      if(req.session.tank!= undefined){
          req.session.tank++;
      }else{
          var tank = 0;
          req.session.tank = tank;
      }
      res.render('board', {id: req.params.id, tank: req.session.tank} );
    }
});

module.exports = router;