require('babel-register')({
  presets: ['react']
});
var express = require('express');
var path = require('path');
var fs = require('fs');
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var Component = require('../src/components/Component.jsx');

var app = express();


/////////////////////////////
// WEB
/////////////////////////////

app.use('/static', express.static(path.join(__dirname, '../client/')))
app.use(express.static('public'));

app.get('/', function (req, res) {
    var html = ReactDOMServer.renderToString(
      React.createElement(Component)
    )
    res.send(html);
   //res.sendFile(path.join(__dirname, '../client/index.htm'));
})



/////////////////////////////
// SPARK APIS
////////////////////////////

app.get('/volunteer/volunteers', function (req, res) {

   search_string = req.query.search_string
   departments = req.query.departments
   role = req.query.role
   got_ticket = req.query.got_ticket

   console.log(req.path)

   readJSONFile(path.join(__dirname, '/json_stubs/get_volunteer_volunteers.json'), function(err, data) {
      if(err) {
         console.log(err)
         res.status(404).send('Not found');
      } else {
         res.send(data);
      }   
      res.end();
  }); 
})

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

var server = app.listen(8080, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Listening at http://%s:%s", host, port)

})