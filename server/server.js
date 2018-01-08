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

    if (req.path === '/api/v1/login') {
        return next();
    }

    const token = req.cookies && req.cookies[JWT_KEY] && req.cookies[JWT_KEY].token;
    if (!token) {
        return res.redirect(SPARK_HOST);
    }

    try {
        const userDetails = jwt.verify(token, SECRET);
        req.token = token;
        req.userDetails = userDetails;
        req.userDetails.permissions = yield permissionsUtils.getPermissions(userDetails);

        next();
    }
    catch (err) {
        console.log(err);
        res.clearCookie(JWT_KEY);
        return res.redirect(SPARK_HOST);
    }
}));


app.use((err, req, res, next) => {
    console.log(err);
    return res.status(500).json({error: err});
});


/////////////////////////////
// APIS
/////////////////////////////\
app.use('/api/v1', require('./routes/spark'));
app.use('/api/v1', require('./routes/shifts'));
app.use('/api/v1', require('./routes/departments'));
app.use('/api/v1', require('./routes/volunteers'));
app.use('/api/v1', require('./routes/volunteerRequests'));
app.use('/api/v1', require('./routes/permissions'));
app.use('/api/v1', require('./routes/departmentForms'));

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
        res.cookie(JWT_KEY, token);
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

const server = app.listen(process.env.PORT, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Listening at http://%s:%s", host, port);
    if (devMode) {
        console.log(`For debug go to http://localhot:9090/login`);
    }
});
