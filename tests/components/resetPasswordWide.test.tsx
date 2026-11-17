
import { act, render } from "@testing-library/react-native";

jest.mock("@/view/useIsWideWeb", () => ({ useIsWideWeb: () => true, useHydratedWindowWidth: () => 1280, WIDE_WEB_MIN_WIDTH: 960 }));
jest.mock("@/viewmodel/useResetPasswordViewModel", () => ({
  useResetPasswordViewModel: () => [
    { loading: false, error: null, success: false, linkExpired: false },
    { submit: jest.fn() },
  ],
}));

import ResetPassword from "@/view/auth/resetPassword";

describe("ResetPassword na Web Larga (Spec 093 · Figma 01.06)", () => {
  it("renderiza o painel da marca AuthShell no layout largo de duas colunas", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ResetPassword link="https://ipebook.app/redefinir-senha" />);
    });

    expect(screen.getByTestId("auth-shell")).toBeDefined();
    expect(screen.getByText("Histórias que seguem.")).toBeDefined();
    expect(screen.getByText("Um novo começo.")).toBeDefined();
    expect(screen.getByLabelText("Nova senha")).toBeDefined();
    expect(screen.getByLabelText("Confirmar senha")).toBeDefined();
  });
});
