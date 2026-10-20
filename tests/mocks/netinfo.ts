const NetInfo = {
  fetch: async () => ({ isConnected: true, isInternetReachable: true }),
  addEventListener: () => () => {},
};

export default NetInfo;
