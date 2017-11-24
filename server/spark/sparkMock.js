const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv");

const SECRET = process.env.SECRET;

const events = [
    {
        event_id: "1",
        name: "2017"
    }
];

const users = [
    {
        user_id: 17,
        first_name: "May",
        last_name: "Ben Arie",
        email: "may@gmail.com",
        phone_number: "0541234567",
        got_ticket: true,
        comment: "from Volunteers table"
    }
];

const app = express();

app.use((req, res, next) => {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
        return res.status(401).json({error: 'unauthorized - no authorization header mentioned'});
    }

    const token = authHeader.split('=')[1];

    if (!token) {
        return res.status(401).json({error: "unauthorized - no authorization mentioned"});
    }

    try {
        jwt.verify(token, SECRET);
        next();
    }
    catch (err) {
        return res.status(401).json({error: "unauthorized - illegal token"});
    }
});

app.get("/users", function (req, res) {
    res.json(users);
});

app.get("/events", function (req, res) {
    res.json(events);
});

const server = app.listen(3000, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Spark mock listening at http://%s:%s", host, port);
});
