
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { Platform, StyleSheet } from "react-native";
import TermsAndPrivacy from "@/view/legal/termsAndPrivacy";

describe("tela de Termos e Privacidade (ISO/IEC 25010 - Usabilidade e Conformidade)", () => {
  it("renderiza cabeçalho acessível", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<TermsAndPrivacy onBack={() => {}} />);
    });

    expect(screen.getByRole("header", { name: "Termos e privacidade" })).toBeDefined();
  });

  it("inicia na aba de Termos de Uso com menção a Piripiri e segurança", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<TermsAndPrivacy onBack={() => {}} />);
    });

    expect(screen.getByText("1. Finalidade da Comunidade")).toBeDefined();
    expect(screen.getByText(/cidade de Piripiri, PI/)).toBeDefined();
    expect(screen.getByText("4. Encontros Presenciais e Segurança")).toBeDefined();
    expect(screen.getByText(/conta e risco/)).toBeDefined();
    expect(screen.getByText(/não respondem por danos físicos/)).toBeDefined();
    expect(screen.getByText(/Lei nº 9\.610\/1998/)).toBeDefined();
    expect(screen.getByText(/Comarca de Piripiri, PI/)).toBeDefined();
  });

  it("agrupa as abas de Termos/Privacidade em um contêiner com papel tablist", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<TermsAndPrivacy onBack={() => {}} />);
    });

    expect(screen.getByTestId("terms-privacy-tablist").props.accessibilityRole).toBe("tablist");
    expect(screen.getAllByRole("tab")).toHaveLength(2);
    expect(screen.getByRole("tab", { name: "Termos de Uso", selected: true })).toBeDefined();
    expect(screen.getByRole("tab", { name: "Privacidade (LGPD)", selected: false })).toBeDefined();
  });

  it("permite alternar para a aba de Privacidade e exibe conformidade com LGPD", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<TermsAndPrivacy onBack={() => {}} />);
    });

    const privacyTab = screen.getByRole("tab", { name: "Privacidade (LGPD)" });
    await act(async () => {
      fireEvent.press(privacyTab);
    });

    expect(screen.getByText("2. Dados que coletamos e para quê")).toBeDefined();
    expect(screen.getByText(/Lei Geral de Proteção de Dados/)).toBeDefined();
    // A política precisa refletir o que o app realmente coleta (formulário de segurança dos dados da Play Store).
    expect(screen.getByText("3. Com quem os dados são compartilhados")).toBeDefined();
    expect(screen.getByText(/Supabase .*Google\/Apple/)).toBeDefined();
    expect(screen.getByText(/não coletamos localização precisa por GPS/i)).toBeDefined();
    expect(screen.getByText(/maiores de 18 anos/)).toBeDefined();
    expect(screen.getByText("Última atualização: 27 de novembro de 2026")).toBeDefined();
  });

  it("abre direto na aba de Privacidade quando pedido (link da Play Store)", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<TermsAndPrivacy initialTab="privacy" />);
    });
    expect(screen.getByText("1. Quem trata os seus dados")).toBeDefined();
  });

  it("aciona callback onBack ao pressionar botão de retorno", async () => {
    const onBack = jest.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<TermsAndPrivacy onBack={onBack} />);
    });

    const backButton = screen.getByRole("button", { name: "Voltar" });
    fireEvent.press(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("aciona callback onNavigateToDeleteAccount na aba de privacidade", async () => {
    const onDelete = jest.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <TermsAndPrivacy onBack={() => {}} onNavigateToDeleteAccount={onDelete} />,
      );
    });

    const privacyTab = screen.getByRole("tab", { name: "Privacidade (LGPD)" });
    await act(async () => {
      fireEvent.press(privacyTab);
    });

    expect(screen.getByText("Portabilidade e Exclusão (LGPD — Art. 18)")).toBeDefined();
    const deleteLink = screen.getByRole("button", {
      name: "Abrir gerenciamento de exportação e exclusão dos meus dados",
    });
    await act(async () => {
      fireEvent.press(deleteLink);
    });

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  describe("acessibilidade e navegação por teclado na Web", () => {
    const originalOS = Platform.OS;

    type JsonNode = { type?: string; props?: Record<string, unknown>; children?: JsonNode[] | null };

    function findTabPanels(node: unknown): JsonNode[] {
      if (!node || typeof node !== "object") return [];
      if (Array.isArray(node)) return node.flatMap(findTabPanels);
      const current = node as JsonNode;
      const own = current.props?.role === "tabpanel" ? [current] : [];
      return [...own, ...findTabPanels(current.children)];
    }

    beforeEach(() => {
      Platform.OS = "web";
    });

    afterEach(async () => {
      await cleanup();
      Platform.OS = originalOS;
    });

    it("expõe tabIndex, aria-controls, aria-selected, aria-labelledby e painel oculto coerentes com a aba ativa", async () => {
      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<TermsAndPrivacy onBack={() => {}} />);
      });

      const termsTab = screen.getByRole("tab", { name: "Termos de Uso" });
      const privacyTab = screen.getByRole("tab", { name: "Privacidade (LGPD)" });

      expect(termsTab.props.nativeID).toBe("legal-tab-terms");
      expect(termsTab.props["aria-controls"]).toBe("legal-panel-terms");
      expect(termsTab.props["aria-selected"]).toBe(true);
      expect(termsTab.props.tabIndex).toBe(0);

      expect(privacyTab.props.nativeID).toBe("legal-tab-privacy");
      expect(privacyTab.props["aria-controls"]).toBe("legal-panel-privacy");
      expect(privacyTab.props["aria-selected"]).toBe(false);
      expect(privacyTab.props.tabIndex).toBe(-1);

      const initialPanels = findTabPanels(screen.toJSON());
      expect(initialPanels).toHaveLength(2);
      const hiddenPrivacyPanel = initialPanels.find((panel) => panel.props?.nativeID === "legal-panel-privacy");
      const activeTermsPanel = initialPanels.find((panel) => panel.props?.nativeID === "legal-panel-terms");

      expect(hiddenPrivacyPanel?.props?.["aria-labelledby"]).toBe("legal-tab-privacy");
      expect(hiddenPrivacyPanel?.props?.tabIndex).toBeUndefined();
      expect(StyleSheet.flatten(hiddenPrivacyPanel?.props?.style as never).display).toBe("none");

      expect(activeTermsPanel?.props?.["aria-labelledby"]).toBe("legal-tab-terms");
      expect(activeTermsPanel?.props?.tabIndex).toBe(0);
      expect(StyleSheet.flatten(activeTermsPanel?.props?.style as never).display).not.toBe("none");

      await act(async () => {
        fireEvent.press(privacyTab);
      });

      const updatedTermsTab = screen.getByRole("tab", { name: "Termos de Uso" });
      const updatedPrivacyTab = screen.getByRole("tab", { name: "Privacidade (LGPD)" });
      expect(updatedTermsTab.props["aria-selected"]).toBe(false);
      expect(updatedTermsTab.props.tabIndex).toBe(-1);
      expect(updatedPrivacyTab.props["aria-selected"]).toBe(true);
      expect(updatedPrivacyTab.props.tabIndex).toBe(0);

      const updatedPanels = findTabPanels(screen.toJSON());
      expect(updatedPanels).toHaveLength(2);
      const hiddenTermsPanel = updatedPanels.find((panel) => panel.props?.nativeID === "legal-panel-terms");
      const activePrivacyPanel = updatedPanels.find((panel) => panel.props?.nativeID === "legal-panel-privacy");

      expect(hiddenTermsPanel?.props?.["aria-labelledby"]).toBe("legal-tab-terms");
      expect(hiddenTermsPanel?.props?.tabIndex).toBeUndefined();
      expect(StyleSheet.flatten(hiddenTermsPanel?.props?.style as never).display).toBe("none");

      expect(activePrivacyPanel?.props?.["aria-labelledby"]).toBe("legal-tab-privacy");
      expect(activePrivacyPanel?.props?.tabIndex).toBe(0);
      expect(StyleSheet.flatten(activePrivacyPanel?.props?.style as never).display).not.toBe("none");
    });

    it("navega e ativa abas com ArrowRight, ArrowLeft, Home, End, Espaço e Enter, ignorando outras teclas", async () => {
      let screen!: Awaited<ReturnType<typeof render>>;
      await act(async () => {
        screen = await render(<TermsAndPrivacy onBack={() => {}} />);
      });

      const pressTabKey = async (tabName: "Termos de Uso" | "Privacidade (LGPD)", key: string) => {
        const preventDefault = jest.fn();
        await act(async () => {
          fireEvent(screen.getByRole("tab", { name: tabName }), "keyDown", {
            nativeEvent: { key },
            preventDefault,
          });
        });
        return preventDefault;
      };

      // ArrowRight em Termos -> vai para Privacidade
      expect(await pressTabKey("Termos de Uso", "ArrowRight")).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("tab", { name: "Privacidade (LGPD)" }).props["aria-selected"]).toBe(true);
      expect(screen.getByText("1. Quem trata os seus dados")).toBeDefined();

      // ArrowLeft em Privacidade -> volta para Termos
      expect(await pressTabKey("Privacidade (LGPD)", "ArrowLeft")).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("tab", { name: "Termos de Uso" }).props["aria-selected"]).toBe(true);
      expect(screen.getByText("1. Finalidade da Comunidade")).toBeDefined();

      // ArrowLeft na primeira aba -> retorno na extremidade para Privacidade
      expect(await pressTabKey("Termos de Uso", "ArrowLeft")).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("tab", { name: "Privacidade (LGPD)" }).props["aria-selected"]).toBe(true);

      // Home -> primeira aba (Termos)
      expect(await pressTabKey("Privacidade (LGPD)", "Home")).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("tab", { name: "Termos de Uso" }).props["aria-selected"]).toBe(true);

      // End -> última aba (Privacidade)
      expect(await pressTabKey("Termos de Uso", "End")).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("tab", { name: "Privacidade (LGPD)" }).props["aria-selected"]).toBe(true);

      // Espaço (" ") ativa a aba alvo
      expect(await pressTabKey("Termos de Uso", " ")).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("tab", { name: "Termos de Uso" }).props["aria-selected"]).toBe(true);

      // Enter ativa a aba alvo
      expect(await pressTabKey("Privacidade (LGPD)", "Enter")).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("tab", { name: "Privacidade (LGPD)" }).props["aria-selected"]).toBe(true);

      // Tecla não mapeada não chama preventDefault nem altera a aba ativa
      expect(await pressTabKey("Privacidade (LGPD)", "Escape")).not.toHaveBeenCalled();
      expect(screen.getByRole("tab", { name: "Privacidade (LGPD)" }).props["aria-selected"]).toBe(true);
    });
  });
});
