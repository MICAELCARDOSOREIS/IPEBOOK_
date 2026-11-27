import NetInfo from "@react-native-community/netinfo";
import { NetInfoNetworkStatusDataSource } from "@/infra/datasources/netInfoNetworkStatusDataSource";

jest.mock("@react-native-community/netinfo", () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(),
    addEventListener: jest.fn(),
  },
}));

describe("NetInfoNetworkStatusDataSource", () => {
  const mockedNetInfo = jest.mocked(NetInfo);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("considera online quando isConnected é true ou null, e offline quando false", async () => {
    const ds = new NetInfoNetworkStatusDataSource();

    mockedNetInfo.fetch.mockResolvedValueOnce({ isConnected: true } as never);
    await expect(ds.isOnline()).resolves.toBe(true);

    mockedNetInfo.fetch.mockResolvedValueOnce({ isConnected: null } as never);
    await expect(ds.isOnline()).resolves.toBe(true);

    mockedNetInfo.fetch.mockResolvedValueOnce({ isConnected: false } as never);
    await expect(ds.isOnline()).resolves.toBe(false);
  });

  it("repassa alterações do listener de NetInfo como boolean", () => {
    const ds = new NetInfoNetworkStatusDataSource();
    const unsub = jest.fn();

    mockedNetInfo.addEventListener.mockReturnValueOnce(unsub);

    const onChange = jest.fn();
    const cancel = ds.subscribe(onChange);

    const listener = mockedNetInfo.addEventListener.mock.calls[0]?.[0];
    expect(listener).toBeDefined();
    listener?.({ isConnected: false } as never);
    listener?.({ isConnected: null } as never);
    listener?.({ isConnected: true } as never);

    expect(onChange).toHaveBeenNthCalledWith(1, false);
    expect(onChange).toHaveBeenNthCalledWith(2, true);
    expect(onChange).toHaveBeenNthCalledWith(3, true);

    cancel();
    expect(unsub).toHaveBeenCalledTimes(1);
  });
});
