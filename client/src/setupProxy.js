const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:5001',
      changeOrigin: true,
      secure: false,
      onProxyReq: (proxyReq, req, res) => {
        // Handle keep-alive issues that cause ECONNRESET
        proxyReq.setHeader('Connection', 'keep-alive');
      }
    })
  );
};
