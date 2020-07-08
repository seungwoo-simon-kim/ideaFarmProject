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
};

api.use(bodyParser.json());
api.use(cors());

/* Reset DB for testing purposes. Add 3 users, each with 3 commute times */
api.get("/", async (req, res) => {
    Users.deleteMany({ });
    Commute.deleteMany({ });
    for (let i = 0; i < 3; i++) {
        let test_usr = {
            companyID: `000000${i}`,
            nickname: `testusr${i}`,
            email: `${i}${i}${i}@email.com`,
            phoneNumber: `010-${i}${i}${i}${i}-0000`,
            password: `test${i}`
        }
        await Users.insertOne( test_usr );

        for (let j = 7; j < 10; j++) {
            let test_comm = {
                companyID: `000000${i}`,
                date: `2020-0${j}-0${j}`,
                onworkTime: "08-30",
                offworkTime: "19-20",
                holiday_yn: (i == 1 ? "Y" : "N")
            }
            await Commute.insertOne( test_comm );
        }
    }
    res.json({ message: "API running..." });
});

/* Request -> companyID, password
 * Response -> true or false
 * 유저의 로그인 정보가 맞는지 확인한다 */
api.post("/login", async (req, res) => {
    console.log(req.body);
    let user_id = req.body.companyID;
    let user_pw = req.body.password;
    let user = await Users.findOne({ companyID: user_id });
    let stat, response;
    /* if user doesn't exist, status code 404 Not Found */
    if (!user) [stat, response] = [404, "false"];
    /* if password doesn't match, status code 401 Unauthorized */
    else if (user && user.password != user_pw) [stat, response] = [401, "false"];
    /* otherwise, status code 200 OK */
    else [stat, response] = [200, "true"];
    res.status(stat).json({ result: response });
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

/* Middleware for using Commute collection
 * Sets companyID, date, currTime, and query */
api.use("/commute", async (req, res, next) => {
    res.locals.companyID = req.body.companyID;
    res.locals.date = req.body.date;
    res.locals.currTime = `${req.body.hour}-${req.body.min}`;

    let query = {
        companyID: req.body.companyID
    };
    if (req.body.date) query.date = req.body.date;
    res.locals.query = query;
    next();
});

/* Request -> companyID, date
 * Response -> companyID, date, onworkTime, offworkTime, holiday_yn
 * 해당 날짜에 출퇴근 기록 조회 */
api.post("/commute/getUserDateList", async (req, res) => {
    let list = await Commute.find(
        res.locals.query, { projection: { _id: 0 } }
    ).map(comm => comm).toArray();
    res.status(200).json( list );
});

/* Request -> companyID, date, hour, min
 * Response -> true
 * 유저의 출근 시간 기록 */
api.post("/commute/setOnWork", async (req, res) => {
    await Commute.findOneAndUpdate(
        { companyID: res.locals.companyID, date: res.locals.date },
        { $set: { onworkTime: res.locals.currTime, holiday_yn: "N" } },
        { upsert: true }
    );
    res.status(200).json({ result: "true" });
});

/* Request -> companyID, date, hour, min
 * Response -> true
 * 유저의 퇴근 시간 기록 */
api.post("/commute/setOffWork", async (req, res) => {
    await Commute.findOneAndUpdate(
        { companyID: res.locals.companyID, date: res.locals.date },
        { $set: { offworkTime: res.locals.currTime } },
        { upsert: true }
    );
    res.status(200).json({ result: "true" });
});

/* Catch-all route to return a JSON error if endpoint not defined
 * 메소드가 정의 돼 있지 않을 시 에러 */
api.all("/*", (req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.url}` });
});
