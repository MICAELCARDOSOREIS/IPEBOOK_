import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("expo-router", () => ({ router: { push: vi.fn(), replace: vi.fn(), back: vi.fn() } }));

import { router } from "expo-router";
import { backOnce, pushOnce, replaceOnce, _resetPushOnceState } from "@/view/pushOnce";

describe("pushOnce (Spec 091 / Spec 113)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-27T12:00:00"));
    _resetPushOnceState();
    vi.mocked(router.push).mockClear();
    vi.mocked(router.replace).mockClear();
    vi.mocked(router.back).mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("ignora o mesmo destino em duplo toque e aceita de novo depois da janela", () => {
    pushOnce("/conversa/aaa" as never);
    pushOnce("/conversa/aaa" as never);
    expect(router.push).toHaveBeenCalledTimes(1);
    vi.setSystemTime(new Date("2026-10-27T12:00:01"));
    pushOnce("/conversa/aaa" as never);
    expect(router.push).toHaveBeenCalledTimes(2);
  });

  it("bloqueia triplo clique rápido para o mesmo destino sem abrir 2 ou 3 vezes", () => {
    pushOnce("/livro/123" as never); // 1º toque (executa)
    vi.setSystemTime(new Date("2026-10-27T12:00:00.250"));
    pushOnce("/livro/123" as never); // 2º toque (bloqueia e renova bloqueio)
    vi.setSystemTime(new Date("2026-10-27T12:00:00.500"));
    pushOnce("/livro/123" as never); // 3º toque (continua bloqueado)
    vi.setSystemTime(new Date("2026-10-27T12:00:00.700"));
    pushOnce("/livro/123" as never); // 4º toque consecutivo
    expect(router.push).toHaveBeenCalledTimes(1);

    // Só aceita após decorrida a janela de 800ms sem novos toques
    vi.setSystemTime(new Date("2026-10-27T12:00:02.000"));
    pushOnce("/livro/123" as never);
    expect(router.push).toHaveBeenCalledTimes(2);
  });

  it("não bloqueia destinos diferentes em testes unitários", () => {
    pushOnce("/livro/1" as never);
    pushOnce("/livro/2" as never);
    expect(router.push).toHaveBeenCalledTimes(2);
  });

  it("reconhece o mesmo destino em formatos alternativos (objeto vs string e parâmetros ordenados)", () => {
    // 1º toque via objeto
    pushOnce({ pathname: "/pesquisa", params: { categoria: "Ficção", bairro: "Centro" } } as never);
    expect(router.push).toHaveBeenCalledTimes(1);

    // 2º toque rápido via string com query equivalente
    pushOnce("/pesquisa?bairro=Centro&categoria=Ficção" as never);
    expect(router.push).toHaveBeenCalledTimes(1);

    // 3º toque rápido via objeto com ordem inversa de chaves
    pushOnce({ pathname: "/pesquisa", params: { bairro: "Centro", categoria: "Ficção" } } as never);
    expect(router.push).toHaveBeenCalledTimes(1);

    // 4º toque rápido para rota dinâmica interpolada
    _resetPushOnceState();
    pushOnce({ pathname: "/alertas/[id]", params: { id: "xyz" } } as never);
    expect(router.push).toHaveBeenCalledTimes(2);
    pushOnce("/alertas/xyz" as never);
    expect(router.push).toHaveBeenCalledTimes(2); // Bloqueado, mesma rota canônica
  });

  it("normaliza barras finais redundantes", () => {
    pushOnce("/sobre/" as never);
    expect(router.push).toHaveBeenCalledTimes(1);
    pushOnce("/sobre" as never);
    expect(router.push).toHaveBeenCalledTimes(1);
  });
});

describe("backOnce e replaceOnce (Spec 092 / Spec 113)", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-27T13:00:00"));
    _resetPushOnceState();
    vi.mocked(router.push).mockClear();
    vi.mocked(router.replace).mockClear();
    vi.mocked(router.back).mockClear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("backOnce ignora duplo e triplo toque consecutivo", () => {
    backOnce(); // 1º clique
    vi.setSystemTime(new Date("2026-10-27T13:00:00.200"));
    backOnce(); // 2º clique
    vi.setSystemTime(new Date("2026-10-27T13:00:00.400"));
    backOnce(); // 3º clique
    expect(router.back).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date("2026-10-27T13:00:02"));
    backOnce();
    expect(router.back).toHaveBeenCalledTimes(2);
  });

  it("replaceOnce bloqueia repetições do mesmo destino e aceita destinos distintos", () => {
    replaceOnce("/entrar" as never);
    replaceOnce("/entrar" as never);
    vi.setSystemTime(new Date("2026-10-27T13:00:00.300"));
    replaceOnce("/entrar" as never);
    expect(router.replace).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date("2026-10-27T13:00:02"));
    replaceOnce({ pathname: "/alertas", params: { termo: "a" } } as never);
    expect(router.replace).toHaveBeenCalledTimes(2);
  });

  it("bloqueia push repetido quando um replace recente para o mesmo destino ocorreu", () => {
    replaceOnce("/entrar" as never);
    expect(router.replace).toHaveBeenCalledTimes(1);

    pushOnce("/entrar" as never);
    expect(router.push).not.toHaveBeenCalled(); // Bloqueado pois é o mesmo destino canônico recente
  });
});
