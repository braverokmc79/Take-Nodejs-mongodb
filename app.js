const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const nunjucks = require('nunjucks');
const flash = require('connect-flash');

const dotenv = require("dotenv");
dotenv.config();

const mongodb = require("./lib/mongodb");


const app = express();

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);




//3. 몽고 MongoDBStore  설정
app.use(session({
  secret: '12312dajfj23rj2po4$#%@#',
  resave: false,
  saveUninitialized: true,
  store: new MongoDBStore({
    uri: 'mongodb://localhost:27017/take-ndoejs',
    collection: 'sessionStore'
  })
}));

console.log("* 몽고DB 연결 상태 :", mongodb.connections[0]._connectionString);


app.use(flash());
const passport = require("./lib/passport")(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

app.set('view engine', 'html'); // 확장자를 html 로도 사용이 가능함.
nunjucks.configure('views', { // views폴더가 넌적스파일  의 위치가 됨
  express: app,
  watch: true,
});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('3213e1da4523fa'));
app.use(express.static(path.join(__dirname, 'public')));
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const cookieRouter = require('./routes/cookies/index');
const sessionRouter = require('./routes/session/index');
const passportRouter = require('./routes/passport/index')(passport);


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/cookies', cookieRouter);
app.use('/session', sessionRouter);
app.use('/passport', passportRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
