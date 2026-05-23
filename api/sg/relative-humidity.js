const { proxyRealTimeApi } = require("./_proxy");

// Updates every ~1 min — cache for 60s, serve stale for 60s more
module.exports = function handler(req, res) {
  return proxyRealTimeApi(req, res, "relative-humidity", {
    sMaxAge: 60,
    staleWhileRevalidate: 60,
  });
};
