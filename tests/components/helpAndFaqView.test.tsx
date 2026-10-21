import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import HelpAndFaq from "@/view/help/helpAndFaq";

describe("tela de Central de Ajuda e FAQ (HelpAndFaq)", () => {
  it("renderiza cabeçalho e título acessíveis", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<HelpAndFaq onBack={() => {}} />);
    });

    expect(screen.getByRole("header", { name: "Central de Ajuda" })).toBeDefined();
    expect(screen.getByText("Dúvidas frequentes")).toBeDefined();
    expect(screen.getByText(/Tudo o que você precisa saber sobre trocas/)).toBeDefined();
  });

  it("exibe orientações locais de Piripiri e segurança", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<HelpAndFaq onBack={() => {}} />);
    });

    expect(screen.getByText("Onde devo realizar a entrega ou troca do livro em Piripiri?")).toBeDefined();
    expect(screen.getByText(/Campus do IFPI Piripiri/)).toBeDefined();
    expect(screen.getByText(/Praça da Bandeira/)).toBeDefined();
    expect(screen.getByText("O Ipebook cobra alguma taxa ou comissão?")).toBeDefined();
    expect(screen.getByText(/100% gratuito e comunitário/)).toBeDefined();
  });

  it("permite filtrar as dúvidas por categoria", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<HelpAndFaq onBack={() => {}} />);
    });

    const suporteFilter = screen.getByRole("button", { name: "Filtrar por Suporte e Contato" });
    await act(async () => {
      fireEvent.press(suporteFilter);
    });
    expect(screen.getByText("Como falar com a equipe do Ipebook?")).toBeDefined();

    const segurancaFilter = screen.getByRole("button", { name: "Filtrar por Segurança em Piripiri" });
    await act(async () => {
      fireEvent.press(segurancaFilter);
    });
    expect(screen.getByText("Posso levar acompanhante no encontro?")).toBeDefined();

    const regrasFilter = screen.getByRole("button", { name: "Filtrar por Regras e Trocas" });
    await act(async () => {
      fireEvent.press(regrasFilter);
    });
    expect(screen.getByText("Quais livros podem ser anunciados?")).toBeDefined();

    const todosFilter = screen.getByRole("button", { name: "Filtrar por Todas" });
    await act(async () => {
      fireEvent.press(todosFilter);
    });
    expect(screen.getByText("Como funciona o Ipebook?")).toBeDefined();
  });

  it("aciona callback onBack na barra superior", async () => {
    const onBack = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<HelpAndFaq onBack={onBack} />);
    });

    const backButton = screen.getByRole("button", { name: "Voltar" });
    await act(async () => {
      fireEvent.press(backButton);
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("abre as conversas pelo botão de rodapé (Figma 09.01, Spec 032)", async () => {
    const onOpenConversations = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<HelpAndFaq onBack={() => {}} onOpenConversations={onOpenConversations} />);
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Abrir conversas: suas negociações em andamento"));
    });

    expect(onOpenConversations).toHaveBeenCalledTimes(1);
  });

  it("filtra perguntas frequentes por busca instantânea e permite limpar busca quando não há resultados (Issue #164)", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<HelpAndFaq onBack={() => {}} />);
    });

    const searchInput = screen.getByLabelText("Buscar dúvida");
    await act(async () => {
      fireEvent.changeText(searchInput, "acompanhante");
    });

    expect(screen.getByText("Posso levar acompanhante no encontro?")).toBeDefined();
    expect(screen.queryByText("O Ipebook cobra alguma taxa ou comissão?")).toBeNull();

    await act(async () => {
      fireEvent.changeText(searchInput, "termoinexistentexyz");
    });

    expect(screen.getByText("Nenhuma dúvida encontrada para sua busca.")).toBeDefined();
    const clearBtn = screen.getByRole("button", { name: "Limpar busca" });
    await act(async () => {
      fireEvent.press(clearBtn);
    });

    expect(screen.getByText("Como funciona o Ipebook?")).toBeDefined();
  });
});
