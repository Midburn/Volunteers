const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const authHelper = require('./authHelper.js');

var app = express();

// Session
// TODO: set cookie options, set other storage
const sess = {
  secret: 'secret',
  cookie: {}
};

app.use(session(sess));


/////////////////////////////
// WEB
/////////////////////////////

app.use('/static', express.static(path.join(__dirname, '../public/')))
app.use(express.static('public'));

app.get('/', function (req, res) {
  const token = req.query.token;
  authHelper.GetUserAuth(token, res, (userDetails) => {
    req.session.token = token;
    req.session.userDetails = userDetails;
    res.sendFile(path.join(__dirname, '../src/index.html'));
  });
})

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
// SPARK APIS
/////////////////////////////

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




// const express = require('express');
// // const session = require('express-session');
// const path = require('path');
// const fs = require('fs');
// const React = require('react');
// const ReactDOMServer = require('react-dom/server');
// const webpack = require('webpack');
// const webpackDevServer = require('webpack-dev-server');
// const authHelper = require('./authHelper.js');
//
// var app = express();
//
//
// /////////////////////////////
// // WEB Api's
// /////////////////////////////
//
// app.use('/static', express.static(path.join(__dirname, '../public/')))
// app.use(express.static('public'));
//
// app.get('/:token?', function (req, res) {
//   const token = req.query.token
//   // const session = req.session;
//   authHelper.GetUserAuth(token, res, () => {
//     // const userDetails = {token: token};
//     // userDetails.push(res.data);
//     // req.session.userDetails = userDetails;
//
//     res.sendFile(path.join(__dirname, '../src/index.html'));
//   });
// });
//
//
// /////////////////////////////
// // WEB middleware
// /////////////////////////////
// // function getUserFromSession(req, res, next) {
// //   const session = req.session;
// //   if (!session || !session.userDetails) {
// //     res.status(400).json({error: 'Unauthorized'});
// //   }
// //   else {
// //     req.user = session.userDetails;
// //     next();
// //   }
// // }
// //
// // app.use('/api', function(req, res, next) {
// //   const session = req.session;
// //   if (!session || !session.userDetails) {
// //     res.status(400).json({error: 'Unauthorized'});
// //   }
// //   else {
// //     req.user = session.userDetails;
// //     next();
// //   }
// // });
//
// /////////////////////////////
// // SPARK APIS
// /////////////////////////////
//
// app.get('/api/v1/volunteer/volunteers', function (req, res) {
//
//    search_string = req.query.search_string
//    departments = req.query.departments
//    role = req.query.role
//    got_ticket = req.query.got_ticket
//
//    console.log(req.path)
//    retrunStub(path.join(__dirname, '/json_stubs/get_volunteer_volunteers.json'),res);
// })
//
// app.get('/api/v1/volunteer/departments', function (req, res) {
//    console.log(req.path)
//    retrunStub(path.join(__dirname, '/json_stubs/get_volunteer_departments.json'),res);
// })
//
// app.get('/api/v1/volunteer/roles', function (req, res) {
//    console.log(req.path)
//    retrunStub(path.join(__dirname, '/json_stubs/get_volunteer_roles.json'),res);
// })
//
//
// /////////////////////////////
// // STUBS
// /////////////////////////////
//
// function retrunStub(filename, res) {
//   console.log(res);
//    readJSONFile(filename, function(
//          res.status(404).send('Not found');
//       } else {
//          res.send(data);
//       }
//       res.end();
//   });
// }
//
// function readJSONFile(filename, callback) {
//    fs.readFile(filename, function (err, data) {
//       if(err) {
//         callback(err);
//         return;
//       }
//       try {
//         callback(null, JSON.parse(data));
//       } catch(exception) {
//         callback(exception);
//       }
//    });
// }
//
// // Session
// // TODO: set cookie options, set other storage
// // const session = {
// //   secret: 'secret',
// //   cookie: {}
// // };
// //
// // app.use(session(session));
//
//
// // Set webpack-dev-server
// // TODO: Check if debug environment when environments will be supported
// if (true) {
//
//   var config = require("../webpack.config.js");
//   config.entry.unshift('react-hot-loader/patch', 'webpack-dev-server/client?http://localhost:9090/', 'webpack/hot/only-dev-server');
//   var compiler = webpack(config);
//   var server = new webpackDevServer(compiler, {
//     contentBase: path.resolve(__dirname, '../public'),
//     publicPath: '/',
//     hot: true,
//     stats: true
//   });
//   server.listen(9090);
// }
//
// var server = app.listen(8080, function () {
//    var host = server.address().address
//    var port = server.address().port
//    console.log("Listening at http://%s:%s", host, port)
//
// })
