const createExpoWebpackConfigAsync = require("@expo/webpack-config");
const corsConfig = require("./web/cors-config");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Apply CORS configuration for development
  if (env.mode === "development") {
    // Merge our custom devServer settings with the default ones
    config.devServer = {
      ...config.devServer,
      ...corsConfig.devServer,
      proxy: {
        ...config.devServer?.proxy,
        ...corsConfig.devServer.proxy,
      },
    };
  }

  // Ensure proper handling of fetch requests
  config.resolve.fallback = {
    ...config.resolve.fallback,
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    url: require.resolve("url/"),
  };

  return config;
};
