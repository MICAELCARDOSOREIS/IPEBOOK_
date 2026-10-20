import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import ResetPassword from "@/view/auth/resetPassword";
import { useResetPasswordViewModel } from "@/viewmodel/useResetPasswordViewModel";

vi.mock("@/viewmodel/useResetPasswordViewModel", () => ({ useResetPasswordViewModel: vi.fn() }));

const mocked = vi.mocked(useResetPasswordViewModel);

describe("tela de nova senha", () => {
  it("envia o link e a nova senha sem mostrar tokens", async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    mocked.mockReturnValue([{ loading: false, error: null, success: false }, { submit }]);
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
    mocked.mockReturnValue([{ loading: false, error: "Link inválido.", success: false }, { submit: vi.fn() }]);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<ResetPassword link={null} onNavigateToSignIn={onNavigateToSignIn} />); });
    expect(screen.getByRole("alert")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Voltar para o login" })); });
    expect(onNavigateToSignIn).toHaveBeenCalled();
  });

  it("confirma sucesso sem manter o formulário", async () => {
    mocked.mockReturnValue([{ loading: false, error: null, success: true }, { submit: vi.fn() }]);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<ResetPassword link={null} />); });
    expect(screen.getByText("Senha atualizada. Entre com a nova senha.")).toBeDefined();
    expect(screen.queryByLabelText("Nova senha")).toBeNull();
  });

  it("exibe erro de senhas divergentes sem chamar o submit", async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    mocked.mockReturnValue([{ loading: false, error: null, success: false }, { submit }]);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<ResetPassword link="ipebook://redefinir-senha" />); });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText("Nova senha"), "senha1234");
      fireEvent.changeText(screen.getByLabelText("Confirmar nova senha"), "senha9999");
    });
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Salvar nova senha" }));
    });
    expect(screen.getByText("As senhas não coincidem.")).toBeDefined();
    expect(submit).not.toHaveBeenCalled();
  });

  it("aciona onBack quando fornecido", async () => {
    const onBack = vi.fn();
    mocked.mockReturnValue([{ loading: false, error: null, success: false }, { submit: vi.fn() }]);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => { screen = await render(<ResetPassword link={null} onBack={onBack} />); });
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Voltar"));
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
