
import { act, render } from "@testing-library/react-native";

jest.mock("@/viewmodel/useAuthViewModel", () => ({ useAuthViewModel: jest.fn() }));
jest.mock("@/view/listings/editListing", () => ({ __esModule: true, default: () => null }));
jest.mock("@/view/search/manageAlert", () => ({ __esModule: true, default: jest.fn(() => null) }));

import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import EditListingScreen from "@/view/listings/editListingScreen";
import ManageAlert from "@/view/search/manageAlert";
import ManageAlertScreen from "@/view/search/manageAlertScreen";

const noopActions = {} as ReturnType<typeof useAuthViewModel>[1];

function auth(user: { id: string; email: string } | null, loading = false) {
  jest.mocked(useAuthViewModel).mockReturnValue([{ user, loading, error: null }, noopActions]);
}

describe("telas-contêiner que dependem da sessão (Spec 092)", () => {
  it("Editar anúncio pede entrada só quando terminou de carregar e não há sessão", async () => {
    const onRequireSignIn = jest.fn();
    auth(null, true);
    await act(async () => { await render(<EditListingScreen bookId="b" onRequireSignIn={onRequireSignIn} />); });
    expect(onRequireSignIn).not.toHaveBeenCalled();
    auth(null);
    await act(async () => { await render(<EditListingScreen bookId="b" onRequireSignIn={onRequireSignIn} />); });
    expect(onRequireSignIn).toHaveBeenCalledTimes(1);
    auth({ id: "u1", email: "a@b.c" });
    await act(async () => { await render(<EditListingScreen bookId="b" onRequireSignIn={onRequireSignIn} />); });
    expect(onRequireSignIn).toHaveBeenCalledTimes(1);
  });

  it("Gerenciar alerta repassa a pessoa logada ou nulo", async () => {
    auth({ id: "u1", email: "a@b.c" });
    await act(async () => { await render(<ManageAlertScreen alertId="a1" onBack={() => {}} onEditAlert={() => {}} onAlertDeleted={() => {}} />); });
    expect(jest.mocked(ManageAlert).mock.lastCall?.[0]).toMatchObject({ alertId: "a1", userId: "u1" });
    auth(null);
    await act(async () => { await render(<ManageAlertScreen alertId="a1" onBack={() => {}} onEditAlert={() => {}} onAlertDeleted={() => {}} />); });
    expect(jest.mocked(ManageAlert).mock.lastCall?.[0]).toMatchObject({ alertId: "a1", userId: null });
  });
});
