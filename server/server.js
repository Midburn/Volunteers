const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const webpackConfig = require("../webpack.config.js");
const authHelper = require('./authHelper.js');
const config = require('../config.js')

var app = express();

const devMode = (config.environment != 'production');

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
    res.status(400).json({error: 'Unauthorized'});
  }
  else {
    req.user = session.userDetails;
    next();
  }
}

app.use('/api', getUserFromSession);

/////////////////////////////
// WEB
/////////////////////////////

function servePage(req, res) {
  const token = req.query.token;

  // TODO: when spark auth api will be deployed, check if production
  req.session.token = token;
  req.session.userDetails = {firstName: 'user'};
  res.sendFile(path.join(__dirname, '../src/index.html'));
  return;

  authHelper.GetUserAuth(token, res, (userDetails) => {

    req.session.token = token;
    req.session.userDetails = userDetails;
    res.sendFile(path.join(__dirname, '../src/index.html'));
  });
}

app.get('/', servePage);
app.get('/volunteers-list', servePage);
app.get('/bulk-add', servePage);
app.get('/shift-manager', servePage);

/////////////////////////////
// SPARK APIS
/////////////////////////////

app.get('/api/v1/volunteer/me', function (req, res) {
   console.log(req.path)
   retrunStub(path.join(__dirname, '/json_stubs/get_volunteer_me.json'),res);
})

app.get('/api/v1/volunteer/volunteers', function (req, res) {

   search_string = req.query.search_string
   departments = req.query.departments
   role = req.query.role
   got_ticket = req.query.got_ticket

   console.log(req.path)
   retrunStub(path.join(__dirname, '/json_stubs/get_volunteer_volunteers.json'),res);
})

app.get('/api/v1/volunteer/departments', function (req, res) {
   console.log(req.path)
   retrunStub(path.join(__dirname, '/json_stubs/get_volunteer_departments.json'),res);
})

app.get('/api/v1/volunteer/roles', function (req, res) {
   console.log(req.path)
   retrunStub(path.join(__dirname, '/json_stubs/get_volunteer_roles.json'),res);
})

app.get('/api/v1/volunteer/department/:dept/volunteer_types', function (req, res) {
   console.log(req.path)
   retrunStub(path.join(__dirnpublicame, '/json_stubs/get_department_volunteer_types.json'),res);
})

app.get('/api/v1/volunteer/department/:department/teams', function (req, res) {
   console.log(req.path)
   retrunStub(path.join(__dirname, '/json_stubs/get_department_teams.json'),res);
})


/////////////////////////////
// STUBS
/////////////////////////////

function retrunStub(filename, res) {
   readJSONFile(filename, function(err, data) {
      if(err) {
         console.log(err)
         res.status(404).send('Not found');
      } else {
         res.send(data);
      }
      res.end();
  });
}

function readJSONFile(filename, callback) {
   fs.readFile(filename, function (err, data) {
      if(err) {
        callback(err);
        return;
      }
      try {
        callback(null, JSON.parse(data));
      } catch(exception) {
        callback(exception);
      }
   });
}

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

const server = app.listen(config.port, function () {
   const host = server.address().address
   const port = server.address().port
   console.log("Listening at http://%s:%s", host, port)
})
