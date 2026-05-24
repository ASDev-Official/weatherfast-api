const { proxyRealTimeApi } = require("./_proxy");

// Updates every few hours — cache for 1 min, serve stale for 1 min more
module.exports = function handler(req, res) {
  return proxyRealTimeApi(req, res, "weather/flood-alerts", {
    sMaxAge: 60,
    staleWhileRevalidate: 60,
  });
};
