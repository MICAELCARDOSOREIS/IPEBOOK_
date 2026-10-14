import { describe, expect, it } from "vitest";
import { MemoryAuthDataSource } from "@/infra/datasources/memoryAuthDataSource";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { AuthUseCases } from "@/usecase/authUseCases";
import { BookUseCases } from "@/usecase/bookUseCases";

describe("SC-001: criar conta, entrar, cadastrar anúncio de cada modalidade e ver na listagem", () => {
  it("cobre o fluxo completo pelas camadas reais (model → usecase → infra)", async () => {
    const auth = new AuthUseCases(new MemoryAuthDataSource());
    const books = new BookUseCases(new MemoryBookDataSource());

    const user = await auth.signUp("leitora@exemplo.com", "umasenha123");
    await expect(auth.getSession()).resolves.toEqual(user);

    const sessionUserId = user.id;

    const venda = await books.createListing(
      { title: "Dom Casmurro", author: "Machado de Assis", modality: "sale", price: 29.9 },
      sessionUserId,
    );
    const troca = await books.createListing(
      { title: "O Alquimista", author: "Paulo Coelho", modality: "trade" },
      sessionUserId,
    );
    const doacao = await books.createListing(
      { title: "Vidas Secas", author: "Graciliano Ramos", modality: "donation" },
      sessionUserId,
    );

    const listagem = await books.listBooks();

    expect(listagem).toHaveLength(3);
    expect(listagem).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: venda.id, modality: "sale", price: 29.9, ownerId: sessionUserId }),
        expect.objectContaining({ id: troca.id, modality: "trade", ownerId: sessionUserId }),
        expect.objectContaining({ id: doacao.id, modality: "donation", ownerId: sessionUserId }),
      ]),
    );
  });

  it("bloqueia o cadastro de anúncio sem sessão autenticada (FR-006)", async () => {
    const books = new BookUseCases(new MemoryBookDataSource());

    await expect(
      books.createListing({ title: "Livro", author: "Autor", modality: "donation" }, null),
    ).rejects.toThrow("Sessão obrigatória para cadastrar anúncio.");
  });

  it("exige preço maior que zero quando a modalidade é venda (FR-005)", async () => {
    const auth = new AuthUseCases(new MemoryAuthDataSource());
    const books = new BookUseCases(new MemoryBookDataSource());
    const user = await auth.signUp("vendedor@exemplo.com", "outrasenha1");

    await expect(
      books.createListing({ title: "Livro", author: "Autor", modality: "sale" }, user.id),
    ).rejects.toThrow();
  });
});
