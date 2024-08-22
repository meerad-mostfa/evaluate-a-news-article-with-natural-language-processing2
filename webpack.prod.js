const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/client/index.js',
  mode: 'production',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // تنظيف مجلد الإخراج قبل الكتابة
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
          MiniCssExtractPlugin.loader, // استخدم MiniCssExtractPlugin بدلاً من style-loader
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/client/views/index.html',
      filename: 'index.html', // إزالة المسار "./" لأنه ليس ضروريًا
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css', // تحديد اسم ملف CSS الناتج
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
  devServer: {
    port: 3000,
    allowedHosts: 'all',
    static: {
      directory: path.join(__dirname, 'dist'), // تحديد مجلد static
    },
  },
  devtool: 'source-map', // تحسين تجربة التصحيح
  resolve: {
    extensions: ['.js', '.json', '.scss'], // دعم امتدادات الملفات الأخرى
  },
};
