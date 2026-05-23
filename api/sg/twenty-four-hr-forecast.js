const { proxyRealTimeApi } = require("./_proxy");

// Updates every few hours — cache for 30 min, serve stale for 60 min more
module.exports = function handler(req, res) {
  return proxyRealTimeApi(req, res, "twenty-four-hr-forecast", {
    sMaxAge: 1800,
    staleWhileRevalidate: 3600,
  });
};
