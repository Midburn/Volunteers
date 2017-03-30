const express = require('express');
const path = require('path');
const fs = require('fs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');

var app = express();


/////////////////////////////
// WEB
/////////////////////////////

app.use('/static', express.static(path.join(__dirname, '../public/')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../src/index.html'));
});



/////////////////////////////
// SPARK APIS
/////////////////////////////

app.get('/api/v1/volunteers/volunteers', function (req, res) {

  //  search_string = req.query.search_string
  //  departments = req.query.departments
  //  role = req.query.role
  //  got_ticket = req.query.got_ticket

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
          modified = req.params.role;
        }
        if (req.query.is_production) {
          modified.is_production = req.params.is_production === 'true';
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


app.get('/api/v1/departments', function (req, res) {
  console.log(req.path)
  retrunStub('get_volunteer_departments.json', res);
})

app.get('/api/v1/roles', function (req, res) {
  console.log(req.path)
  retrunStub('json_stubs/get_volunteer_roles', res);
})



/////////////////////////////
// STUBS
/////////////////////////////

function isMatch(volunteer, department_id, profile_id) {
  return volunteer.department_id === department_id && volunteer.profile_id === profile_id;
}

function loadVolunteers(callback) {
  readJSONFile(path.join(__dirname, '/json_modified/get_volunteer_volunteers.json'),
    function (err, data) {
      if (err) {
        readJSONFile(path.join(__dirname, '/json_stubs/get_volunteer_volunteers.json'), callback);
      } else callback(null, data);
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

// Set webpack-dev-server
// TODO: Check if debug environment when environments will be supported
const devMode = (process.env.NODE_ENV !== 'production');

if (devMode) {
  var config = require("../webpack.config.js");
  config.entry.unshift('react-hot-loader/patch', 'webpack-dev-server/client?http://localhost:9090', 'webpack/hot/dev-server');
  var compiler = webpack(config);
  var server = new webpackDevServer(compiler, {
    contentBase: path.resolve(__dirname, '../public'),
    publicPath: '/',
    hot: true,
    stats: true
  });
  server.listen(9090);
  app.get('/bundle.js', (req, res) => res.redirect('http://localhost:9090/bundle.js'));
}

app.use(express.static('public'));

var server = app.listen(8080, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Listening at http://%s:%s", host, port)

});