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

var app = express();
app.use(bodyParser.json()); // for parsing application/json


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

app.get('/', servePage);
app.get('/volunteer-list-tab', servePage);
app.get('/bulk-add', servePage);
app.get('/shift-manager', servePage);

/////////////////////////////
// SPARK APIS
/////////////////////////////

app.get('/api/v1/volunteers/me', function (req, res) {
  console.log(req.path)
  retrunStub('get_volunteer_me', res); //TODO rename stub to get_volunteers_me
})

app.get('/api/v1/volunteers', function (req, res) {
  console.log(req.path);
  let volunteers = null;
  loadVolunteers((err, data) => {
    if (err) {
      res.status(404).send('Not found');
    } else {
      res.status(200).send(data);
    }
  });
});


app.get('/api/v1/departments/:departmentId/volunteers', function (req, res) {
  console.log('going to spark to get volunteers of department');





  //res.status(200).send('heelo vols');
  var options = {
    host: 'localhost',
    port: 3000,
    path: `/volunteers/department/${req.params.departmentId}/volunteers`
  };

  http.get(options, function (fromSpark) {
    console.log(fromSpark);
    fromSpark.setEncoding('utf8');
    let raw = '';
    fromSpark.on('data', (chunk) => raw += chunk);
    fromSpark.on('end', () => res.status(200).send(JSON.parse(raw)));
  }).on('error', (e) => {
    console.log(`Got error: ${e.message}`);
  });




  // const url = "http://localhost:3000";
  // axios.get(`{url}/volunteers/department/{departmentId}/volunteers`) //TODO sanitize and verify departmentId 
  //   .then((res) => res.status(200).send('cool eyal'))
  //   .catch((res) => console.log(res));

  // res.status(200).send('heelo vols');

});

app.delete('/api/v1/departments/:d/volunteers/:v', function (req, res) {
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
  console.log(req.path);
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


app.post('/api/v1/departments/:dId/volunteers/', function (req, res) {
  console.log('POST');
  console.log(req.path);
  console.log(`isarray:${req.body.isArray}`);
  console.log(req.body);
  let dId = req.params.dId;
  let role = req.body.role;
  let production = req.body.is_production === true;
  let emails = req.body.emails;

  res.status(200).send(req.body.emails.map(
    (email) => {
      return {
        email: email,
        status: "Success"
      };
    }
  ));

  // addVolunteers(role, production, emails, function (err, results) {
  //   res.status(err ? 404 : 200).send(results);
  // })
});

app.get('/api/v1/departments', function (req, res) {
  console.log(req.path);
  const host = 'localhost';

  http.get({
    host: host,
    path: '/volunteers/departments/',
    port: 3000
  }, function (responseFromSpark) {
    if (responseFromSpark.statusCode !== 200 || !/^application\/json/.test(responseFromSpark.headers['content-type'])) {
      responseFromSpark.resume();
      res.status(500).send('Internal Server Error. Connection to internal spark service has failed.');
      return;
    }

    responseFromSpark.setEncoding('utf8');
    let raw = '';
    responseFromSpark.on('data', (chunk) => raw += chunk);
    responseFromSpark.on('end', () => {
      const sparkResponse = JSON.parse(raw);
      res.status(200).send(sparkResponse);
    }).on('error', (error) => {
      console.log(error);
      res.status(500).send(`Internal Server Error 2352. ${error.message}`);

    });
  });
  // console.log(req.path)
  // retrunStub('get_volunteer_departments', res);
})

app.get('/api/v1/roles', function (req, res) {
  console.log(req.path)
  retrunStub('get_volunteer_roles', res);
})

// app.get('/api/v1/departments/:department/teams', function (req, res) {
//   console.log(req.path)
//   retrunStub(path.join(__dirname, '/json_stubs/get_department_teams.json'), res);
// })


function addVolunteers(role, is_production, emails, callback) {
  FilterMalformedEmails(emails, (formatChecked) =>
    FilterExistingAssociation(departmentId, formatChecked, (associationChecked) =>
      callback(associationChecked)
      //FilterNonExistingEmails(associationChecked, (associations) =>
      //saveRelevantAssociations(association, callback)
      //)
      //)
    ));
}

function FilterMalformedEmails(emails, callback) {
  callback(null, emails.map((email) => {
    return {
      email: email
    };
  }));
}

function FilterExistingAssociation(departmentId, structuredEmails, callback) {
  loadAssociations((associations) => {
    callback(
      structuredEmails.map((stucturedEmail) => {
        if (structuredEmail.failure) return structuredEmail;
        else {
          let dupAssociation = associations.find((singleAssociation) => singleAssociation.department_id === departmentId && singleAssociation.email === structuredEmail.email);
          if (dupAssociation) {
            dupAssociation.failure = true;
            dupAssociation.comment = "A user with this email already associated with this department";
            return dupAssociation;
          } else return sturcturedEmail;
        }
      })
    );
  });
}



/////////////////////////////
// STUBS
/////////////////////////////

function isMatch(volunteer, department_id, profile_id) {
  return volunteer.department_id === department_id && volunteer.profile_id === profile_id;
}

//the folowwing should be used since in a few cycles associations would be kept apart from the volunteer cache which dependss on the spark service
function loadAssociations(callback) {
  loadVolunteers((volunteers) => callback(volunteers.map((loaded) => {
    return {
      profile_id: loaded.profile_id,
      role: loaded.role,
      email: loaded.email,
      is_production: loaded.is_production,
      department_id: loaded.department_id
    };
  })));
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
}

app.use(express.static('public'));


const server = app.listen(config.port, function () {
  const host = server.address().address
  const port = server.address().port
  console.log("Listening at http://%s:%s", host, port)
})