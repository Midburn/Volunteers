const request = require('request');

function GetUserAuth(token, res, callback) {
  request('http://127.0.0.1:5000/api/v1/auth?token=' + token, function (error, response, body) {

    if (error || response.statusCode != 200) {
      res.status(400).json({error: 'Unauthorized'});
    }
    else {
      callback(body);
    }
  });
}

exports.GetUserAuth = GetUserAuth;
