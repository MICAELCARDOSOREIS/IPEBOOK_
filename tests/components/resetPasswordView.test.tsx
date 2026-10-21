import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import ResetPassword from "@/view/auth/resetPassword";
import { useResetPasswordViewModel } from "@/viewmodel/useResetPasswordViewModel";

vi.mock("@/viewmodel/useResetPasswordViewModel", () => ({ useResetPasswordViewModel: vi.fn() }));

const mocked = vi.mocked(useResetPasswordViewModel);

describe("tela de nova senha", () => {
  it("envia o link e a nova senha sem mostrar tokens", async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    mocked.mockReturnValue([{ loading: false, error: null, success: false, linkExpired: false }, { submit }]);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<ResetPassword link="ipebook://redefinir-senha?code=abc" />); });
    await act(async () => { fireEvent.changeText(screen.getByLabelText("Nova senha"), "nova-senha"); });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Salvar nova senha" }));
    });
    expect(submit).toHaveBeenCalledWith("ipebook://redefinir-senha?code=abc", "nova-senha");
    expect(screen.queryByText("abc")).toBeNull();
  });

  it("mostra erro seguro e oferece retorno ao login", async () => {
    const onNavigateToSignIn = vi.fn();
    mocked.mockReturnValue([{ loading: false, error: "Link inválido.", success: false, linkExpired: false }, { submit: vi.fn() }]);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<ResetPassword link={null} onNavigateToSignIn={onNavigateToSignIn} />); });
    expect(screen.getByRole("alert")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Voltar ao login" })); });
    expect(onNavigateToSignIn).toHaveBeenCalled();
  });

  it("confirma sucesso sem manter o formulário", async () => {
    mocked.mockReturnValue([{ loading: false, error: null, success: true, linkExpired: false }, { submit: vi.fn() }]);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<ResetPassword link={null} />); });
    expect(screen.getByText("Senha atualizada. Entre com a nova senha.")).toBeDefined();
    expect(screen.queryByLabelText("Nova senha")).toBeNull();
  });

  it("exibe erro de senhas divergentes sem chamar o submit", async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    mocked.mockReturnValue([{ loading: false, error: null, success: false, linkExpired: false }, { submit }]);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<ResetPassword link="ipebook://redefinir-senha" />); });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText("Nova senha"), "senha1234");
      fireEvent.changeText(screen.getByLabelText("Confirmar senha"), "senha9999");
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Salvar nova senha" }));
    });
    expect(screen.getByText("As senhas não coincidem.")).toBeDefined();
    expect(submit).not.toHaveBeenCalled();
  });

  it("mostra o estado de link expirado e oferece solicitar um novo (Issue #97)", async () => {
    const onNavigateToForgotPassword = vi.fn();
    mocked.mockReturnValue([
      { loading: false, error: "Link de recuperação inválido ou expirado.", success: false, linkExpired: true },
      { submit: vi.fn() },
    ]);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<ResetPassword link={null} onNavigateToForgotPassword={onNavigateToForgotPassword} />);
    });
    expect(screen.getByText("Link expirado.")).toBeDefined();
    expect(screen.queryByLabelText("Nova senha")).toBeNull();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Solicitar novo link" }));
    });
    expect(onNavigateToForgotPassword).toHaveBeenCalledTimes(1);
  });

  it("aciona onBack quando fornecido", async () => {
    const onBack = vi.fn();
    mocked.mockReturnValue([{ loading: false, error: null, success: false, linkExpired: false }, { submit: vi.fn() }]);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<ResetPassword link={null} onBack={onBack} />); });
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Voltar"));
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
