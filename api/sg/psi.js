const { proxyRealTimeApi } = require("./_proxy");

module.exports = function handler(req, res) {
  return proxyRealTimeApi(req, res, "psi");
};
