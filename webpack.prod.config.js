const {resolve} = require('path');
const webpack = require('webpack');

module.exports = {
  entry: ['babel-polyfill',
    './src/index.js'
  ],
  output: {
    filename: 'bundle.js',
    path: resolve(__dirname, 'public'),
    publicPath: 'http://localhost:9090/'
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
    new webpack.optimize.UglifyJsPlugin()
  ]
};
