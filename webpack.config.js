const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: path.join(__dirname, "src", "game.ts"),
  watch: false,
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, "src", "assets"),
        to: "assets"
      }
    ]),
    new HTMLWebpackPlugin({
      template: "src/index.html",
      filename: "index.html"
    })
  ],
  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    filename: "bundle.js",
    chunkFilename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  devtool: "inline-source-map",
  devServer: {
    contentBase: path.join("./dist/"),
    historyApiFallback: true,
    inline: true,
    host: "0.0.0.0",
    port: 8080
  }
};
