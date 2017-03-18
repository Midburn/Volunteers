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

app.use('/static', express.static(path.join(__dirname, '../public/')))
app.use(express.static('public'));

app.get('/', function (req, res) {
   res.sendFile(path.join(__dirname, '../src/index.html'));
})



/////////////////////////////
// SPARK APIS
/////////////////////////////

app.get('/volunteer/volunteers', function (req, res) {

   search_string = req.query.search_string
   departments = req.query.departments
   role = req.query.role
   got_ticket = req.query.got_ticket

   console.log(req.path)
   retrunStub(path.join(__dirname, '/json_stubs/get_volunteer_volunteers.json'),res);
})

app.get('/volunteer/departments', function (req, res) {
   console.log(req.path)
   retrunStub(path.join(__dirname, '/json_stubs/get_volunteer_departments.json'),res);
})

app.get('/volunteer/roles', function (req, res) {
   console.log(req.path)
   retrunStub(path.join(__dirname, '/json_stubs/get_volunteer_roles.json'),res);
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

// Set webpack-dev-server
// TODO: Check if debug environment when environments will be supported
if (true) {

  var config = require("../webpack.config.js");
  config.entry.unshift('react-hot-loader/patch', 'webpack-dev-server/client?http://localhost:9090/', 'webpack/hot/only-dev-server');
  var compiler = webpack(config);
  var server = new webpackDevServer(compiler, {
    contentBase: path.resolve(__dirname, '../public'),
    publicPath: '/',
    hot: true,
    stats: true
  });
  server.listen(9090);
}

var server = app.listen(8080, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Listening at http://%s:%s", host, port)

})
