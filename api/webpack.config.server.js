const fs = require('fs')
const { resolve, join } = require('path')
const ExternalsPlugin = require('webpack-externals-plugin')

module.exports = {
  entry: resolve(__dirname, 'server'),

  output: {
    path: resolve(__dirname, 'dist'),
    filename: 'server.bundle.js',
  },

  target: 'node',

  node: {
    __filename: true,
    __dirname: true,
  },

  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
          ],
          plugins: [
            '@babel/plugin-proposal-function-bind'
          ]
        },
      },
    ],
  },
}
