import { describe, expect, it } from "vitest";
import { MemoryBookDataSource } from "@/infra/datasources/memoryBookDataSource";
import { MemoryFavoriteDataSource } from "@/infra/datasources/memoryFavoriteDataSource";
import { MemoryNotificationDataSource } from "@/infra/datasources/memoryNotificationDataSource";
import { MemorySearchAlertDataSource } from "@/infra/datasources/memorySearchAlertDataSource";
import { AuthError, ValidationError } from "@/model/errors";
import { BookUseCases } from "@/usecase/bookUseCases";
import { FavoriteUseCases } from "@/usecase/favoriteUseCases";
import { SearchAlertUseCases } from "@/usecase/searchAlertUseCases";

describe("favoritos", () => {
  it("impede acesso sem sessão e isola os favoritos de cada pessoa", async () => {
    const books = new MemoryBookDataSource();
    const book = await books.create({ title: "Livro", author: "Autora", ownerId: "owner", modality: "donation", status: "available" });
    const useCases = new FavoriteUseCases(new MemoryFavoriteDataSource(), books);
    await expect(useCases.toggleFavorite(null, book.id)).rejects.toThrow(AuthError);
    expect(await useCases.toggleFavorite("reader", book.id)).toBe(true);
    expect(await useCases.listFavorites("reader")).toEqual([book]);
    expect(await useCases.listFavorites("other")).toEqual([]);
    expect(await useCases.toggleFavorite("reader", book.id)).toBe(false);
    expect(await useCases.listFavorites("reader")).toEqual([]);
  });
});

describe("alertas de busca", () => {
  it("valida o termo, permite pausar e não avisa o dono do anúncio", async () => {
    const notifications = new MemoryNotificationDataSource([]);
    const source = new MemorySearchAlertDataSource(notifications);
    const alerts = new SearchAlertUseCases(source);
    const books = new BookUseCases(new MemoryBookDataSource(), alerts);
    await expect(alerts.createAlert(null, "Casmurro")).rejects.toThrow(AuthError);
    await expect(alerts.createAlert("reader", " ")).rejects.toThrow(ValidationError);
    const active = await alerts.createAlert("reader", "Casmurro");
    await alerts.createAlert("owner", "Casmurro");
    await books.createListing({ title: "Dom Casmurro", author: "Machado de Assis", modality: "donation" }, "owner");
    const messages = await notifications.listByUser("reader");
    expect(messages).toHaveLength(1);
    expect(messages[0].type).toBe("search_alert_match");
    expect(messages[0].actionUrl).toMatch(/^\/livro\//);
    expect(await notifications.listByUser("owner")).toEqual([]);
    await alerts.setActive("reader", active.id, false);
    await books.createListing({ title: "Novo Casmurro", author: "Autora", modality: "trade" }, "owner");
    expect(await notifications.listByUser("reader")).toHaveLength(1);
    await alerts.deleteAlert("reader", active.id);
    expect(await alerts.listAlerts("reader")).toEqual([]);
  });

  it("edita o termo do alerta, exige posse e revalida a entrada", async () => {
    const notifications = new MemoryNotificationDataSource([]);
    const source = new MemorySearchAlertDataSource(notifications);
    const alerts = new SearchAlertUseCases(source);
    const books = new BookUseCases(new MemoryBookDataSource(), alerts);
    const own = await alerts.createAlert("reader", "Casmurro");
    await expect(alerts.updateAlert(null, own.id, "Iracema")).rejects.toThrow(AuthError);
    await expect(alerts.updateAlert("reader", own.id, " ")).rejects.toThrow(ValidationError);
    await alerts.updateAlert("intruso", own.id, "Iracema");
    expect((await alerts.listAlerts("reader"))[0].query).toBe("Casmurro");
    await alerts.updateAlert("reader", own.id, "Iracema");
    expect((await alerts.listAlerts("reader"))[0].query).toBe("Iracema");
    await books.createListing({ title: "Dom Casmurro", author: "Machado de Assis", modality: "donation" }, "owner");
    expect(await notifications.listByUser("reader")).toEqual([]);
    await books.createListing({ title: "Iracema", author: "José de Alencar", modality: "donation" }, "owner");
    expect(await notifications.listByUser("reader")).toHaveLength(1);
  });

  it("avisa também quando o termo aparece na categoria", async () => {
    const notifications = new MemoryNotificationDataSource([]);
    const alerts = new SearchAlertUseCases(new MemorySearchAlertDataSource(notifications));
    const books = new BookUseCases(new MemoryBookDataSource(), alerts);
    await alerts.createAlert("reader-category", "Romance");
    await books.createListing({ title: "Livro qualquer", author: "Pessoa", category: "Romance", modality: "donation" }, "owner-category");
    expect(await notifications.listByUser("reader-category")).toHaveLength(1);
  });

  it("só avisa para modalidades escolhidas e rejeita seleção vazia", async () => {
    const notifications = new MemoryNotificationDataSource([]);
    const alerts = new SearchAlertUseCases(new MemorySearchAlertDataSource(notifications));
    const books = new BookUseCases(new MemoryBookDataSource(), alerts);
    await expect(alerts.createAlert("reader", "Casmurro", [])).rejects.toThrow("Selecione pelo menos um tipo.");
    const alert = await alerts.createAlert("reader", "Casmurro", ["sale"]);
    await expect(alerts.updateAlert("reader", alert.id, "Casmurro", [])).rejects.toThrow("Selecione pelo menos um tipo.");
    await books.createListing({ title: "Dom Casmurro", author: "Machado", modality: "donation" }, "owner");
    expect(await notifications.listByUser("reader")).toHaveLength(0);
    await books.createListing({ title: "Dom Casmurro", author: "Machado", modality: "sale", price: 20 }, "owner");
    expect(await notifications.listByUser("reader")).toHaveLength(1);
  });
});
