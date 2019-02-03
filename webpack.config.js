const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const src = path.join(__dirname, 'src/client');
const build = path.join(__dirname, 'build/client');
const isProd = process.env.NODE_ENV === 'production';

// Shared configs
const tsLoader = {
  test: /\.tsx?$/,
  loader: [
    'babel-loader',
    'ts-loader',
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
  mode: isProd ? 'production' : 'development',
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
    new Dotenv(),
    new MiniCssExtractPlugin({ filename: 'style.css' }),
    new CopyWebpackPlugin([{
      from: path.join(src, 'images'),
      to: path.join(build, 'images'),
    }]),
  ],
};

