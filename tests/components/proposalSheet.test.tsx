import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { ProposalSheet } from "@/view/listings/ProposalSheet";
import { ThemeProvider } from "@/view/theme/ThemeProvider";
import type { Book } from "@/model/entities/book";

describe("ProposalSheet (Spec 113)", () => {
  const targetTradeBook: Book = {
    id: "b1",
    title: "Grande Sertão: Veredas",
    author: "Guimarães Rosa",
    ownerId: "other-user",
    modality: "trade",
    status: "available",
  };

  const targetSaleBook: Book = {
    ...targetTradeBook,
    id: "b2",
    title: "Capitães da Areia",
    author: "Jorge Amado",
    modality: "sale",
    price: 30,
  };

  const userBooks: Book[] = [
    {
      id: "ub1",
      title: "Dom Casmurro",
      author: "Machado de Assis",
      ownerId: "my-user",
      modality: "trade",
      status: "available",
    },
    {
      id: "ub2",
      title: "O Alquimista",
      author: "Paulo Coelho",
      ownerId: "my-user",
      modality: "trade",
      status: "available",
    },
  ];

  it("renderiza cabeçalho e campo de mensagem para livro de venda/doação", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <ProposalSheet
            visible={true}
            onClose={vi.fn()}
            targetBook={targetSaleBook}
            onSubmit={vi.fn()}
          />
        </ThemeProvider>,
      );
    });

    expect(screen.getByRole("header", { name: "Solicitar Negociação" })).toBeDefined();
    expect(screen.getByLabelText("Mensagem inicial da proposta")).toBeDefined();
    expect(screen.queryByText(/oferecer um livro/i)).toBeNull();
  });

  it("renderiza opções de livros do usuário quando o anúncio é de troca", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <ProposalSheet
            visible={true}
            onClose={vi.fn()}
            targetBook={targetTradeBook}
            userBooks={userBooks}
            onSubmit={vi.fn()}
          />
        </ThemeProvider>,
      );
    });

    expect(screen.getByRole("header", { name: "Proposta de Troca" })).toBeDefined();
    expect(screen.getByText(/oferecer um livro/i)).toBeDefined();
    expect(screen.getByText("Dom Casmurro")).toBeDefined();
    expect(screen.getByText("O Alquimista")).toBeDefined();
  });

  it("mostra loading de livros quando loadingBooks for true", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <ProposalSheet
            visible={true}
            onClose={vi.fn()}
            targetBook={targetTradeBook}
            loadingBooks={true}
            onSubmit={vi.fn()}
          />
        </ThemeProvider>,
      );
    });

    expect(screen.getByText("Carregando seus livros…")).toBeDefined();
  });

  it("mostra mensagem informativa quando o usuário não tiver livros disponíveis para troca", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <ProposalSheet
            visible={true}
            onClose={vi.fn()}
            targetBook={targetTradeBook}
            userBooks={[]}
            onSubmit={vi.fn()}
          />
        </ThemeProvider>,
      );
    });

    expect(
      screen.getByText(/você não tem livros disponíveis cadastrados para oferecer agora/i),
    ).toBeDefined();
  });

  it("exibe mensagem de erro quando repassada via prop error", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <ProposalSheet
            visible={true}
            onClose={vi.fn()}
            targetBook={targetTradeBook}
            error="Erro ao processar a proposta."
            onSubmit={vi.fn()}
          />
        </ThemeProvider>,
      );
    });

    expect(screen.getByText("Erro ao processar a proposta.")).toBeDefined();
  });

  it("permite selecionar e desmarcar livro de troca voltando para nenhum específico", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <ProposalSheet
            visible={true}
            onClose={vi.fn()}
            targetBook={targetTradeBook}
            userBooks={userBooks}
            onSubmit={onSubmit}
          />
        </ThemeProvider>,
      );
    });

    // Seleciona livro
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Oferecer Dom Casmurro"));
    });

    // Desmarca voltando para nenhum livro específico
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Nenhum livro de troca"));
    });

    // Submete proposta
    const submitBtn = screen.getByRole("button", { name: "Enviar proposta de troca" });
    await act(async () => {
      fireEvent.press(submitBtn);
    });

    expect(onSubmit).toHaveBeenCalledWith({
      initialMessage: undefined,
      offeredBookId: undefined,
    });
  });

  it("envia mensagem e livro selecionado no onSubmit", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <ProposalSheet
            visible={true}
            onClose={vi.fn()}
            targetBook={targetTradeBook}
            userBooks={userBooks}
            onSubmit={onSubmit}
          />
        </ThemeProvider>,
      );
    });

    // Digita mensagem
    const input = screen.getByLabelText("Mensagem inicial da proposta");
    await act(async () => {
      fireEvent.changeText(input, "Olá, tenho interesse e posso encontrar amanhã na praça.");
    });

    // Seleciona livro
    const bookOption = screen.getByLabelText("Oferecer Dom Casmurro");
    await act(async () => {
      fireEvent.press(bookOption);
    });

    // Submete proposta
    const submitBtn = screen.getByRole("button", { name: "Enviar proposta de troca" });
    await act(async () => {
      fireEvent.press(submitBtn);
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      initialMessage: "Olá, tenho interesse e posso encontrar amanhã na praça.",
      offeredBookId: "ub1",
    });
  });

  it("aciona onClose ao clicar em Cancelar ou no botão fechar do topo", async () => {
    const onClose = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <ProposalSheet
            visible={true}
            onClose={onClose}
            targetBook={targetSaleBook}
            onSubmit={vi.fn()}
          />
        </ThemeProvider>,
      );
    });

    const cancelBtn = screen.getByRole("button", { name: "Cancelar" });
    await act(async () => {
      fireEvent.press(cancelBtn);
    });
    expect(onClose).toHaveBeenCalledTimes(1);

    const closeBtn = screen.getByRole("button", { name: "Fechar" });
    await act(async () => {
      fireEvent.press(closeBtn);
    });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
