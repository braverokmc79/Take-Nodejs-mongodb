const mysql = require('mysql');
// 비밀번호는 별도의 파일로 분리해서 버전관리에 포함시키지 않아야 합니다. 
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'opentutorials',
    password: '1111',
    database: 'opentutorials'
});

connection.connect();
console.log("connection.connect() ", connection);

connection.query('SELECT * FROM topic', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    console.log('The solution is :', results.length);
});

connection.end();