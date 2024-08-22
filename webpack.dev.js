const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/client/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // تنظيف المجلد dist قبل إنشاء الملفات الجديدة
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], // تأكد من تكوين Babel بشكل صحيح
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader, 
          'css-loader', 
          'sass-loader'
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles.css', // تحديد اسم ملف CSS الناتج
    }),
    new HtmlWebpackPlugin({
      template: './src/client/views/index.html',
      filename: 'index.html', // تحديد اسم ملف HTML الناتج
    }),
  ],
  mode: 'production',
  devtool: 'source-map', // تحسين تجربة التصحيح
  resolve: {
    extensions: ['.js', '.json', '.scss'], // دعم امتدادات الملفات الأخرى
  },
};
