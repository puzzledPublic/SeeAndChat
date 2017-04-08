//mysql 사용하려면 require('./config/mysql'); 해서 사용
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
});
connection.connect(function(err){
    if(err){
        throw err;
    }
});

module.exports = connection;
