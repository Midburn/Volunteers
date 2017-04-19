var config = {};

config.environment = process.env.NODE_ENV || 'debug' // [debug | production]

config.port = process.env.PORT || 8080

config.mongoUrl = 'mongodb://localhost/volunteers'

module.exports = config;
