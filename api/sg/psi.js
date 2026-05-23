const { proxyRealTimeApi } = require("./_proxy");

// Updates every ~1 hour — cache for 10 min, serve stale for 20 min more
module.exports = function handler(req, res) {
  return proxyRealTimeApi(req, res, "psi", {
    sMaxAge: 600,
    staleWhileRevalidate: 1200,
  });
};
