const NetInfo = {
  fetch: async () => ({ isConnected: true, isInternetReachable: true }),
  addEventListener: () => () => {},
};

module.exports = NetInfo;
module.exports.default = NetInfo;
