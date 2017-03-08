var express = require('express');
var router = express.Router();

router.get('/:room', function(req, res, next) {
    res.render('videoView',{'room':req.params.room});
});

module.exports = router;