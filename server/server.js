const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
//const fs = require('fs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const webpackConfig = require("../webpack.config.js");
const authHelper = require('./authHelper.js');
const config = require('../config.js');
const http = require('http');
const axios = require('axios')
const _ = require('lodash')

var app = express();
app.use(bodyParser.json()); // for parsing application/json

const devMode = (config.environment !== 'production');
const SPARK_HOST = process.env.SPARK_HOST || 'http://localhost:3000'

const fetchSpark = (path, options) => axios(`${SPARK_HOST}${path}`, options).then(r => r.data);

const handleStandardRequest = handler => (req, res) => {
  console.log(`${req.method.toUpperCase()} ${req.path}`);
  return handler(req, res).then(data => res.status(200).send(data)).catch(e => {
    console.log(e)
    res.status(500).send(devMode ? e.toString() : 'Internal server error');
  })
}

// ///////////////////////////
// Session
// ///////////////////////////
const sess = {
  secret: 'secret',
  cookie: {}
};
app.use(session(sess));

// ///////////////////////////
// WEB middleware
// ///////////////////////////

function getUserFromSession(req, res, next) {
  const session = req.session;
  if (!session || !session.userDetails) {
    res.status(400).json({
      error: 'Unauthorized'
    });
  } else {
    req.user = session.userDetails;
    next();
  }
}

app.use('/api', getUserFromSession);

/////////////////////////////
// WEB
/////////////////////////////

app.use('/static', express.static(path.join(__dirname, '../public/')));

function servePage(req, res) {
  const token = req.query.token;

  // TODO: when spark auth api will be deployed, check if production
  req.session.token = token;
  req.session.userDetails = {
    firstName: 'user'
  };
  res.sendFile(path.join(__dirname, '../src/index.html'));
  return;

  authHelper.GetUserAuth(token, res, (userDetails) => {
    req.session.token = token;
    req.session.userDetails = userDetails;
    res.sendFile(path.join(__dirname, '../src/index.html'));
  });
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
})

function sendError(res) {
  res.status(500).send('Internal Server Error. Problem reading from backend server. Wrong status code or content-type.')
}


//READ DEPARTMENTS
app.get('/api/v1/departments', handleStandardRequest(() => fetchSpark('/volunteers/departments/').then(depts => depts.map(n => _.assign({
  name: n.name_en
}, n)))));
//READ ROLES
app.get('/api/v1/roles', handleStandardRequest(() => fetchSpark('/volunteers/roles/')));



//READ ALL VOLUNTEERINGS - READ
app.get('/api/v1/volunteers', handleStandardRequest(req => fetchSpark('/volunteers/volunteers').then(data => (
  data.map(item => _.assign({
      profile_id: item.user_id,
      phone: item.phone_number,
    },
    _.pick(item, ['department_id', 'email', 'first_name', 'last_name', 'got_ticket', 'is_production', 'role_id'])))
))));

//READ ALL VOLUNTEERS IN SPECIFIC DEPARTMENT
app.get('/api/v1/departments/:dId/volunteers', handleStandardRequest( ({params}) => fetchSpark(`/volunteers/departments/${params.dId}/volunteers`).then(data => (
  data.map(item => _.assign({
      profile_id: item.user_id,
      phone: item.phone_number,
    },
    _.pick(item, ['department_id', 'email', 'first_name', 'last_name', 'got_ticket', 'is_production', 'role_id'])))
))));


//POST MULTIPLE VOLUNTEERINGS - CREATE
app.post('/api/v1/departments/:dId/volunteers/', handleStandardRequest((req, res) => (
  fetchSpark(`/volunteers/departments/${req.params.dId}/volunteers`, {
    method: 'post',
    body: req.body.emails.map(email => ({
      email,
      role_id: req.body.role,
      is_production: req.body.is_production
    }))
  })
)))

//PUT SINGLE VOLUNTEERING - UPDATE
app.put('/api/v1/departments/:d/volunteers/:v', function (req, res) {
  console.log(`PUT ${req.path}`);
  console.log(`EDIT ASSOCIATION path:${req.path}, department:${req.params.d}, volunteer:${req.params.v}`);
  res.status(200).send([{
    status: 'OK',
    profile_id: '0'
  }]);
});

//DELETE SINGLUE VOLUNTEERING - REMOVE
app.delete('/api/v1/departments/:dId/volunteers/:uid',
  handleStandardRequest( ({params}) =>
    fetchSpark(`/volunteers/departments/${params.dId}/volunteers/${params.uid}/`, {
      method: 'delete'
    }).then(data => _.pick(data, ['status']))));


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

const server = app.listen(config.port, function () {
  const host = server.address().address
  const port = server.address().port
  console.log("Listening at http://%s:%s", host, port)
})