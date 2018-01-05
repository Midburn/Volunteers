const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const webpackConfig = require("../webpack.config.js");
const path = require('path');

function init(app) {
  const compiler = webpack(webpackConfig);
  const server = new webpackDevServer(compiler, {
    contentBase: path.resolve(__dirname, '../public'),
    publicPath: '/',
    hot: true,
    stats: true
  })
  server.listen(9090);
  app.get('/bundle.js', (req, res) => res.redirect('http://localhost:9090/bundle.js'));
}

module.exports = {init}