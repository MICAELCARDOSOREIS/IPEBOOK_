import { describe, expect, it, vi } from "vitest";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { AuthError, DataSourceError, ValidationError } from "@/model/errors";
import { BookUseCases } from "@/usecase/bookUseCases";

// Spec 017 — Rascunhos de anúncio persistidos no servidor (Book com status 'draft').

describe("listMyListings ignora rascunhos (Spec 017)", () => {
  it("devolve apenas anúncios publicados, nunca rascunhos", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    await useCases.createListing({ title: "Publicado", author: "Autor Real", modality: "donation" }, "owner-1");
    await useCases.saveDraft({ title: "Incompleto", author: "", modality: "donation" }, "owner-1");

    const myListings = await useCases.listMyListings("owner-1");
    expect(myListings).toHaveLength(1);
    expect(myListings[0].status).toBe("available");
  });
});

describe("listDrafts (Spec 017)", () => {
  it("exige sessão autenticada", async () => {
    const useCases = new BookUseCases(new MemoryBookDataSource());
    await expect(useCases.listDrafts(null)).rejects.toThrow(AuthError);
  });

  it("lista apenas os rascunhos do dono", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    await useCases.createListing({ title: "Publicado", author: "Autor Real", modality: "donation" }, "owner-1");
    const draft = await useCases.saveDraft({ title: "Só o título", author: "", modality: "trade" }, "owner-1");

    const drafts = await useCases.listDrafts("owner-1");
    expect(drafts).toHaveLength(1);
    expect(drafts[0].id).toBe(draft.id);
    expect(drafts[0].status).toBe("draft");
  });
});

describe("saveDraft (Spec 017)", () => {
  it("exige sessão para salvar rascunho", async () => {
    const useCases = new BookUseCases(new MemoryBookDataSource());
    await expect(useCases.saveDraft({ title: "x", author: "y", modality: "donation" }, null)).rejects.toThrow(
      AuthError,
    );
  });

  it("aceita rascunho incompleto (sem título/autor/preço) e marca status draft", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);

    const draft = await useCases.saveDraft({ title: "", author: "", modality: "sale", draftStep: 2 }, "owner-9");

    expect(draft.status).toBe("draft");
    expect(draft.ownerId).toBe("owner-9");
    expect(draft.draftStep).toBe(2);
    // Rascunho não aparece no catálogo público.
    expect(await useCases.listBooks()).toHaveLength(0);
  });

  it("rejeita rascunho com modalidade inválida", async () => {
    const useCases = new BookUseCases(new MemoryBookDataSource());
    await expect(
      useCases.saveDraft({ title: "a", author: "b", modality: "invalida" as never }, "owner-1"),
    ).rejects.toThrow(ValidationError);
  });

  it("atualiza o mesmo rascunho quando recebe draftId em vez de criar outro", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const primeiro = await useCases.saveDraft({ title: "Começo", author: "", modality: "donation", draftStep: 1 }, "owner-1");

    const atualizado = await useCases.saveDraft(
      { title: "Começo melhorado", author: "Autor parcial", modality: "donation", draftId: primeiro.id, draftStep: 3 },
      "owner-1",
    );

    expect(atualizado.id).toBe(primeiro.id);
    expect(atualizado.draftStep).toBe(3);
    expect(await useCases.listDrafts("owner-1")).toHaveLength(1);
  });

  it("impede editar rascunho de outra pessoa", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const draft = await useCases.saveDraft({ title: "Meu", author: "", modality: "donation" }, "owner-1");

    await expect(
      useCases.saveDraft({ title: "Invasão", author: "", modality: "donation", draftId: draft.id }, "invasor"),
    ).rejects.toThrow(AuthError);
  });

  it("recusa reutilizar draftId que já não é rascunho", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const publicado = await useCases.createListing({ title: "Já Publicado", author: "Autor", modality: "donation" }, "owner-1");

    await expect(
      useCases.saveDraft({ title: "x", author: "y", modality: "donation", draftId: publicado.id }, "owner-1"),
    ).rejects.toThrow(ValidationError);
  });

  it("lança erro quando o draftId informado não existe", async () => {
    const useCases = new BookUseCases(new MemoryBookDataSource());
    await expect(
      useCases.saveDraft({ title: "x", author: "y", modality: "donation", draftId: "fantasma" }, "owner-1"),
    ).rejects.toThrow(DataSourceError);
  });
});

