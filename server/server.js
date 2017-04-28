const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const React = require('react');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const webpackConfig = require("../webpack.config.js");
const authHelper = require('./authHelper.js');
const http = require('http');
const axios = require('axios');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// Load environment variables default values
require('dotenv').config();

const app = express();
app.use(cookieParser());
app.use(bodyParser.json()); // for parsing application/json

const devMode = (process.env.ENVIRONMENT == 'debug');

/////////////////////////////
// WEB middleware
/////////////////////////////
app.use((req, res, next) => {

    if (req.path === '/' && req.query.token) {
        res.clearCookie('jwt');
        res.cookie('jwt', req.query.token);
    }

    const token = req.cookies && req.cookies.jwt;

    if (!token) {
        return res.redirect(process.env.SPARK_HOST);
    }

    try {
        jwt.verify(token, 'secret');
        req.token = token;

        next();
    }
    catch (err) {
        console.log(err);
        res.clearCookie('jwt');
        return res.redirect(process.env.SPARK_HOST);
    }
});

app.use((err, req, res, next) => {
    console.log(err);
    return res.status(500).json({error: err});
});


/////////////////////////////
// APIS
/////////////////////////////
app.use(require('./routes/spark'));
app.use('/api/v1', require('./routes/shifts'));

/////////////////////////////
// WEB
/////////////////////////////
app.use('/static', express.static(path.join(__dirname, '../public/')));

function servePage(req, res) {
    res.sendFile(path.join(__dirname, '../src/index.html'));
}

app.use(express.static('public'));

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        next();
    } else {
        return servePage(req, res);
    }
});

/////////////////////////////
// webpack-dev-server
/////////////////////////////
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
    app.get('/bundle.js', (req, res) => res.redirect('http://localhost:9090/bundle.js'));
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
