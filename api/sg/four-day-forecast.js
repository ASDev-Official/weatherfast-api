const { proxyRealTimeApi } = require("./_proxy");

// Updates every few hours — cache for 30 min, serve stale for 60 min more
module.exports = function handler(req, res) {
  return proxyRealTimeApi(req, res, "four-day-outlook", {
    sMaxAge: 1800,
    staleWhileRevalidate: 3600,
  });
};
