const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/v2", {
      target: "https://sandbox.shiftmarkets.com",
      secure: false,
      changeOrigin: true,
      // pathRewrite: {
      //   "^/finxapi": ""
      // }
    })
  );

  app.use(
    createProxyMiddleware("/cryapi", {
      target: "https://api.cryptosrvc.com",
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        "^/cryapi": "",
      },
    })
  );
};
