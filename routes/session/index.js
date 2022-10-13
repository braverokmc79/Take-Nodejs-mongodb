const express = require('express');
const router = express.Router();
const md5 = require('md5');
const sha256 = require('sha256');
const crypto = require('crypto');
const db = require('../../lib/db');


router.get('/count', function (req, res, next) {
    if (req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.render('session/count', { msg: req.session.count });
});

router.get('/tmp', function (req, res, next) {
    res.json("result : " + req.session.count);
})




// let user = [
//     {
//         username: 'egoing',
//         password: '50c1cc27d83110d7bf94dbd9b6f8d5a3b7a4e209fb0d98bc27efadc12ec7eed6f9af421a49dd25bc7700f8552dcdb35fdff57077d5074f74a60fcf60c258fdaa',
//         displayName: 'Egoing',
//         salt: "@#@#$SDA%#a213"
//     },
//     {
//         username: 'test1',
//         password: '079ec662a574122c1b10d91ab3be9ae4d9cc56e8bae1deadd3c7ee105195f027',
//         displayName: '홍길동',
//         salt: "#@fsa3%#@f5232"
//     },
// ]

router.get('/auth/login', function (req, res, next) {
    console.log("msg : ", req.session.msg);
    const msg = req.session.msg;
    delete req.session.msg;
    req.session.save(function () {
        res.render("session/login", { msg: msg });
    });

});
router.post('/auth/login', function (req, res, next) {
    const uname = req.body.username;
    const pwd = req.body.password;
    //password :1111

    db.query("SELECT *  FROM member WHERE username= ? ", [uname], function (err, results, fields) {
        if (err) return res.status(400).render("session/login", { error: err });

        if (results.length === 0) return res.status(400).render("session/login", { error: "등록된 아이디가 없습니다." });
        console.log("results[0] : ", results[0]);

        crypto.pbkdf2(pwd, results[0].salt, 100000, 64, 'sha512', (err, derivedKey) => {
            if (err) throw err;
            // Printing the derived key
            console.log(" derivedKey : ", derivedKey);
            //출력결과  <Buffer 50 c1 cc 27 d8 31 10 d7 bf 94 db d9 b6 f8 d5 a3 b7 a4 e2 09 fb 0d 98 bc 27 ef ad c1 2e c7 ee d6 f9 af 42 1a 49 dd 25 bc 77 00 f8 55 2d cd b3 5f df f5
            console.log("Key Derived: ", derivedKey.toString('hex'));
            //해싱함수를 hex 변환 출력 결과 => 50c1cc27d83110d7bf94dbd9b6f8d5a3b7a4e209fb0d98bc27efadc12ec7eed6f9af421a49dd25bc7700f8552dcdb35fdff57077d5074f74a60fcf60c258fdaa

            if (uname === results[0].username && derivedKey.toString('hex') === results[0].password) {
                //세션 저장
                req.session.displayName = uname;
                req.session.save(function () {
                    res.redirect("/session/welcome");
                })
            } else {
                res.render("session/login", { error: "아이디 또는 비밀번호가 일치하지 않습니다." });
            }

        });
    })
})

//회원 가입
router.get('/auth/register', function (req, res, next) {
    res.render("session/register");
});


router.post('/auth/register', function (req, res, next) {
    const uname = req.body.username;
    const pwd = req.body.password;
    const pwd2 = req.body.pw2;

    if (pwd !== pwd2) {
        res.render("session/register", { error: "비밀번호와 비밀번호확인이  일치하지 않습니다." });
        return;
    }

    const salt = crypto.randomBytes(64).toString('base64');

    crypto.pbkdf2(pwd, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) throw err;
        console.log("저장할 데이터값:", uname, derivedKey.toString('hex'), salt);

        db.query("INSERT INTO member (username, password ,salt) VALUES (?,?,?) ", [uname, derivedKey.toString('hex'), salt],
            function (err, results, fields) {
                if (err) {
                    return res.status(400).render("session/login", { error: err });
                }
                req.session.msg = "회원 가입을 축하 합니다.";
                res.redirect("/session/auth/login");
            });
    });
});



router.get("/auth/logout", function (req, res, next) {
    delete req.session.displayName;
    req.session.save(function () {
        res.redirect("/session/welcome");
    })

});

router.get('/welcome', function (req, res, next) {
    res.render("session/welcome", { session: req.session });
});



module.exports = router;