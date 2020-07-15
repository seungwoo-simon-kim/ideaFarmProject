"use strict";

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const { MongoClient } = require("mongodb");

let DATABASE_NAME = "local_test";

let api = express.Router();
let db;
let conn;
let Users;
let Commute;
let Quotes;
let Notice;
let TODAY;
let INHOUR;
let INMIN;
let OUTHOUR;
let OUTMIN;
/* ms in a day */
const DAY_MS = 86400000;
/* default on work time and off work time */
const [ DEF_START, DEF_END ] = ['8-30', '18-00'];

/* Connect to MongoDB Atlas */
module.exports = async (app) => {
  app.set("json spaces", 2);
  app.use("/api", api);
  let url = "mongodb+srv://ksimon12:x8wWNS19!@cluster0.lpmr9.mongodb.net/local_test?retryWrites=true&w=majority";
  conn = await MongoClient.connect(url, { useUnifiedTopology: true });
  db = conn.db("local_test");
  Users = await db.collection("users");
  await db.createCollection("commute")
  Commute = await db.collection("commute");
  await db.createCollection("quotes");
  Quotes = await db.collection("quotes");
  await db.createCollection("notice");
  Notice = await db.collection("notice");
};

api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended : true }));
api.use(cors());


/* Reset DB for testing purposes. Add 3 users, each with 3 commute times */
api.get("/", async (req, res) => {
    // Users.deleteMany({ });
    // Commute.deleteMany({ });
    // Quotes.deleteMany({ });
    // let test_usr = {
    //     companyID: "0000001",
    //     nickname: "testusr1",
    //     email: "111@email.com",
    //     phoneNumber: "010-1111-0000",
    //     password: "test1",
    //     profileURL: "www.google.com"
    // }
    // await Users.insertOne( test_usr );
    // for (let j = 2; j < 10; j++) {
    //     let today = `2020-7-${j}`;
    //     let test_comm = {
    //         companyID: "0000001",
    //         date: today,
    //         onworkTime: DEF_START,
    //         offworkTime: DEF_END,
    //         holiday_yn: "N"
    //     }
    //     let test_quotes = {
    //         date: today,
    //         quote: "나의 죽음을 알리지 마라",
    //         person: "이순신"
    //     }
    //     await Commute.insertOne( test_comm );
    //     await Quotes.insertOne( test_quotes );
    // }
    res.json({ message: "API running..." });
});

/* Request -> companyID, password
 * Response -> true or false
 * 유저의 로그인 정보가 맞는지 확인한다 */
api.post("/login", async (req, res) => {
    let user_id = req.body.companyID;
    let user_pw = req.body.password;
    let user = await Users.findOne({ companyID: user_id });
    let response;
    /* if user doesn't exist, status code 404 Not Found */
    if (!user) response = "false";
    /* if password doesn't match, status code 401 Unauthorized */
    else if (user && user.password != user_pw) response = "false";
    /* otherwise, status code 200 OK */
    else response = "true";
    res.status(200).json({ result: response });
});

/* Request -> companyID
 * Response -> companyID, nickname, email, phoneNumber, profileURL
 * 유저의 정보를 나열한다 */
api.post("/user/getUserInfo", async (req, res) => {
    let user_id = req.body.companyID;
    let user = await Users.findOne({ companyID: user_id });
    if (!user) {
        res.status(404).json({ result: "false" });
    }  else {
        let { companyID, nickname, email, phoneNumber, profileURL } = user;
        res.status(200).json({ companyID, nickname, email, phoneNumber, profileURL });
    }
});

/* Request -> companyID (optional: date, getWeek)
 * Response -> companyID, date, onworkTime, offworkTime, holiday_yn
 * 해당 날짜에 출퇴근 기록 조회 */
