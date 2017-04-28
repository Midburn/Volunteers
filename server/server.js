const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const React = require('react');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const webpackConfig = require("../webpack.config.js");
const authHelper = require('./authHelper.js');
const http = require('http');
const axios = require('axios');
const _ = require('lodash');
const SpartFacade = require('./spark/spark');
const mongoose = require('mongoose');

// Load environment variables default values
require('dotenv').config();

const app = express();
app.use(bodyParser.json()); // for parsing application/json

const devMode = (process.env.ENVIRONMENT == 'debug');
const SPARK_HOST = process.env.SPARK_HOST;
const spartFacade = new SpartFacade(SPARK_HOST);

const fetchSpark = (path, options) => axios(`${SPARK_HOST}${path}`, options).then(r => r.data);

const handleStandardRequest = handler => (req, res) => {
    console.log(`${req.method.toUpperCase()} ${req.path}`);
    return handler(req, res).then(data => res.status(200).send(data)).catch(e => {
        console.log(e)
        res.status(500).send(devMode ? e.toString() : 'Internal server error');
    })
};

// ///////////////////////////
// WEB middleware
// ///////////////////////////
app.use((err, req, res, next) => {
    console.log(err);
    return res.status(500).json({error: err});
});

app.use('/api/v1', require('./routes/shifts'));

/////////////////////////////
// WEB
/////////////////////////////

app.use('/static', express.static(path.join(__dirname, '../public/')));

function servePage(req, res) {
    res.sendFile(path.join(__dirname, '../src/index.html'));
}

/////////////////////////////
// SPARK APIS
/////////////////////////////

app.get('/api/v1/volunteers/me', function (req, res) {
    console.log(`GET ${req.path}`);
    res.status(200).send([{
        "permission": 4,
        "department_id": 2
    }, {
        "permission": 1,
        "department_id": 0
    }]);
});


//READ DEPARTMENTS
app.get('/api/v1/departments',
    handleStandardRequest(() =>
        spartFacade.departments()));

//READ ROLES
app.get('/api/v1/roles',
    handleStandardRequest(() =>
        spartFacade.roles()));

//READ ALL VOLUNTEERINGS - READ
app.get('/api/v1/volunteers', handleStandardRequest(() => spartFacade.volenteers()));

//READ ALL VOLUNTEERS IN SPECIFIC DEPARTMENT
app.get('/api/v1/departments/:dId/volunteers',
    handleStandardRequest(req =>
        spartFacade.volunteersByDepartment(req.params.dId)));

//POST MULTIPLE VOLUNTEERINGS - CREATE
app.post('/api/v1/departments/:dId/volunteers/', handleStandardRequest((req) =>
    spartFacade.addVolunteers(req.params.dId, req.body.emails.map(email => ({
        email,
        role_id: req.body.role,
        is_production: req.body.is_production
    })))));

//PUT SINGLE VOLUNTEERING - UPDATE
app.put('/api/v1/departments/:dId/volunteers/:uid',
    handleStandardRequest(req =>
        spartFacade.updateVolunteer(req.params.dId, req.params.uid, _.pick(req.body, ['role_id', 'is_production']))));

//DELETE SINGLUE VOLUNTEERING - REMOVE
app.delete('/api/v1/departments/:dId/volunteers/:uid',
    handleStandardRequest(req =>
        spartFacade.deleteVolunteer(req.params.dId, req.params.uid)));

const shiftsByDepartment = {}

const sanitizeShift = body => _.assign({volunteers: _.filter(body.volunteers, v => _.isString || _.isNumber)},
    _.pick(body, ['title', 'color', 'startDate', 'endDate']))

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

app.use(express.static('public'));


app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        next();
    } else {
        return servePage(req, res);
    }
});

/////////////////////////////
// Mongoose
/////////////////////////////
mongoose.connect(process.env.DB_URL);
mongoose.Promise = Promise;

const server = app.listen(process.env.PORT, function () {
    const host = server.address().address;
    const port = server.address().port;
    console.log("Listening at http://%s:%s", host, port)
})
