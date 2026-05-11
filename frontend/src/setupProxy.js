/* eslint-disable */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/socket.io',
    createProxyMiddleware({
      target: 'http://backend:3030',
      changeOrigin: true,
      ws: true,
    }),
  );

  app.use(
    '/auth',
    createProxyMiddleware({
      target: 'http://backend:3030',
      changeOrigin: true,
    }),
  );
};
