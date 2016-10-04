'use strict';
const webpack = require('webpack');
const autoprefixer= require('autoprefixer');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: { main: './client/index.jsx' },
  output: { path: './client/www/', filename: '[name].js' },
  module: {
    loaders: [{
      test: /\.css$/,
      loader: 'style-loader!css-loader?modules!postcss-loader'
    },
    {
      test: /\.js(x)?$/,
      loader: 'babel',
      exclude: /(node_modules)/,
      query: {
        presets: ['react', 'es2015'],
        plugins: ['transform-object-rest-spread']
      }
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new CopyWebpackPlugin([
      {from: './node_modules/react-toggle/style.css', to: 'toggle.css'}
    ])
  ],
  postcss: [ autoprefixer({ remove: false, browsers: ['last 2 versions'] })]
};
