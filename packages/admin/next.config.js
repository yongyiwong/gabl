/* eslint-disable no-undef */
require('dotenv').config();

const webpack = require('webpack');

const withPlugins = require('next-compose-plugins');
const withTM = require('next-transpile-modules')([
  // '@synappsagency/react-common',
  'lodash-es',
]);

module.exports = withPlugins([withTM], {
  webpack5: false,
  eslint: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    // ignoreDuringBuilds: true,
  },
  env: {
    WEB_URL: process.env.WEB_URL,
    API_URL: process.env.API_URL,
    LANDING_URL: process.env.LANDING_URL,
    MEDIASERVICE_URL: process.env.MEDIASERVICE_URL,
    STORAGE_URL: process.env.STORAGE_URL,
    CDN_URL: process.env.CDN_URL,
    UPLOADS_CONTAINER: process.env.UPLOADS_CONTAINER,
  },
  webpack: function (config, { isServer }) {
    config.module.rules.push({
      test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000,
          name: '[name].[ext]',
        },
      },
    });

    config.plugins.unshift(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));

    if (!isServer && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze/client.html',
          generateStatsFile: true,
        })
      );
    }

    return config;
  },
});
