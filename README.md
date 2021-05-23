# ideaFarmProject - Backend

## Background - Idea Farm

Idea Farm is a department within [Hanwha Life Insurance](https://www.hanwhalife.com/static/company/english/EN_0000000_P10000.htm), South Korea's oldest and second largest life insurance company. Its primary objective is to develop new business ideas for the company appropos to the rapid changes that characterize our current society.

Modern problems require modern solutions - this is the motivating principle behind Idea Farm's methodology which sets it apart from any other department in the company. Distancing itself from the traditional image of Korean businesses -- hierarchial and old-fashioned -- Idea Farm prides itself in being free, open, and thereby innovative. For example, here are a few of many practices unique to the Idea Farm department: casual work attire, a free-seating policy, and (somewhat) flexible working hours. 

## The Problem

Currently, Idea Farm uses the good old pen and paer to record when employees arrive at work and leave. This is then manually recorded into an excel file, which is in turn used to calculate whether the employee has fulfilled her minimum weekly work time of 40 hours. Needless to say, this is tedious and prone to error. People often forget to record when they come into work or when they get off, which leads to disastrous consequences, such as, God forbid, having to work overtime on a Friday. Having worked until 7 p.m. one fine Friday evening in such a manner, I decided that something must be done about this system. 

## The Project

I collaborated with an employee who had experience developing Android applications to come up with a suitable solution. We devised an app that will track when employees come in or get off work. It offers other features such as notifying the user of when she can leave work on Friday, based on our calculations, an admin page that visualizes the MongoDB database, and a moderator page in which we can input quotes of the day to be shown to users. My co-worker did most of the front end, while I was responsible for the back end, the result of which being in `./api/index.js`

The `public` folder contains a quick REST API Tester that I created for, well, testing purposes. I did not update this after making significant changes to the api
upon receiving the required endpoints from my co-worker. Regardless, I realized Postman basically does just the testing that I needed.
