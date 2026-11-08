import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react-native";
import { StyleSheet, Text, View } from "react-native";
import { colors, darkColors, type ColorPalette } from "@/view/tokens";
import { standardVerticalScrollProps } from "@/view/scrollProps";

// Permite trocar o tema devolvido por useTheme em um caso específico (tema escuro).
const tema = vi.hoisted(() => ({ cores: null as ColorPalette | null }));
vi.mock("@/view/theme/ThemeProvider", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/view/theme/ThemeProvider")>();
  return {
    ...original,
    useTheme: () => {
      const padrao = original.useTheme();
      return tema.cores ? { ...padrao, resolvedScheme: "dark", colors: tema.cores } : padrao;
    },
  };
});

import { ScreenContainer } from "@/view/components/ScreenContainer";

type No = { type: string; props: Record<string, unknown>; children: (No | string)[] | null };

/** Renderiza o contêiner e devolve a árvore a partir da área segura (raiz). */
async function montar(elemento: React.ReactElement) {
  const tela = await render(elemento);
  return { tela, raiz: tela.toJSON() as unknown as No };
}

const filhos = (no: No) => (no.children ?? []).filter((c): c is No => typeof c !== "string");
const estiloDaColuna = (coluna: No) =>
  StyleSheet.flatten((coluna.type === "ScrollView" ? coluna.props.contentContainerStyle : coluna.props.style) as never);

describe("ScreenContainer (design-system/03-fundamentos.md, orientação e layout responsivo)", () => {
  afterEach(() => {
    tema.cores = null;
    cleanup();
  });

  it("renderiza o conteúdo numa coluna centralizada que rola", async () => {
    const { tela, raiz } = await montar(
      <ScreenContainer>
        <Text>Conteúdo da tela</Text>
      </ScreenContainer>,
    );
    expect(tela.queryByText("Conteúdo da tela")).not.toBeNull();
    const rolagem = filhos(raiz)[0];
    expect(rolagem.type).toBe("ScrollView");
    expect(estiloDaColuna(rolagem)).toMatchObject({ flexGrow: 1, width: "100%", alignSelf: "center" });
  });

  it("aplica os padrões: largura máxima 720 e espaçamentos 16, 8 e 24", async () => {
    const { raiz } = await montar(
      <ScreenContainer>
        <Text>Conteúdo</Text>
      </ScreenContainer>,
    );
    expect(estiloDaColuna(filhos(raiz)[0])).toMatchObject({
      maxWidth: 720,
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 24,
    });
  });

  it("aceita a largura de formulário (560) e espaçamentos próprios", async () => {
    const { raiz } = await montar(
      <ScreenContainer maxWidth={560} paddingHorizontal={24} paddingTop={0} paddingBottom={40}>
        <Text>Formulário</Text>
      </ScreenContainer>,
    );
    expect(estiloDaColuna(filhos(raiz)[0])).toMatchObject({
      maxWidth: 560,
      paddingHorizontal: 24,
      paddingTop: 0,
      paddingBottom: 40,
    });
  });

  it("não limita a largura quando maxWidth é null", async () => {
    const { raiz } = await montar(
      <ScreenContainer maxWidth={null}>
        <Text>Web larga</Text>
      </ScreenContainer>,
    );
    expect(estiloDaColuna(filhos(raiz)[0])).not.toHaveProperty("maxWidth");
  });

  it("usa View em vez de ScrollView quando scroll é false, com o mesmo estilo de coluna", async () => {
    const { tela, raiz } = await montar(
      <ScreenContainer scroll={false}>
        <Text>Layout próprio</Text>
      </ScreenContainer>,
    );
    const [colunaFixa] = filhos(raiz);
    expect(colunaFixa.type).toBe("View");
    expect(filhos(raiz).some((no) => no.type === "ScrollView")).toBe(false);
    expect(estiloDaColuna(colunaFixa)).toMatchObject({ maxWidth: 720, paddingHorizontal: 16, alignSelf: "center" });
    expect(tela.queryByText("Layout próprio")).not.toBeNull();
  });

  it("mostra o cabeçalho fixo antes da área que rola", async () => {
    const { tela, raiz } = await montar(
      <ScreenContainer header={<View testID="cabecalho" />}>
        <Text>Conteúdo</Text>
      </ScreenContainer>,
    );
    const [primeiro, segundo] = filhos(raiz);
    expect(primeiro.props.testID).toBe("cabecalho");
    expect(segundo.type).toBe("ScrollView");
    expect(tela.queryByTestId("cabecalho")).not.toBeNull();
  });

  it("renderiza o overlay depois da coluna, ainda dentro da área segura", async () => {
    const { raiz } = await montar(
      <ScreenContainer testID="tela" overlay={<View testID="aviso-flutuante" />}>
        <Text>Conteúdo</Text>
      </ScreenContainer>,
    );
    expect(raiz.props.testID).toBe("tela");
    const ordem = filhos(raiz).map((no) => (no.type === "ScrollView" ? "coluna" : no.props.testID));
    expect(ordem).toEqual(["coluna", "aviso-flutuante"]);
  });

  it("repassa edges e testID à área segura", async () => {
    const { tela } = await montar(
      <ScreenContainer testID="tela" edges={["top", "left", "right"]}>
        <Text>Conteúdo</Text>
      </ScreenContainer>,
    );
    expect(tela.getByTestId("tela").props.edges).toEqual(["top", "left", "right"]);
  });

  it("repassa o refreshControl e as propriedades padrão de rolagem", async () => {
    const atualizar = <View testID="puxar-para-atualizar" />;
    const { raiz } = await montar(
      <ScreenContainer refreshControl={atualizar}>
        <Text>Conteúdo</Text>
      </ScreenContainer>,
    );
    const rolagem = filhos(raiz)[0];
    expect(rolagem.props.refreshControl).toBe(atualizar);
    expect(rolagem.props).toMatchObject(standardVerticalScrollProps);
  });

  it("aplica contentStyle por último, sobre os padrões da coluna", async () => {
    const { raiz } = await montar(
      <ScreenContainer contentStyle={{ gap: 12, paddingTop: 32 }}>
        <Text>Conteúdo</Text>
      </ScreenContainer>,
    );
    expect(estiloDaColuna(filhos(raiz)[0])).toMatchObject({ gap: 12, paddingTop: 32, paddingHorizontal: 16 });
  });

  it("usa a cor surface do tema claro como fundo da página", async () => {
    const { raiz } = await montar(
      <ScreenContainer>
        <Text>Conteúdo</Text>
      </ScreenContainer>,
    );
    expect(StyleSheet.flatten(raiz.props.style as never)).toMatchObject({ flex: 1, backgroundColor: colors.surface });
  });

  it("acompanha o tema escuro na cor de fundo", async () => {
    tema.cores = darkColors;
    const { raiz } = await montar(
      <ScreenContainer>
        <Text>Conteúdo</Text>
      </ScreenContainer>,
    );
    expect(StyleSheet.flatten(raiz.props.style as never).backgroundColor).toBe(darkColors.surface);
    expect(darkColors.surface).not.toBe(colors.surface);
  });
});
