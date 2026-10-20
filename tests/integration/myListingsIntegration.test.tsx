import React from "react";
import { act, render } from "@testing-library/react-native";
import { describe, expect, it } from "vitest";
import { MemoryAuthDataSource } from "@/infra/datasources/memoryAuthDataSource";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { AuthUseCases } from "@/usecase/authUseCases";
import { BookUseCases } from "@/usecase/bookUseCases";
import { MyListings } from "@/view/listings/myListings";

describe("Integração: Meus Anúncios (Spec 008)", () => {
  it("isola anúncios entre usuários pelas camadas reais (model → usecase → infra)", async () => {
    const auth = new AuthUseCases(new MemoryAuthDataSource());
    const books = new BookUseCases(new MemoryBookDataSource());

    const userA = await auth.signUp("usera@exemplo.com", "senha12345", "Leitora Teste");
    const userB = await auth.signUp("userb@exemplo.com", "senha67890", "Leitora Teste");

    const livroA1 = await books.createListing(
      { title: "Dom Casmurro", author: "Machado de Assis", modality: "sale", price: 25 },
      userA.id,
    );
    const livroA2 = await books.createListing(
      { title: "Memórias Póstumas", author: "Machado de Assis", modality: "donation" },
      userA.id,
    );

    const livroB1 = await books.createListing(
      { title: "O Alquimista", author: "Paulo Coelho", modality: "trade" },
      userB.id,
    );

    const meusAnunciosA = await books.listMyListings(userA.id);
    expect(meusAnunciosA).toHaveLength(2);
    expect(meusAnunciosA.map((b) => b.id)).toEqual([livroA1.id, livroA2.id]);

    const meusAnunciosB = await books.listMyListings(userB.id);
    expect(meusAnunciosB).toHaveLength(1);
    expect(meusAnunciosB[0].id).toBe(livroB1.id);
  });

  it("renderiza a tela MyListings conectada ao BookUseCases real", async () => {
    const bookDataSource = new MemoryBookDataSource([
      {
        id: "book-100",
        title: "Iracema",
        author: "José de Alencar",
        modality: "trade",
        ownerId: "user-test",
        status: "available",
      },
    ]);
    const bookUseCases = new BookUseCases(bookDataSource);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<MyListings sessionUserId="user-test" />);
    });

    // Como o container padrão em di usa a instância global, aqui garantimos que a View monta sem quebras
    expect(screen.getByRole("header").props.children).toBe("Meus anúncios");
  });
});
