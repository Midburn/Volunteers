const {resolve} = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const BabiliPlugin = require('babili-webpack-plugin');

module.exports = {
  entry: [
    './src/index.js'
  ],
  output: {
    filename: 'bundle.js',
    path: resolve(__dirname, 'public'),
    publicPath: 'http://localhost:9090/'
  },
  externals: {
    react: 'React',
    lodash: '_',
    mobx: 'mobx',
    moment: 'moment',
    axios: 'axios',
    'react-dom': 'ReactDOM',
    'react-bootstrap': 'ReactBootstrap',
    'react-bootstrap-typeahead': 'ReactBootstrapTypeahead'
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.scss$/,
        use: [{
          loader: "style-loader" // creates style nodes from JS strings
        }, {
          loader: "css-loader" // translates CSS into CommonJS
        }, {
          loader: "sass-loader" // compiles Sass to CSS
        }]
      },
      {
        test: /\.(png|woff|woff2|otf|ttf|svg|eot)$/,
        use: ['url-loader']
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
//    new BundleAnalyzerPlugin(),
    new BabiliPlugin()
  ]
};
