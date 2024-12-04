const { override } = require('react-app-rewired');

module.exports = override(
    // You can add custom webpack configurations here
    // For now, we'll leave it empty
);

const webpack = require('webpack');

module.exports = function override(config) {
    // Add polyfills for Node.js core modules used in the browser
    config.resolve.fallback = {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        zlib: require.resolve('browserify-zlib'),
        url: require.resolve('url/'),
        assert: require.resolve('assert'),
        buffer: require.resolve('buffer'),
    };

    // Add plugins for Node.js core modules
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
        }),
    ]);

    return config;
};
