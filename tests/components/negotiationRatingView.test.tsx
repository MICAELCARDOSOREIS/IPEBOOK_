import { createElement } from "react";
import { Text } from "react-native";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NegotiationRatingModal } from "@/view/requests/NegotiationRatingModal";
import { ThemeProvider } from "@/view/theme/ThemeProvider";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
});

describe("NegotiationRatingModal (Spec 063 / ADR 0046)", () => {
  it("renderiza modal fechado sem quebrar", async () => {
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = create(
        createElement(
          ThemeProvider,
          null,
          createElement(NegotiationRatingModal, {
            visible: false,
            counterpartName: "Ana Paula",
            selectedScore: 5,
            onSelectScore: vi.fn(),
            onSubmit: vi.fn(),
            onClose: vi.fn(),
            isSubmitting: false,
            submitError: null,
            isSuccess: false,
          }),
        ),
      );
      mounted.push(tree);
    });

    expect(tree).toBeDefined();
  });

  it("renderiza diálogo com 5 opções de estrelas e nome da contraparte", async () => {
    let tree!: ReactTestRenderer;
    const onSelectScore = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(true);
    const onClose = vi.fn();

    await act(async () => {
      tree = create(
        createElement(
          ThemeProvider,
          null,
          createElement(NegotiationRatingModal, {
            visible: true,
            counterpartName: "Carlos Silva",
            selectedScore: 4,
            onSelectScore,
            onSubmit,
            onClose,
            isSubmitting: false,
            submitError: null,
            isSuccess: false,
          }),
        ),
      );
      mounted.push(tree);
    });

    const root = tree.root;
    // Verifica presença do nome da contraparte
    const textNodes = root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat().join(" ");
    expect(texts).toContain("Carlos Silva");
    expect(texts).toContain("Avaliar negociação");

    // Verifica botões de estrelas com acessibilidade
    const starRadios = [1, 2, 3, 4, 5].map((score) =>
      root.findByProps({ testID: `star-radio-${score}` }),
    );
    expect(starRadios).toHaveLength(5);

    // Clica na 3ª estrela
    await act(async () => {
      starRadios[2].props.onPress();
    });
    expect(onSelectScore).toHaveBeenCalledWith(3);
  });

  it("exibe mensagem de erro quando submitError está presente", async () => {
    let tree!: ReactTestRenderer;
    await act(async () => {
      tree = create(
        createElement(
          ThemeProvider,
          null,
          createElement(NegotiationRatingModal, {
            visible: true,
            counterpartName: "Carlos Silva",
            selectedScore: 5,
            onSelectScore: vi.fn(),
            onSubmit: vi.fn(),
            onClose: vi.fn(),
            isSubmitting: false,
            submitError: "Você já avaliou esta negociação.",
            isSuccess: false,
          }),
        ),
      );
      mounted.push(tree);
    });

    const root = tree.root;
    const errorAlert = root.findByProps({ accessibilityRole: "alert" });
    expect(errorAlert.props.children).toBe("Você já avaliou esta negociação.");
  });

  it("exibe tela de sucesso quando isSuccess for true", async () => {
    let tree!: ReactTestRenderer;
    const onClose = vi.fn();
    await act(async () => {
      tree = create(
        createElement(
          ThemeProvider,
          null,
          createElement(NegotiationRatingModal, {
            visible: true,
            counterpartName: "Carlos Silva",
            selectedScore: 5,
            onSelectScore: vi.fn(),
            onSubmit: vi.fn(),
            onClose,
            isSubmitting: false,
            submitError: null,
            isSuccess: true,
          }),
        ),
      );
      mounted.push(tree);
    });

    const root = tree.root;
    const textNodes = root.findAllByType(Text);
    const texts = textNodes.map((n) => n.props.children).flat().join(" ");
    expect(texts).toContain("Avaliação enviada!");

    const closeBtn = root.findByProps({ accessibilityLabel: "Fechar diálogo de avaliação" });
    await act(async () => {
      closeBtn.props.onPress();
    });
    expect(onClose).toHaveBeenCalled();
  });
});
