var config = {};

config.environment = process.env.NODE_ENV || 'production' // [debug | production]

config.port = process.env.PORT || 8080

module.exports = config;
