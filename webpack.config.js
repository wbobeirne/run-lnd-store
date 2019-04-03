const path = require('path');
const dotenv = require('dotenv');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

dotenv.config();

const src = path.join(__dirname, 'src/client');
const build = path.join(__dirname, 'build/client');

// Shared configs
const tsLoader = {
  test: /\.tsx?$/,
  loader: [
    'babel-loader',
    {
      loader: 'ts-loader',
      options: {
        configFile: path.join(src, 'tsconfig.json'),
      },
    },
  ],
};

const scssLoader = {
  test: /\.(s)?css$/,
  loader: [
    MiniCssExtractPlugin.loader,
    'css-loader',
    'sass-loader',
  ],
};

// Client config
module.exports = {
  name: 'client',
  target: 'web',
  entry: path.join(src, 'index.tsx'),
  output: {
    path: build,
    filename: 'script.js',
  },
  module: {
    rules: [tsLoader, scssLoader],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        SHIRT_COST: JSON.stringify(process.env.SHIRT_COST),
        CONTACT_TWITTER: JSON.stringify(process.env.CONTACT_TWITTER),
        CONTACT_EMAIL: JSON.stringify(process.env.CONTACT_EMAIL),
      },
    }),
    new MiniCssExtractPlugin({ filename: 'style.css' }),
    new CopyWebpackPlugin([{
      from: path.join(src, 'images'),
      to: path.join(build, 'images'),
    }]),
  ],
};

