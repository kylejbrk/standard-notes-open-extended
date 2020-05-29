const webpack = require('webpack');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  devtool: 'cheap-source-map',
  entry: [
    path.resolve(__dirname, 'app/main.js'),
    path.resolve(__dirname, 'app/stylesheets/main.scss'),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: './dist.js'
  },
  devServer: {
    publicPath: "/",
    contentBase: "./dist",
    hot: true
  },
  module: {
    rules: [
      { 
        test: /\.css$/,
        include: path.resolve(__dirname, 'app'),
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          { 
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          },
          'css-loader',
          { 
            loader: 'sass-loader', 
            options: {
              sourceMap: false,
              sassOptions: {
                outputStyle: 'expanded'
              }
            }
          }
        ]
      },
      { 
        test: /\.js[x]?$/, 
        include: [
          path.resolve(__dirname, 'app'),
          path.resolve(__dirname, 'node_modules/sn-components-api/dist/dist.js')
        ],
        exclude: /node_modules/, loader: 'babel-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss'],
    alias: {
      stylekit: path.join(__dirname, 'node_modules/sn-stylekit/dist/stylekit.css')
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: './dist.css'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './app/index.html', to: 'index.html' }
      ]
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              warnings: false
            }
          }
        })
    ]
  }
};
