const path = require('path');
const { DefinePlugin } = require('webpack');

module.exports = async ({ config }) => {
  // Resolve aliases
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, '../src'),
    '@components': path.resolve(__dirname, '../src/components'),
    '@hooks': path.resolve(__dirname, '../src/hooks'),
    '@styles': path.resolve(__dirname, '../src/styles'),
    '@utils': path.resolve(__dirname, '../src/utils'),
    '@assets': path.resolve(__dirname, '../src/assets'),
  };

  // SVG handling with SVGR
  const fileLoaderRule = config.module.rules.find(rule => rule.test.test('.svg'));
  fileLoaderRule.exclude = /\.svg$/;
  config.module.rules.push({
    test: /\.svg$/,
    use: ['@svgr/webpack'],
  });

  // SCSS support
  config.module.rules.push({
    test: /\.scss$/,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          modules: {
            auto: true,
            localIdentName: '[name]__[local]--[hash:base64:5]',
          },
        },
      },
      'sass-loader',
    ],
    include: path.resolve(__dirname, '../'),
  });

  // Environment variables
  config.plugins.push(new DefinePlugin({
    'process.env.STORYBOOK': JSON.stringify(true),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.API_URL': JSON.stringify(process.env.API_URL || 'https://api.earnmaxelite.com'),
  }));

  // Performance optimizations
  config.performance = {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  };

  return config;
};