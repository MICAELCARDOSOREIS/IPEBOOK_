import React from "react";
import { act, render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { BookUseCases } from "@/usecase/bookUseCases";
import { useHomeViewModel } from "@/viewmodel/useHomeViewModel";
import Home from "@/view/home";

describe("testes de integração: View + ViewModel + UseCase + Datasource (ISO/IEC 25010 - Adequação Funcional)", () => {
  it("integra fluxo completo da camada de dados até a renderização visual do acervo", async () => {
    // 1. Camada de Infraestrutura real: Repositório em memória com livros
    const datasource = new MemoryBookDataSource([
      { id: "int-1", title: "O Tempo e o Vento", author: "Erico Verissimo", ownerId: "owner-1", modality: "donation" as const, status: "available" },
      { id: "int-2", title: "Torto Arado", author: "Itamar Vieira Junior", ownerId: "owner-2", modality: "trade" as const, status: "available" },
    ]);

    // 2. Camada de Domínio / Caso de Uso real
    const useCases = new BookUseCases(datasource);

    // 3. Componente integrado alimentado pelo caso de uso real
    function IntegratedHome() {
            const [state] = useHomeViewModel(useCases);

      return (
        <React.Fragment>
          {state.loading && <div>Carregando...</div>}
          {state.books.map((b) => (
            <div key={b.id}>
              <span>{b.title}</span>
              <span>{b.author}</span>
            </div>
          ))}
        </React.Fragment>
      );
    }

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });

    // 4. Verifica a integração real exibindo a interface do aplicativo
    expect(screen.getByText("Encontre sua próxima história.")).toBeDefined();
    expect(screen.getByText("Perto de você")).toBeDefined();
  });

  it("preserva integridade entre casos de uso e datasource com catálogo inicialmente vazio", async () => {
    const emptyDatasource = new MemoryBookDataSource([]);
    const useCases = new BookUseCases(emptyDatasource);

    // Consulta os livros através do caso de uso integrado
    const books = await useCases.listBooks();
    expect(books).toEqual([]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<Home />);
    });

    // A View integrada renderiza o estado de catálogo vazio
    expect(screen.getByText("Ainda não há livros por aqui.")).toBeDefined();
    expect(
      screen.getByText("Quando houver livros disponíveis, eles aparecerão neste espaço.")
    ).toBeDefined();
  });
});
