const sparkInfoMigration = require("./schedule/sparkInfo");
const schedule = require("node-schedule");
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const React = require('react');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const webpackConfig = require("../webpack.config.js");
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const compression = require('compression');
const co = require('co');
const permissionsUtils = require('./utils/permissions');
const consts = require('./utils/consts');

// Load environment variables default values
require('dotenv').config();

const app = express();
app.use(cookieParser());
app.use(bodyParser.json()); // for parsing application/json
app.use(compression()); // compress all responses

const devMode = (process.env.ENVIRONMENT == 'debug');
const SPARK_HOST = process.env.SPARK_HOST;
const JWT_KEY = process.env.JWT_KEY;
const SECRET = process.env.SECRET;

/////////////////////////////
// WEB middleware
/////////////////////////////
app.use(co.wrap(function* (req, res, next) {
    if (req.path === '/api/v1/login' || req.path === '/api/v1/verifyCookie') {
        return next();
    }

    try {
        const token = req.cookies && req.cookies[JWT_KEY] && req.cookies[JWT_KEY].token;
        const userDetails = jwt.verify(token, SECRET);
        req.token = token;
        req.userDetails = userDetails;
        req.userDetails.permissions = yield permissionsUtils.getPermissions(userDetails);
        let eventId = req.cookies[JWT_KEY].currentEventId
        eventId = consts.SUPPORTED_EVENTS.includes(eventId) ? eventId : consts.DEFAULT_EVENT_ID;
        req.userDetails.eventId = eventId
        req.userDetails.anonymousAccess = false
        next();
    }
    catch (err) {
        if (req.path.startsWith('/api/v1/') && !req.path.startsWith('/api/v1/public/')) {
            console.log(err);
            res.clearCookie(JWT_KEY);
            return res.redirect(SPARK_HOST);
        } else {
            // TODO: (may) maybe read the default value from spark
            req.userDetails = { eventId: consts.DEFAULT_EVENT_ID, anonymousAccess: true }
            next();
        }
    }
}));

app.use((err, req, res, next) => {
    console.log(err);
    return res.status(500).json({error: err});
});

/////////////////////////////
// APIS
/////////////////////////////
app.use('/api/v1', require('./routes/events'));
app.use('/api/v1', require('./routes/shifts'));
app.use('/api/v1', require('./routes/departments'));
app.use('/api/v1', require('./routes/volunteers'));
app.use('/api/v1', require('./routes/volunteerRequests'));
app.use('/api/v1', require('./routes/permissions'));
app.use('/api/v1', require('./routes/departmentForms'));
app.use('/api/v1', require('./routes/reports'));

app.use('/api/v1/verifyCookie', (req, res) => {
    let token = req.cookies && req.cookies[JWT_KEY] && req.cookies[JWT_KEY].token;
    let eventId = req.cookies && req.cookies[JWT_KEY] && req.cookies[JWT_KEY].currentEventId;

    const errors = []
    if (!token) {
        errors.push('token is missing');
    } else {
        try {
            jwt.verify(token, SECRET);
        }
        catch (err) {
            errors.push('invalid token');
        }
    }
    if (!eventId) {
        errors.push('event is missing');
    } else if (!consts.SUPPORTED_EVENTS.includes(eventId)) {
        errors.push(`event id isn't supported - using ${consts.DEFAULT_EVENT_ID} instead`); 
    }

    res.json(errors);
})

app.use('/api/v1/login', (req, res) => {
    let token = req.query.token;
    if (!token && devMode && process.env.LOCAL_SPARK === 'true') {
        token = jwt.sign({
            "id": 1,
            "email": "user@midburn.org",
            "iat": (new Date() / 1000) + 24 * 60 * 60,
            "exp": (new Date() / 1000) + 24 * 60 * 60
        }, process.env.SECRET);
    }

    if (!token) {
        return res.status(401).json({error: 'No token was given'});
    }

    res.clearCookie(JWT_KEY);

    try {
        jwt.verify(token, SECRET);
        res.cookie(JWT_KEY, {token, currentEventId: consts.DEFAULT_EVENT_ID});
        return servePage(req, res);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({error: 'Invalid token'});
    }
}); 

/////////////////////////////
// WEB
/////////////////////////////
app.use('/public', express.static(path.join(__dirname, '../public/')));

function servePage(req, res) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
}

app.use(express.static('public'));

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/public/')) {
        next();
    } else {
        return servePage(req, res);
    }
});

////////////////////////////////////////////
// Dev Mode (webpack-dev-server, spark mock
////////////////////////////////////////////
if (devMode) {
    const compiler = webpack(webpackConfig);
    const server = new webpackDevServer(compiler, {
        hot: true,
        contentBase: path.join(__dirname, "..", "public"),
        compress: true,
        publicPath: "/",
        stats: false,
        proxy: {
            "/api": "http://localhost:8080",
            "/public": {
                target: "http://localhost:9090",
                pathRewrite: {"^/public": ""}
            },
            "/login": "http://localhost:8080/api/v1"
        },
        historyApiFallback: {
            rewrites: [
                {from: /^\/$/, to: '/index.html'}]
        }
    });
    server.listen(9090);

    if (process.env.LOCAL_SPARK === 'true') {
        require('./spark/sparkMock')
    }
}

/////////////////////////////
// Mongoose
/////////////////////////////
mongoose.connect(process.env.DB_URL);
mongoose.Promise = Promise;

/////////////////////////////
// Schedule
/////////////////////////////
schedule.scheduleJob("*/10 * * * *", sparkInfoMigration.migrateVolunteerRequestSparkInfo);
schedule.scheduleJob("*/10 * * * *", sparkInfoMigration.migrateVolunteerSparkInfo);
schedule.scheduleJob("*/15 * * * *", sparkInfoMigration.updateValidVolunteerRequestSparkInfo);
schedule.scheduleJob("*/15 * * * *", sparkInfoMigration.updateValidVolunteerSparkInfo);
schedule.scheduleJob("* */3 * * *", sparkInfoMigration.updateInvalidVolunteerRequestSparkInfo);
schedule.scheduleJob("* */3 * * *", sparkInfoMigration.updateInvalidVolunteerSparkInfo);

const server = app.listen(process.env.PORT, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Listening at http://%s:%s", host, port);
    if (devMode) {
        console.log(`For debug go to http://localhost:9090/login`);
    }
});
