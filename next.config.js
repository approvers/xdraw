'use strict';

const path = require('path');
const withTypescript = require('@zeit/next-typescript');

module.exports = withTypescript({
  webpack: (config, { buildId, dev, isServer, defaultLoaders }) => {
    config.resolve.modules.push(path.resolve('lib'));
    return config;
  }
});
