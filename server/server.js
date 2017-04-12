const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
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
const devMode = (config.environment != 'production');

const SPARK_HOST = process.env.SPARK_HOST || 'http://localhost:3000'
const fetchSpark = (path, options) => axios(`${SPARK_HOST}${path}`, options).then(r => r.data)
const handleStandardRequest = handler => (req, res) => {
    console.log(`Requesting ${req.path}`);
    return handler(req, res).then(data => res.status(200).send(data)).catch(e => {
      console.log(e)
      res.status(500).send(devMode ? e.toString() : 'Internal server error');
    })
}

// ///////////////////////////
// Session
// ///////////////////////////
const sess = {secret: 'secret', cookie: {}};
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
  retrunStub('get_volunteer_me', res); //TODO rename stub to get_volunteers_me
})

function sendError(res)
{
    res.status(500).send('Internal Server Error. Problem reading from backend server. Wrong status code or content-type.')
}



app.get('/api/v1/volunteers', handleStandardRequest(req => fetchSpark('/volunteers/volunteers').then(data => (
      data.map(item => _.assign({profile_id: item.user_id, phone: item.phone_number, department: `TODO DEP ID${item.department_id}`, role: `TODO ROLE NAME ${item.role_id}`}, 
          _.pick(item, ['department_id', 'email', 'first_name', 'last_name', 'got_ticket', 'is_production', 'role_id']))
      )
    )))
)

app.get('/api/v1/departments', handleStandardRequest(() => fetchSpark('/volunteers/departments/').then(depts => depts.map(n => _.assign({name: n.name_en}, n)))))
app.get('/api/v1/roles', handleStandardRequest(() => fetchSpark('/volunteers/roles/')))
app.get('/api/v1/departments/:dId/volunteers', handleStandardRequest(({params}) => fetchSpark(`/volunteers/departments/${params.dId}/volunteers/`)))


app.post('/api/v1/departments/:dId/volunteers/', handleStandardRequest((req, res) => (
  fetchSpark(`/volunteers/departments/${req.params.dId}/volunteers`, {method: 'post', 
    body: req.body.emails.map(email => ({email, role_id: req.body.role, is_production: req.body.is_production}))
  })
)))

app.delete('/api/v1/departments/:d/volunteers/:v', function (req, res) {
  console.log(`DELETE ${req.path}`);
  console.log(`parameters: department:${req.params.d}, volunteer:${req.params.v}`);

  console.log(req.path)

  loadVolunteers(function (err, loaded) {
    if (err) {
      console.log(err);
      res.status(404).send('Not found');
    } else {
      let filtered = loaded.filter((volunteer) => !isMatch(volunteer, req.params.d, req.params.v));
      if (filtered.length !== loaded.length) {
        saveVolunteers(filtered, (err) => {
          if (!err) {
            res.status(200).send('Volunteer disassociated with department');
          } else {
            res.status(500).send('Internal server error');
          }
        });
      } else {
        res.statusCode = 404;
        res.send('Not found')
      }
    }
  });
});

app.put('/api/v1/departments/:d/volunteers/:v', function (req, res) {
  console.log(`PUT ${req.path}`);
  console.log(`EDIT ASSOCIATION path:${req.path}, department:${req.params.d}, volunteer:${req.params.v}`);
  loadVolunteers(function (err, volunteers) {
    let found = false;
    let modifiedVolunteers = volunteers.map((volunteer) => {
      if (isMatch(volunteer, req.params.d, req.params.v)) {
        found = true;
        let modified = volunteer;
        if (req.query.role) {
          modified.role = req.query.role;
        }
        if (req.query.is_production) {
          modified.is_production = req.query.is_production === 'true';
        }
        return modified;
      } else return volunteer;
    });

    if (found) {
      saveVolunteers(modifiedVolunteers,
        (err) => {
          if (!err) {
            res.status(200).send('Volunteer modified');
          } else {
            res.status(500).send('Internal server error');
          }
        });
    } else {
      res.status(400).send('Not Found');
    }
  });
});


/////////////////////////////
// STUBS
/////////////////////////////

function isMatch(volunteer, department_id, profile_id) {
  return volunteer.department_id === department_id && volunteer.profile_id === profile_id;
}

//the folowwing should be used since in a few cycles associations would be kept apart from the volunteer cache which dependss on the spark service
function loadAssociations(callback) {
  loadVolunteers(volunteers => callback(volunteers.map(v => _.pick(v, ['profile_id', 'role', 'email', 'is_production', 'department_id']))))
}

function loadVolunteers(callback) {
  readJSONFile(path.join(__dirname, '/json_modified/get_volunteer_volunteers.json'),
    function (err, data) {
      if (err) {
        readJSONFile(path.join(__dirname, '/json_stubs/get_volunteer_volunteers.json'), callback);
      } else {
        callback(null, data);
      }
    });
}

function saveVolunteers(json, callback) {
  fs.writeFile(path.join(__dirname, '/json_modified/get_volunteer_volunteers.json'),
    JSON.stringify(json),
    callback);
}

function retrunStub(filename, res) {
  let fullPath = path.join(__dirname, `/json_stubs/${filename}.json`);
  readJSONFile(fullPath, function (err, data) {
    if (err) {
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
    if (err) {
      callback(err);
      return;
    }
    try {
      callback(null, JSON.parse(data));
    } catch (exception) {
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