describe("discardDraft (Spec 017)", () => {
  it("exige sessão e id", async () => {
    const useCases = new BookUseCases(new MemoryBookDataSource());
    await expect(useCases.discardDraft("id", null)).rejects.toThrow(AuthError);
    await expect(useCases.discardDraft("", "owner-1")).rejects.toThrow(ValidationError);
  });

  it("remove rascunho do próprio dono", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const draft = await useCases.saveDraft({ title: "", author: "", modality: "donation" }, "owner-1");

    await useCases.discardDraft(draft.id, "owner-1");
    expect(await useCases.listDrafts("owner-1")).toHaveLength(0);
  });

  it("impede descartar rascunho alheio", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const draft = await useCases.saveDraft({ title: "", author: "", modality: "donation" }, "owner-1");

    await expect(useCases.discardDraft(draft.id, "invasor")).rejects.toThrow(AuthError);
  });

  it("recusa descartar anúncio publicado como se fosse rascunho", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const publicado = await useCases.createListing({ title: "Real", author: "Autor", modality: "donation" }, "owner-1");

    await expect(useCases.discardDraft(publicado.id, "owner-1")).rejects.toThrow(ValidationError);
  });

  it("lança erro quando o rascunho não existe", async () => {
    const useCases = new BookUseCases(new MemoryBookDataSource());
    await expect(useCases.discardDraft("inexistente", "owner-1")).rejects.toThrow(DataSourceError);
  });
});

describe("publishDraft (Spec 017)", () => {
  it("publica rascunho válido transicionando para available", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const draft = await useCases.saveDraft({ title: "", author: "", modality: "donation", draftStep: 1 }, "owner-1");

    const publicado = await useCases.publishDraft(
      draft.id,
      { title: "Dom Casmurro", author: "Machado de Assis", modality: "donation" },
      "owner-1",
    );

    expect(publicado.status).toBe("available");
    expect(publicado.title).toBe("Dom Casmurro");
    expect(await useCases.listDrafts("owner-1")).toHaveLength(0);
    expect(await useCases.listBooks()).toHaveLength(1);
  });

  it("dispara alerta de correspondência ao publicar (matchNewBook)", async () => {
    const source = new MemoryBookDataSource();
    const matchNewBook = vi.fn().mockResolvedValue(undefined);
    const useCases = new BookUseCases(source, { matchNewBook } as never);
    const draft = await useCases.saveDraft({ title: "", author: "", modality: "donation" }, "owner-1");

    await useCases.publishDraft(draft.id, { title: "Vidas Secas", author: "Graciliano Ramos", modality: "donation" }, "owner-1");
    expect(matchNewBook).toHaveBeenCalledTimes(1);
  });

  it("valida payload completo na publicação", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const draft = await useCases.saveDraft({ title: "", author: "", modality: "sale" }, "owner-1");

    await expect(
      useCases.publishDraft(draft.id, { title: "", author: "", modality: "sale" }, "owner-1"),
    ).rejects.toThrow(ValidationError);
  });

  it("impede publicar rascunho de outra pessoa", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const draft = await useCases.saveDraft({ title: "", author: "", modality: "donation" }, "owner-1");

    await expect(
      useCases.publishDraft(draft.id, { title: "Roubo", author: "Invasor", modality: "donation" }, "invasor"),
    ).rejects.toThrow(AuthError);
  });

  it("recusa publicar duas vezes o mesmo rascunho", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const draft = await useCases.saveDraft({ title: "", author: "", modality: "donation" }, "owner-1");
    await useCases.publishDraft(draft.id, { title: "Livro", author: "Autor", modality: "donation" }, "owner-1");

    await expect(
      useCases.publishDraft(draft.id, { title: "Livro", author: "Autor", modality: "donation" }, "owner-1"),
    ).rejects.toThrow(ValidationError);
  });

  it("exige draftId e sessão na publicação", async () => {
    const source = new MemoryBookDataSource();
    const useCases = new BookUseCases(source);
    const draft = await useCases.saveDraft({ title: "", author: "", modality: "donation" }, "owner-1");

    await expect(
      useCases.publishDraft("", { title: "Livro", author: "Autor", modality: "donation" }, "owner-1"),
    ).rejects.toThrow(ValidationError);
    await expect(
      useCases.publishDraft(draft.id, { title: "Livro", author: "Autor", modality: "donation" }, null),
    ).rejects.toThrow(AuthError);
    await expect(
      useCases.publishDraft("inexistente", { title: "Livro", author: "Autor", modality: "donation" }, "owner-1"),
    ).rejects.toThrow(DataSourceError);
  });
});
