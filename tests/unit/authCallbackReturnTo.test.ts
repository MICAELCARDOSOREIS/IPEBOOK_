import { describe, expect, it, beforeEach, vi } from "vitest";
import { consumeAuthReturnTo, setAuthReturnTo } from "@/view/auth/authReturnTo";

describe("authReturnTo (Spec 108: preservação da rota de retorno OAuth)", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      sessionStorage: {
        _data: {} as Record<string, string>,
        getItem(key: string) {
          return this._data[key] ?? null;
        },
        setItem(key: string, val: string) {
          this._data[key] = val;
        },
        removeItem(key: string) {
          delete this._data[key];
        },
      },
    });
  });

  it("salva e consome auth_return_to retornando para /beta", () => {
    setAuthReturnTo("/beta");
    expect(consumeAuthReturnTo("/")).toBe("/beta");
    // Após consumir, uma segunda chamada devolve o fallback
    expect(consumeAuthReturnTo("/")).toBe("/");
  });

  it("retorna fallback quando nenhuma rota foi salva", () => {
    expect(consumeAuthReturnTo("/")).toBe("/");
    expect(consumeAuthReturnTo("/bem-vindo")).toBe("/bem-vindo");
  });
});
