import { act, fireEvent, render } from "@testing-library/react-native";
import { Platform, StyleSheet } from "react-native";
import { BetaInviteScreen } from "@/view/beta/betaInviteScreen";
import { TopAppBar } from "@/view/components/TopAppBar";
import Welcome from "@/view/onboarding/welcome";
import * as useIsWideWebModule from "@/view/useIsWideWeb";

function minHeightOf(style: unknown): number {
  const flat = StyleSheet.flatten(style as never) as { minHeight?: number; height?: number } | undefined;
  return flat?.minHeight ?? flat?.height ?? 0;
}

describe("acessibilidade Web: alvos de toque ≥ 48 dp e hierarquia de títulos", () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, "OS", { value: originalOS, configurable: true });
    jest.restoreAllMocks();
  });

  it("TopAppBar garante 48 dp na Web (compacta e larga) e preserva 44 dp no iOS e 40 dp no Android", async () => {
    Object.defineProperty(Platform, "OS", { value: "web", configurable: true });

    jest.spyOn(useIsWideWebModule, "useIsWideWeb").mockReturnValue(false);
    const compact = await render(<TopAppBar title="Termos" onBack={jest.fn()} />);
    expect(minHeightOf(compact.getByRole("button", { name: "Voltar" }).props.style)).toBeGreaterThanOrEqual(48);

    jest.spyOn(useIsWideWebModule, "useIsWideWeb").mockReturnValue(true);
    const wide = await render(<TopAppBar title="Termos" onBack={jest.fn()} />);
    expect(minHeightOf(wide.getByRole("button", { name: "Voltar" }).props.style)).toBeGreaterThanOrEqual(48);

    jest.spyOn(useIsWideWebModule, "useIsWideWeb").mockReturnValue(false);
    Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
    const iosBar = await render(<TopAppBar title="Termos" onBack={jest.fn()} />);
    expect(minHeightOf(iosBar.getByRole("button", { name: "Voltar" }).props.style)).toBe(44);

    Object.defineProperty(Platform, "OS", { value: "android", configurable: true });
    const androidBar = await render(<TopAppBar title="Termos" onBack={jest.fn()} />);
    expect(minHeightOf(androidBar.getByRole("button", { name: "Voltar" }).props.style)).toBe(40);
  });

  it("Welcome mantém chips de modalidade com altura mínima de 48 dp", async () => {
    Object.defineProperty(Platform, "OS", { value: "web", configurable: true });
    jest.spyOn(useIsWideWebModule, "useIsWideWeb").mockReturnValue(false);

    const screen = await render(<Welcome onStart={jest.fn()} onSignIn={jest.fn()} />);
    for (const label of [
      "Venda: toque para ver detalhes",
      "Troca: toque para ver detalhes",
      "Doação: toque para ver detalhes",
    ]) {
      expect(minHeightOf(screen.getByRole("button", { name: label }).props.style)).toBeGreaterThanOrEqual(48);
    }
  });

  it("BetaInviteScreen usa aria-level=2 no guia expandido e alvos ≥ 48 dp no cabeçalho e em trocar conta", async () => {
    Object.defineProperty(Platform, "OS", { value: "web", configurable: true });
    jest.spyOn(useIsWideWebModule, "useIsWideWeb").mockReturnValue(false);

    const screen = await render(
      <BetaInviteScreen
        state={{ loading: false, error: null, success: false }}
        actions={{ submit: jest.fn().mockResolvedValue(true), reset: jest.fn() }}
        authState={{
          user: { id: "u1", email: "leitor@gmail.com", name: "Leitor" },
          loading: false,
          error: null,
        }}
        authActions={{
          signUp: jest.fn(),
          signIn: jest.fn(),
          signOut: jest.fn().mockResolvedValue(true),
          requestPasswordReset: jest.fn(),
        }}
      />,
    );

    expect(
      minHeightOf(screen.getByRole("link", { name: "Voltar para a página inicial" }).props.style),
    ).toBeGreaterThanOrEqual(48);
    expect(
      minHeightOf(screen.getByRole("link", { name: "Ir para a página inicial do IpêBook" }).props.style),
    ).toBeGreaterThanOrEqual(48);
    expect(
      minHeightOf(screen.getByRole("button", { name: "Usar outra conta Google" }).props.style),
    ).toBeGreaterThanOrEqual(48);

    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: /Como instalar/i }));
    });

    const guideHeader = screen.getByText("Como liberar e baixar o IpêBook (passo a passo)");
    expect(guideHeader.props.accessibilityRole).toBe("header");
    expect(guideHeader.props["aria-level"]).toBe(2);
  });
});
