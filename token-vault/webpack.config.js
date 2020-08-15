const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const uglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

module.exports = {
  devtool: 'cheap-source-map',
  devServer: {
    disableHostCheck: true,
    historyApiFallback: true,
    watchOptions: { aggregateTimeout: 300, poll: 1000 },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization'
    }
  },
  entry: [
    path.resolve(__dirname, 'app/main.js'),
    path.resolve(__dirname, 'app/stylesheets/main.scss')
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: './dist.js'
  },
  externals: {
    'filesafe-js': 'filesafe-js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        include: path.resolve(__dirname, 'app'),
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            { loader: 'sass-loader', query: { sourceMap: false } }
          ],
          publicPath: '../'
        })
      },
      {
        test: /\.js[x]?$/,
        include: [
          path.resolve(__dirname, 'app'),
          path.resolve(__dirname, 'node_modules/sn-components-api/dist/dist.js')
        ],
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      stylekit: path.join(
        __dirname,
        'node_modules/sn-stylekit/dist/stylekit.css'
      )
    }
  },
  plugins: [
    new ExtractTextPlugin({
      filename: './dist.css',
      disable: false,
      allChunks: true
    }),
    new uglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new CopyWebpackPlugin([{ from: './app/index.html', to: 'index.html' }])
  ]
};
