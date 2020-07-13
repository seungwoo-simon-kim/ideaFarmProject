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
};

api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended : true }));
api.use(cors());


/* Reset DB for testing purposes. Add 3 users, each with 3 commute times */
api.get("/", async (req, res) => {
    Users.deleteMany({ });
    Commute.deleteMany({ });
    Quotes.deleteMany({ });
    let test_usr = {
        companyID: "0000001",
        nickname: "testusr1",
        email: "111@email.com",
        phoneNumber: "010-1111-0000",
        password: "test1"
    }
    await Users.insertOne( test_usr );
    for (let j = 2; j < 10; j++) {
        let today = `2020-07-0${j}`;
        let test_comm = {
            companyID: "0000001",
            date: today,
            onworkTime: "08-30",
            offworkTime: "18-00",
            holiday_yn: "N"
        }
        let test_quotes = {
            date: today,
            quote: "나의 죽음을 알리지 마라",
            person: "이순신"
        }
        await Commute.insertOne( test_comm );
        await Quotes.insertOne( test_quotes );
    }
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
 * Response -> companyID, nickname, email, phoneNumber
 * 유저의 정보를 나열한다 */
api.post("/user/getUserInfo", async (req, res) => {
    let user_id = req.body.companyID;
    let user = await Users.findOne({ companyID: user_id });
    if (!user) {
        res.status(404).json({ result: "false" });
    }  else {
        let { companyID, nickname, email, phoneNumber } = user;
        res.status(200).json({ companyID, nickname, email, phoneNumber });
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
            let [ year, month, date ] = req.body.date.split('-');
            let day = new Date(req.body.date).getDay() - 1;
            /* Sunday -> Monday, Saturday -> Friday */
            [date, day] = day < 0 ? [date - (- 1), day + 1] : day == 5 ? [date - 1, day - 1] : [date, day];
            let monday = `${year}-${month}-${(date - day <= 9 ? "0" : "") + (date - day)}`
            let friday = `${year}-${month}-${(date - (- 4) - day <= 9 ? "0" : "") + (date - (- 4) - day)}`
            query.date = { $gte: monday, $lte: friday };
        }
    }
    let list = await Commute.find(
        query, { projection: { _id: 0 } }
    ).map(comm => comm).toArray();
    if (!list.length) {
        res.status(404).json({ error: "유저가 없거나 해당 날짜에 기록이 존재하지 않습니다" });
        return;
    };
    /* sort in ascending order, earlier -> later */
    list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    res.status(200).json( list );
});

/* Request -> companyID, date, hour, min
 * Response -> true
 * 유저의 출근 시간 기록 */
api.post("/commute/setOnWork", async (req, res) => {
    await Commute.findOneAndUpdate(
        { companyID: req.body.companyID, date: req.body.date },
        {
            $set: { onworkTime: `${req.body.hour}-${req.body.minute}`, holiday_yn: "N", clockedIn: new Date() },
            $setOnInsert: { offworkTime: "18-30" }
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
            $set: { offworkTime: `${req.body.hour}-${req.body.minute}`, clockedOut: new Date() },
            $setOnInsert: { onworkTime: "08-30" }
        },
        { upsert: true }
    );
    res.status(200).json({ result: "true" });
});

/* Request -> date
 * Response -> quote, person
 * 해당 날짜의 명언 조회 */
api.post("/etc/getQuotes", async (req, res) => {
    let today_quote = await Quotes.findOne({ date: req.body.date });
    let { quote, person } = today_quote;
    res.status(200).json({ quote, person });
});

/* Catch-all route to return a JSON error if endpoint not defined
 * 메소드가 정의 돼 있지 않을 시 에러 */
api.all("/*", (req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.url}` });
});
