const express = require('express')
const app = express()
const port = 5000
const mongodbURI = require('./mongodbURI')


const mongoose = require("mongoose");
// MongoDB 연결 1
// '단' 하나의 데이터베이스 연결 시 유효. 
mongoose.connect(
    mongodbURI,
    // MongoDB url
    // {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,
    //     useCreateIndex: true,
    //     useFindAndModify: false,

    // }
    // options
    // MongoDB 5 버전부터 useNewUrlParser 옵션을 사용해주지 않으면 에러가 뜹니다.

    //Mongoose 6 사용으로 에러 발생시.
    //useNewUrlParser, useUnifiedTopology,
    //useFindAndModify 및 useCreateIndex는 더 이상 지원되지 않는 옵션입니다.
    //Mongoose 6은 항상 useNewUrlParser, useUnifiedTopology 및 useCreateIndex가 true이고
    // useFindAndModify가 false인 것처럼 작동합니다.코드에서 이러한 옵션을 제거하십시오.
).then(() => console.log("MongoDB Connected...")).catch(err => console.error("에러 :", err));




app.get('/', (req, res) => {
    res.send('Hello World! 안녕하세요.')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
