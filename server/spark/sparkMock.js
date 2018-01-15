const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv");

const SECRET = process.env.SECRET;

const users = [
    {
        "email": "volunteer@gmail.com",
        "user_data": {
            "last_name": "superuser",
            "first_name": "superuser",
            "uid": "1",
            "email": "spark.superuser@midburn.org",
            "phone": "054112233555",
            "has_ticket": true
        }
    },
    {
        "email": "not.exists@gmail.com"
    }
];

const app = express();

app.use((req, res, next) => {
    const token = req.get('token');

    if (!token) {
        return res.status(401).json({error: 'unauthorized - no authorization header mentioned'});
    }

    if (token !== SECRET) {
        return res.status(401).json({error: 'bad token'});
    }

    next();
});

app.post("/volunteers/profiles", function (req, res) {
    res.json(users);
});


const server = app.listen(3000, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Spark mock listening at http://%s:%s", host, port);
});
