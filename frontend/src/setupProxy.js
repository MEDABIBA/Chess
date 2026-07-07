/* eslint-disable */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    createProxyMiddleware('/socket.io', {
      target: 'http://backend:3030',
      changeOrigin: true,
      ws: true,
    }),
  );

  app.use(
    createProxyMiddleware('/auth', {
      target: 'http://backend:3030',
      changeOrigin: true,
    }),
  );
};
