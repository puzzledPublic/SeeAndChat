var express = require('express');
var mysql = require('../config/mysql');
var router = express();

//게시판 출력
router.get('/:id', function (req, res, next) {
    //TODO :: id에 따른 게시판 출력
    let auth = req.isAuthenticated();
    let user = {
        'HASROOM': false
    };
    if (auth) {
        user = req.user[0];
    }

    mysql.query('select count(*) from sac_board_tb where BOARD_NAME = ?', [req.params.id], function (err, results, fields) {
        if (err) {
            console.log(err);
            res.status(500).send('Internal error ');
        }
        if (results) {
            //해당 게시판 총 게시물 수
            let contentCount = results[0]['count(*)'];
            //해당 게시판 총 페이지 (한 페이지당 15개 게시물)
            let totalPage = Math.ceil(contentCount / 15);
            //요청 페이지가 페이지 수를 넘어서면 맨 마지막 페이지 요청으로
            if (req.params.page) {
                if (req.params.page > totalPage) {
                    req.params.page = totalPage;
                }
            }else{
                req.params.page = 1;
            }
            //pagination을 위한 처음 페이지, 마지막페이지 숫자
            let startPage = Math.round((req.params.page - 1) / 5) * 5 + 1;
            let endPage = startPage + 5 - 1;
            if (endPage > totalPage) {
                endPage = totalPage;
            }
            //page 정보가 없으면 1
            let currentPage = req.params.page;
            //페이지 정보 객체
            let pageInfo = {'currentPage':currentPage, 'contentCount': contentCount, 'totalPage':totalPage, 'startPage':startPage,'endPage':endPage, 'boardName':req.params.id};
            //DB에서 가져올 게시물 시작번호
            let startNum = (currentPage - 1) * 15;
            //내용 가져오기
            mysql.query('select NO, BOARD_NAME, TITLE, DATE_FORMAT(POSTING_DATE, "%Y-%m-%d") as DATE, READ_COUNT, COMMENT_COUNT, MEMBERID from sac_board_tb where BOARD_NAME = ? order by POSTING_DATE desc limit ?, 15', [req.params.id, startNum], function (err, results, fields) {
                if (err){
                    console.log(err);
                    res.status(500).send('Internal error');
                }
                if (results){

                    res.render('board', {'auth':auth, 'user':user, 'list':results, 'pageInfo':pageInfo});
                }
            });
        }
    });
});
//게시물 쓰기
router.get('/:id/write',function(req, res, next){
    let auth = req.isAuthenticated();
    let user = {
        'HASROOM': false
    };
    if (auth) {
        user = req.user[0];
    }
    res.render('boardWrite',{'auth':auth, 'user':user});
});
router.get('/:id/write', function(req, res, next){
    //TODO:: 게시물 DB입력
});
module.exports = router;