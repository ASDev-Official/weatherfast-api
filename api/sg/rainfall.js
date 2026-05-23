const { proxyRealTimeApi } = require("./_proxy");

// Updates every ~5 min — cache for 2 min, serve stale for 3 min more
module.exports = function handler(req, res) {
  return proxyRealTimeApi(req, res, "rainfall", {
    sMaxAge: 120,
    staleWhileRevalidate: 180,
  });
};
