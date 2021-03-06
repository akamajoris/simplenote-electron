const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = require('./get-config');
const spawnSync = require('child_process').spawnSync;
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

module.exports = {
  context: __dirname + '/lib',
  devtool: 'cheap-module-eval-source-map',
  entry: ['./boot'],
  output: {
    path: __dirname + '/dist',
    filename: 'app.js',
  },
  module: {
    rules: [
      {
        test: /lib\/.+\.jsx?$/,
        exclude: /node_modules|lib\/simperium/,
        enforce: 'pre',
        use: [
          {
            loader: 'eslint-loader',
            options: {
              cache: true,
              configFile: '.eslintrc.json',
              quiet: true,
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [autoprefixer()],
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: [__dirname + '/lib'],
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.scss', '.css'],
    modules: ['node_modules'],
  },
  plugins: [
    new webpack.DllReferencePlugin({
      context: process.cwd(),
      manifest: require(process.cwd() + '/dist/vendor.json'),
    }),
    new HardSourceWebpackPlugin(),
    new HtmlWebpackPlugin({
      'build-platform': process.platform,
      'build-reference': spawnSync('git', ['describe', '--always', '--dirty'])
        .stdout.toString('utf8')
        .replace('\n', ''),
      favicon: process.cwd() + '/public_html/favicon.ico',
      'node-version': process.version,
      template: 'index.ejs',
      title: 'Simplenote',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
      config: JSON.stringify(config()),
    }),
  ],
};
