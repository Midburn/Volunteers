const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

require('dotenv');

const app = express();
app.use(cookieParser());

app.use((req, res, next) => {

    if (req.path === '/volunteers') {
        return next();
    }

    const authHeader = req.get('Authorization');

    if (!authHeader) {
        return res.status(401).json({error: 'unauthorized'});
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({error: 'unauthorized'});
    }

    try {

        jwt.verify(token, 'secret');
        next();
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});

app.get('/volunteers', function (req, res) {
    const token = jwt.sign({email: 'shaytidhar@gmail.com', id: 1},
        'secret',
        {expiresIn: '3h'});

    res.redirect(`http://127.0.0.1:8080?token=${token}`);
});

app.get('/volunteers/:userId/roles', function (req, res) {
    res.json(
        [
            {
                "permission": 4,
                "department_id": 2
            },
            {
                "permission": 1,
                "department_id": 0
            }
        ]
    );
});


app.get('/volunteers/departments', function (req, res) {
    res.json([{"id": 1, "name_en": "Tech", "name_he": "טכנולוגיה"}, {
        "id": 2,
        "name_en": "Gate",
        "name_he": "שער"
    }, {"id": 3, "name_en": "Volunteers", "name_he": "מתנדבים"}]);
});

app.get('/volunteers/volunteers', function (req, res) {
    res.json([{
        "role_id": 0,
        "department_id": 1,
        "user_id": 1,
        "first_name": "superuser",
        "last_name": "superuser",
        "email": "spark.superuser@midburn.org",
        "phone_number": "054112233555",
        "got_ticket": true,
        "comment": null,
        "is_production": "Yes"
    }, {
        "role_id": 2,
        "department_id": 1,
        "user_id": 333,
        "first_name": "Jane",
        "last_name": "Doe",
        "email": "jane.doe@gmail.com",
        "phone_number": "054112233551",
        "got_ticket": true,
        "comment": null,
        "is_production": 0
    }]);
});

app.get('/volunteers/departments/:departmentId/volunteers', function (req, res) {

    const volunteers = req.params.departmentId === '1' ?
        [{
            "role_id": 0,
            "department_id": 1,
            "user_id": 1,
            "first_name": "superuser",
            "last_name": "superuser",
            "email": "spark.superuser@midburn.org",
            "phone_number": "054112233555",
            "got_ticket": true,
            "comment": null,
            "is_production": "Yes"
        }, {
            "role_id": 2,
            "department_id": 1,
            "user_id": 333,
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane.doe@gmail.com",
            "phone_number": "054112233551",
            "got_ticket": true,
            "comment": null,
            "is_production": 0
        }]
        : [];

    res.json(volunteers);
});

const server = app.listen(3000, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Spark mock listening at http://%s:%s", host, port)
});
