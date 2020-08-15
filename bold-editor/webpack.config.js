const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  performance: {
    hints: false,
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    hot: false,
    inline: false,
    // disableHostCheck: true,
    allowedHosts: [
      '10.0.2.2',
    ],
  },
  devtool: 'cheap-source-map',
  entry: [
    path.resolve(__dirname, 'app/main.js'),
    path.resolve(__dirname, 'app/stylesheets/main.scss'),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: './app.min.js',
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
              publicPath: '../',
            },
          },
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.js[x]?$/,
        include: [
          path.resolve(__dirname, 'app'),
        ], 
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss'],
    alias: {
      stylekit: path.join(__dirname, 'node_modules/sn-stylekit/dist/stylekit.css'),
    },
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: './app.css'}),
    new CopyWebpackPlugin({
      patterns: [
        { from: './app/index.html', to: 'index.html' },
        { from: './node_modules/sn-editor-kit/dist/filesafe-js/EncryptionWorker.js', to: 'filesafe-js/EncryptionWorker.js' },
      ],
    }),
  ],
};
