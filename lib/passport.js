const passport = require("passport");
const crypto = require('crypto');
const db = require("./mongodb");
const LocalStrategy = require('passport-local');
const FacebookStrategy = require('passport-facebook');
const { User } = require("../models/User");
const { Oauth2 } = require("../models/Oauth2");


module.exports = function (app) {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function (user, cb) {
        console.log("로그인 처리시 최초 한번  passport.serializeUser 호출 user 값  :", user);
        process.nextTick(function () {
            //다음 내용을 세션에 저장
            cb(null, { id: user.id, eamil: user.email, username: user.username });
        });
    });

    // 로그인 성공되면 passport.deserializeUser  매번 실행 처리된다
    passport.deserializeUser(function (user, cb) {
        console.log("deserializeUser  :", user);
        process.nextTick(function () {
            return cb(null, user);
        });
    });


    // 로그인 처리 - 2) passport 로그인
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, function verify(email, password, cb) {


        User.findOne({ "email": email }, function (err, user) {
            if (err) { return cb(err); }
            if (!user) { return cb(null, false, { message: '등록된 데이터가 없습니다.' }); }

            if (!user.salt) return cb(null, false, { message: '소셜 로그인으로 등록된 유저입니다.' })
            console.log(" 유저 정보 : ", user);

            crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function (err, hashedPassword) {
                console.log("로그인 데이터 : ", password, user.salt, hashedPassword.toString('hex'));
                console.log("로그인 DB암호: ", user.password);

                if (err) { return cb(err); }
                if (user.password !== hashedPassword.toString('hex')) {
                    console.log("비밀번호 오류");
                    //flash 에 저장 처리됨  - "flash":{"error":["비밀번호가 일치하지 않습니다."]}}
                    return cb(null, false, { message: '비밀번호가 일치하지 않습니다.' });
                }


                return cb(null, user, { message: '로그인 성공' });
            });

        });

    }));



    //페이스북 로그인
    passport.use(new FacebookStrategy({
        clientID: process.env['FACEBOOK_CLIENT_ID'],
        clientSecret: process.env['FACEBOOK_CLIENT_SECRET'],
        callbackURL: '/passport/oauth2/redirect/facebook',
        state: true,
        profileFields: ['id', 'emails', 'name', 'displayName'],
    }, function verify(accessToken, refreshToken, profile, cb) {

        console.log(" 페이스북 로그인 ", profile);

        Oauth2.findOne({ "provider": "facebook", "subject": profile.id }, function (err, oauth2) {
            if (err) { return cb(err); }

            console.log(" oauth2 정보 : ", oauth2);
            if (!oauth2) {
                //1.oauth2 컬렉션에 등록되어 있지 않으면 신규등록처리

                //User 컬렉션에 존재하는지 확인
                User.findOne({ "email": profile.emails[0].value }, function (err, user) {
                    if (err) { return cb(err); }


                    if (user) {
                        //1) User 컬렉션에 등록된 이메일이 존재하면은 oauth2 컬렉션에 등록후 로그인 처리
                        const oauth2 = new Oauth2({ email: profile.emails[0].value, provider: "facebook", subject: profile.id });
                        oauth2.save((err, doc) => {
                            //구글 페이스북 등 여러 소셜에 대한
                            //user_id 중복 오류가 나올수 있다. 따라서,  에러 상관 없이 로그인 처리
                            return cb(null, user);
                        });


                    } else {
                        //2) User 컬렉션에 등록되어 있지 않다면 User 컬렉션에 등록처리 및  oauth2 컬렉션에 등록후 로그인 처리
                        const user = new User({ username: profile.displayName, email: profile.emails[0].value });
                        user.save((err, doc) => {
                            const oauth2 = new Oauth2({ email: profile.emails[0].value, provider: "facebook", subject: profile.id });
                            oauth2.save((err, doc) => {
                                if (err) { return cb(err); }
                                return cb(null, doc);
                            });
                        });
                    }
                });

            } else {
                //2.oauth2 컬렉션에 등록되어 있다면 바로 로그인처리
                User.findOne({ "email": profile.emails[0].value }, function (err, user) {
                    if (err) { return cb(err); }
                    if (!user) { return cb(null, false, { message: "로그인 실패" }); }
                    return cb(null, user);
                });
            }


        });



    }));




    return passport;
}