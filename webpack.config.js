const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        exclude: /node_modules/, // don't transpile node_modules
        test: /\.js$/, // do transpile any files ending in .jsx
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [['@babel/plugin-transform-react-jsx', { pragma: 'h' }]],
            presets: [
              [
                '@babel/preset-env',
                {
                  shippedProposals: true,
                  modules: false,
                  useBuiltIns: 'usage',
                  comments: true,
                  targets: {
                    browsers: ['last 2 versions', 'safari > 8', 'not ie < 11']
                  }
                }
              ]
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', { loader: 'css-loader', options: { importLoaders: 1 } }, 'postcss-loader']
      }
    ]
  },
  plugins: [new HtmlWebpackPlugin({ template: './index.html' })]
};