api.post("/commute/getUserDateList", async (req, res) => {
    /* if only companyID is provided, then list all commute times of user */
    let query = { companyID: req.body.companyID };
    /* if only date is provided, then list commute time of that date */
    if (req.body.date) {
        query.date = req.body.date;
        /* with getWeek option, list all the commute times of the week of provided date */
        if (req.body.getWeek) {
            let req_date = new Date(req.body.date);
            /* Date of beginning of the week, sunday */
            let start = new Date(req_date - req_date.getDay() * DAY_MS); // .toISOString();
            /* dates from monday to friday */
            let week_arr = [];
            for (let i = 0; i < 5; i++) {
                start.setDate(start.getDate() + 1);
                week_arr.push(`${start.getFullYear()}-${start.getMonth() - (- 1)}-${start.getDate()}`);
            }
            /* get all dates within the week array */
            query.date = { $in: week_arr };
        }
    }
    let list = await Commute.find(
        query, { projection: { _id: 0 } }
    ).map(comm => comm).toArray();
    let res_obj = { result: list };
    /* only get remaining time when getWeek is true */
    if (req.body.getWeek) {
        let remaining_mins = 2400;
        for (let day_obj of list) {
            let [ inHour, inMin ] = day_obj.onworkTime.split('-').map(Number);
            let [ outHour, outMin ] = day_obj.offworkTime.split('-').map(Number);
            let total_mins = (outHour * 60 + outMin) - (inHour * 60 + inMin) - 90;
            remaining_mins -= total_mins;
        }
        res_obj.remaining = `${Math.floor(remaining_mins / 60)}시간 ${remaining_mins % 60}분`;
    }
    res.status(200).json( res_obj );
});

api.use("/commute", async (req, res, next) => {
    /* reset if new day */
    if (req.path == "/setOnWork") {
        [ INHOUR, INMIN ] = [ req.body.hour, req.body.minute ].map(Number);
        TODAY = req.body.date;
    }
    if (req.path == "/setOffWork") {
        [ OUTHOUR, OUTMIN ] = [req.body.hour, req.body.minute ].map(Number);
    }
    let total_mins = (OUTHOUR * 60 + OUTMIN) - (INHOUR * 60 + INMIN) - 90;
    res.locals.total = `${Math.floor(total_mins / 60)}시간 ${total_mins % 60}분`;
    next();
});


/* Request -> companyID, date, hour, min
 * Response -> true
 * 유저의 출근 시간 기록 */
api.post("/commute/setOnWork", async (req, res) => {
    await Commute.findOneAndUpdate(
        { companyID: req.body.companyID, date: req.body.date },
        {
            $set: { onworkTime: `${INHOUR}-${INMIN}`, holiday_yn: "N", clockedIn: new Date(), total: res.locals.total },
            $setOnInsert: { offworkTime: DEF_END }
        },
        { upsert: true }
    );
    res.status(200).json({ result: "true" });
});

/* Request -> companyID, date, hour, min
 * Response -> true
 * 유저의 퇴근 시간 기록 */
api.post("/commute/setOffWork", async (req, res) => {
    await Commute.findOneAndUpdate(
        { companyID: req.body.companyID, date: req.body.date },
        {
            $set: {
                offworkTime: `${OUTHOUR}-${OUTMIN}`,
                clockedOut: new Date(),
                total: res.locals.total
            },
            $setOnInsert: { onworkTime: DEF_START }
        },
        { upsert: true }
    );
    res.status(200).json({ result: "true" });
});


/* Request -> companyID, date, holiday_yn (Y || N)
 * Result -> true
 * 해당 날짜에 유저 휴가 설정 */
api.post("/commute/setHoliday", async (req, res) => {
    let body = {
        holiday_yn: req.body.holiday_yn
    }
    if (req.body.holiday_yn == "Y") {
        body.onworkTime = DEF_START;
        body.offworkTime = DEF_END;
        body.total = "8시간 0분"
    }
    await Commute.findOneAndUpdate(
        { companyID: req.body.companyID, date: req.body.date },
        { $set: body },
        { upsert: true }
    );
    res.status(200).json({ result: "true" });
});

/* Request -> date
 * Response -> quote, person (empty if no quote defined for that date)
 * 해당 날짜의 명언 조회 */
api.post("/etc/getQuotes", async (req, res) => {
    let today_quote = await Quotes.findOne({ date: req.body.date });
    let ret_obj;
    if (!today_quote) ret_obj = {};
    else {
        let { quote, person } = today_quote;
        ret_obj = { quote, person };
    }
    res.status(200).json( ret_obj );
});

/* Request -> companyID, contents
 * Response -> true if insert successful, false otherwise
 * 유저 건의 사항 제출용 */
api.post("/etc/QnA", async (req, res) => {
    let inserted = await Notice.insertOne({ companyID: req.body.companyID, contents: req.body.contents, sysDate: new Date() });
    res.status(200).json({ result: inserted.acknowledged });
});

/* Catch-all route to return a JSON error if endpoint not defined
 * 메소드가 정의 돼 있지 않을 시 에러 */
api.all("/*", (req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.url}` });
});
