import { describe, expect, it } from "vitest";
import { MemoryUserPreferencesDataSource } from "@/infra/datasources/memoryUserPreferencesDataSource";
import { ValidationError } from "@/model/errors";
import { UserPreferencesUseCases } from "@/usecase/userPreferencesUseCases";

describe("UserPreferencesUseCases (Spec 034 / Issue #141)", () => {
  const setup = () => new UserPreferencesUseCases(new MemoryUserPreferencesDataSource());

  it("exige um userId para consultar", async () => {
    const useCases = setup();
    await expect(useCases.getPreferences("")).rejects.toBeInstanceOf(ValidationError);
  });

  it("retorna preferências vazias quando ainda não existem", async () => {
    const useCases = setup();
    const preferences = await useCases.getPreferences("ana");
    expect(preferences).toEqual({ userId: "ana" });
  });

  it("exige um userId para atualizar", async () => {
    const useCases = setup();
    await expect(useCases.updatePreferences("", { phone: "86999998888" })).rejects.toBeInstanceOf(ValidationError);
  });

  it("salva telefone e bairro válidos", async () => {
    const useCases = setup();
    const updated = await useCases.updatePreferences("ana", { phone: "(86) 99999-8888", neighborhood: "Centro" });
    expect(updated).toEqual({ userId: "ana", phone: "86999998888", neighborhood: "Centro" });
  });

  it("rejeita telefone com poucos dígitos", async () => {
    const useCases = setup();
    await expect(useCases.updatePreferences("ana", { phone: "123" })).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejeita bairro fora da lista de Piripiri", async () => {
    const useCases = setup();
    await expect(useCases.updatePreferences("ana", { neighborhood: "Bairro Inventado" })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("permite limpar telefone e bairro com valores vazios", async () => {
    const useCases = setup();
    await useCases.updatePreferences("ana", { phone: "86999998888", neighborhood: "Centro" });
    const cleared = await useCases.updatePreferences("ana", { phone: "", neighborhood: "" });
    expect(cleared).toEqual({ userId: "ana" });
  });

  it("persiste as preferências entre consultas", async () => {
    const useCases = setup();
    await useCases.updatePreferences("ana", { phone: "86999998888", neighborhood: "Centro" });
    const reloaded = await useCases.getPreferences("ana");
    expect(reloaded).toEqual({ userId: "ana", phone: "86999998888", neighborhood: "Centro" });
  });

  it("salva pushToken e preserva telefone e bairro existentes", async () => {
    const useCases = setup();
    await useCases.updatePreferences("ana", { phone: "86999998888", neighborhood: "Centro" });
    const withToken = await useCases.updatePreferences("ana", { pushToken: "ExponentPushToken[123]" });
    expect(withToken).toEqual({
      userId: "ana",
      phone: "86999998888",
      neighborhood: "Centro",
      pushToken: "ExponentPushToken[123]",
    });

    const reloaded = await useCases.getPreferences("ana");
    expect(reloaded.pushToken).toBe("ExponentPushToken[123]");
  });

  it("preserva pushToken existente ao atualizar apenas telefone ou bairro", async () => {
    const useCases = setup();
    await useCases.updatePreferences("ana", { pushToken: "ExponentPushToken[123]" });
    const updated = await useCases.updatePreferences("ana", { phone: "86999998888", neighborhood: "Centro" });
    expect(updated).toEqual({
      userId: "ana",
      phone: "86999998888",
      neighborhood: "Centro",
      pushToken: "ExponentPushToken[123]",
    });
  });

  it("permite limpar pushToken passando null", async () => {
    const useCases = setup();
    await useCases.updatePreferences("ana", { pushToken: "ExponentPushToken[123]" });
    const cleared = await useCases.updatePreferences("ana", { pushToken: null });
    expect(cleared.pushToken).toBeNull();
  });
});
