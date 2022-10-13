const express = require('express');
const router = express.Router();
const db = require("../../lib/db");
global.crypto = require('crypto')

module.exports = function (passport) {

    router.get("/welcome", (req, res) => {
        console.log(" req.user  : ", req.user);
        res.render("passport/welcome", { user: req.user });
    })


    //로그인 페이지
    router.get("/login", (req, res) => {
        const fmsg = req.flash();
        let error, success = "";
        if (fmsg.error) error = fmsg.error[0];
        if (fmsg.success) success = fmsg.success[0];

        res.render("passport/login", { error: error, success: success })
    });


    // 로그인 처리 - 1) 성공 및 실패 페이지 설정 및 flash 사용여부 설정하기
    router.post('/login_process', passport.authenticate('local', {
        successRedirect: '/passport/welcome',
        failureRedirect: '/passport/login',
        failureFlash: true,
        successFlash: true
    }));





    //1.페이스북그인 처리 - 로그인 버튼 클릭시
    router.get('/login/federated/facebook', passport.authenticate('facebook', { scope: 'email' }));


    //2.페이스북그인  처리 - 콜백 반환
    router.get('/oauth2/redirect/facebook', passport.authenticate('facebook', {
        successRedirect: '/passport/welcome',
        failureRedirect: '/passport/login',
        failureFlash: true,
        successFlash: true
    }));



    //로그 아웃 처리
    router.get('/logout', function (req, res, next) {
        req.logout(function (err) {
            if (err) { return next(err); }
            req.session.destroy(function (err) {
                res.redirect("/passport/welcome");
            });
        });
    });


    //회원가입페이지
    router.get('/signup', function (req, res, next) {
        const fmsg = req.flash();
        let error, success = "";
        if (fmsg.error) error = fmsg.error[0];
        if (fmsg.success) success = fmsg.success[0];

        res.render("passport/register", { error: error, success: success });
    });


    //회원가입처리
    router.post('/signup_process', function (req, res, next) {

        if (req.body.password !== req.body.pw2) {
            req.flash("error", "비밀번호가 일치 하지 않습니다.");
            return res.redirect("/passport/signup");
        }
        crypto.randomBytes(16, (error, buf) => {
            const salt = buf.toString("base64");

            crypto.pbkdf2(req.body.password.trim(), salt, 310000, 32, 'sha256', function (err, hashedPassword) {
                console.log("회원가입 데이터 : ", req.body.password, salt, hashedPassword.toString('hex'));

                if (err) { return next(err); }
                db.query('INSERT INTO users (username,email, hashed_password, salt) VALUES (?, ?, ?, ?)', [
                    req.body.username,
                    req.body.email,
                    hashedPassword.toString('hex'),
                    salt
                ], function (err, results, fields) {

                    if (err) {
                        req.flash("error", "이이 등록된  처리된 아이디 혹은 이메일 입니다.");
                        return res.redirect('/passport/signup');
                    }

                    var user = {
                        id: this.lastID,
                        username: req.body.username
                    };

                    console.log("등록한 insertId :", results.insertId);

                    req.login(user, function (err) {
                        if (err) { return next(err); }
                        req.flash("success", "회원가입을 축하합니다.");
                        res.redirect('/passport/login');
                    });


                });
            });

        });
    });



    return router;
}