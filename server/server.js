const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const React = require('react');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const webpackConfig = require("../webpack.config.js");
const http = require('http');
const axios = require('axios');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const compression = require('compression');

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
app.use((req, res, next) => {

    if (req.path === '/login') {
        return next();
    }

    const token = req.cookies && req.cookies[JWT_KEY];

    if (!token) {
        return res.redirect(SPARK_HOST);
    }

    try {
        const userDetails = jwt.verify(token, SECRET);
        req.token = token;
        req.userDetails = userDetails;

        next();
    }
    catch (err) {
        console.log(err);
        res.clearCookie(JWT_KEY);
        return res.redirect(SPARK_HOST);
    }
});

app.use((err, req, res, next) => {
    console.log(err);
    return res.status(500).json({error: err});
});


/////////////////////////////
// APIS
/////////////////////////////
app.use('/api/v1', require('./routes/spark'));
app.use('/api/v1', require('./routes/shifts'));

app.use('/login', (req, res) => {

    let token = req.query.token;
    if (!token && devMode && process.env.LOCAL_SPARK === 'true') {
        token = jwt.sign({
            "id": 1,
            "email": "user@midburn.org",
            "iat": (new Date() / 1000) + 24*60*60,
            "exp": (new Date() / 1000) + 24*60*60
        }, process.env.SECRET);
    }

    if (!token) {
        res.status(401).json({error: 'No token was given'});
    }

    res.clearCookie(JWT_KEY);

    try {
        jwt.verify(token, SECRET);
        res.cookie(JWT_KEY, token);
        res.redirect('/');
    }
    catch (err) {
        console.log(err);
        res.status(500).json({error: 'Invalid token'});
    }
});

/////////////////////////////
// WEB
/////////////////////////////
app.use('/static', express.static(path.join(__dirname, '../public/')));

function servePage(req, res) {
    res.sendFile(path.join(__dirname, '../src/index.html'));
}

app.use(express.static('public'));

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/static/')) {
        next();
    } else {
        return servePage(req, res);
    }
});

////////////////////////////////////////////
// Dev Mode (webpack-dev-server, spark mock
////////////////////////////////////////////
if (devMode) {

    webpackConfig.entry.unshift('react-hot-loader/patch', 'webpack-dev-server/client?http://localhost:9090', 'webpack/hot/dev-server');
    const compiler = webpack(webpackConfig);
    const server = new webpackDevServer(compiler, {
        contentBase: path.resolve(__dirname, '../public'),
        publicPath: '/',
        hot: true,
        stats: true
    });
    server.listen(9090);
    app.get('/static/bundle.js', (req, res) => res.redirect('http://localhost:9090/bundle.js'));

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
    console.log("Listening at http://%s:%s", host, port)
});
