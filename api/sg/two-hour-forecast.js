const { proxyRealTimeApi } = require("./_proxy");

// Updates every ~30 min — cache for 5 min, serve stale for 25 min more
module.exports = function handler(req, res) {
  return proxyRealTimeApi(req, res, "two-hr-forecast", {
    sMaxAge: 300,
    staleWhileRevalidate: 1500,
  });
};
