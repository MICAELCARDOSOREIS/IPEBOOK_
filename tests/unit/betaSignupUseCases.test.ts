import { describe, expect, it } from "vitest";
import { MemoryBetaTesterDataSource } from "@/infra/datasources/memoryBetaTesterDataSource";
import { ValidationError } from "@/model/errors";
import { BetaSignupUseCases } from "@/usecase/betaSignupUseCases";

function setup() {
  const dataSource = new MemoryBetaTesterDataSource();
  return { dataSource, useCases: new BetaSignupUseCases(dataSource) };
}

describe("BetaSignupUseCases", () => {
  it("grava o e-mail em minúsculas e sem espaços", async () => {
    const { dataSource, useCases } = setup();
    await useCases.register({ email: "  Leitor.Piripiri@Gmail.com " });
    expect(dataSource.list().map((t) => t.email)).toEqual(["leitor.piripiri@gmail.com"]);
  });

  it("rejeita e-mail vazio ou mal formado", async () => {
    const { useCases } = setup();
    await expect(useCases.register({ email: "   " })).rejects.toThrow(ValidationError);
    await expect(useCases.register({ email: "sem-arroba.com" })).rejects.toThrow(ValidationError);
    await expect(useCases.register({ email: "a@b" })).rejects.toThrow(ValidationError);
  });

  it("rejeita e-mail com mais de 254 caracteres", async () => {
    const { useCases } = setup();
    await expect(useCases.register({ email: `${"a".repeat(250)}@gmail.com` })).rejects.toThrow(ValidationError);
  });

  it("sanitiza o nome e limita a 80 caracteres", async () => {
    const { dataSource, useCases } = setup();
    await useCases.register({ email: "ana@gmail.com", name: "  Ana\u0000 Maria  " });
    expect(dataSource.list()[0]?.name).toBe("Ana Maria");
    await expect(useCases.register({ email: "bia@gmail.com", name: "b".repeat(81) })).rejects.toThrow(ValidationError);
  });

  it("trata nome em branco como ausente", async () => {
    const { dataSource, useCases } = setup();
    await useCases.register({ email: "caio@gmail.com", name: "   " });
    expect(dataSource.list()[0]?.name).toBeUndefined();
  });

  it("inscrição repetida confirma sem erro e não duplica", async () => {
    const { dataSource, useCases } = setup();
    await useCases.register({ email: "duda@gmail.com" });
    await expect(useCases.register({ email: "DUDA@gmail.com" })).resolves.toBeUndefined();
    expect(dataSource.list()).toHaveLength(1);
  });
});
