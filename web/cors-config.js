// This file adds middleware to the Expo web server to handle CORS issues
// with Supabase and other external APIs

module.exports = {
  // Apply this middleware to the development server
  devServer: {
    before(app) {
      // Add CORS headers to all responses
      app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS"
        );
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );
        next();
      });
    },
    // Add proxy for Supabase requests if needed
    proxy: {
      "/supabase-proxy": {
        target: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
        pathRewrite: { "^/supabase-proxy": "" },
        changeOrigin: true,
        secure: false,
      },
    },
  },
};
