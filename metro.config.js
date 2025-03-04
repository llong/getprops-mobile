const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

module.exports = {
  ...config,
  resolver: {
    ...config.resolver,
    extraNodeModules: {
      "@rneui/base": require.resolve("@rneui/base"),
      "@rneui/themed": require.resolve("@rneui/themed"),
    },
  },
};
