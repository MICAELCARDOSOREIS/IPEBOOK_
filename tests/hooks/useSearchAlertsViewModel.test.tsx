import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ALL_ALERT_MODALITIES, type SearchAlert } from "@/model/entities/searchAlert";
import { DomainError } from "@/model/errors";
import type { ISearchAlertUseCases } from "@/usecase/iSearchAlertUseCases";
import { useSearchAlertsViewModel } from "@/viewmodel/useSearchAlertsViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

async function renderHook(userId: string | null, useCases: ISearchAlertUseCases, initialQuery = "") {
  let result!: ReturnType<typeof useSearchAlertsViewModel>;
  function HookProbe() {
    result = useSearchAlertsViewModel(userId, initialQuery, useCases);
    return null;
  }
  await act(async () => {
    mounted.push(create(createElement(HookProbe)));
  });
  return {
    get current() {
      return result;
    },
  };
}

afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
});

const alerta: SearchAlert = {
  id: "a1",
  userId: "bia",
  query: "dom casmurro",
  active: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  modalities: ALL_ALERT_MODALITIES,
};

function casosDeUso(parcial: Partial<ISearchAlertUseCases> = {}): ISearchAlertUseCases {
  return {
    listAlerts: async () => [alerta],
    createAlert: async () => alerta,
    updateAlert: async () => undefined,
    setActive: async () => undefined,
    deleteAlert: async () => undefined,
    matchNewBook: async () => undefined,
    ...parcial,
  };
}

const falhaDominio = (mensagem: string) => async () => {
  throw new DomainError(mensagem);
};
const falhaGenerica = async () => {
  throw new Error("rede");
};

describe("useSearchAlertsViewModel", () => {
  it("sem sessão não lista alertas e não fica carregando", async () => {
    const listAlerts = vi.fn(async () => [alerta]);
    const hook = await renderHook(null, casosDeUso({ listAlerts }));

    expect(listAlerts).not.toHaveBeenCalled();
    expect(hook.current[0].loading).toBe(false);
    expect(hook.current[0].alerts).toEqual([]);
  });

  it("carrega os alertas e respeita o termo inicial", async () => {
    const hook = await renderHook("bia", casosDeUso(), "poesia");

    expect(hook.current[0].alerts).toEqual([alerta]);
    expect(hook.current[0].query).toBe("poesia");
  });

  it("mostra erro de domínio e genérico ao carregar", async () => {
    const dominio = await renderHook("bia", casosDeUso({ listAlerts: falhaDominio("Sem acesso.") }));
    expect(dominio.current[0].error).toBe("Sem acesso.");

    const generico = await renderHook("bia", casosDeUso({ listAlerts: falhaGenerica }));
    expect(generico.current[0].error).toBe("Não foi possível carregar alertas.");
  });

  it("setQuery altera o termo e limpa o erro", async () => {
    const hook = await renderHook("bia", casosDeUso({ listAlerts: falhaGenerica }));

    await act(async () => {
      hook.current[1].setQuery("novo");
    });

    expect(hook.current[0].query).toBe("novo");
    expect(hook.current[0].error).toBeNull();
  });

  it("create envia o termo digitado, limpa o campo e recarrega", async () => {
    const createAlert = vi.fn(async () => alerta);
    const listAlerts = vi.fn(async () => [alerta]);
    const hook = await renderHook("bia", casosDeUso({ createAlert, listAlerts }));

    await act(async () => {
      hook.current[1].setQuery("memórias");
    });
    let ok = false;
    await act(async () => {
      ok = await hook.current[1].create();
    });

    expect(ok).toBe(true);
    expect(createAlert).toHaveBeenCalledWith("bia", "memórias");
    expect(listAlerts).toHaveBeenCalledTimes(2);
    expect(hook.current[0].query).toBe("");
    expect(hook.current[0].message).toBe("Alerta criado. Avisaremos quando um livro aparecer.");
  });

  it("create falha com mensagem de domínio ou genérica", async () => {
    const dominio = await renderHook("bia", casosDeUso({ createAlert: falhaDominio("Termo curto.") }));
    let ok = true;
    await act(async () => {
      ok = await dominio.current[1].create();
    });
    expect(ok).toBe(false);
    expect(dominio.current[0].error).toBe("Termo curto.");

    const generico = await renderHook("bia", casosDeUso({ createAlert: falhaGenerica }));
    await act(async () => {
      await generico.current[1].create();
    });
    expect(generico.current[0].error).toBe("Não foi possível criar o alerta.");
  });

  it("update repassa termo e modalidades e confirma a mensagem", async () => {
    const updateAlert = vi.fn(async () => undefined);
    const hook = await renderHook("bia", casosDeUso({ updateAlert }));

    let ok = false;
    await act(async () => {
      ok = await hook.current[1].update("a1", "contos", ["donation"]);
    });

    expect(ok).toBe(true);
    expect(updateAlert).toHaveBeenCalledWith("bia", "a1", "contos", ["donation"]);
    expect(hook.current[0].message).toBe("Alerta atualizado.");
  });

  it("update falha com mensagem de domínio ou genérica", async () => {
    const dominio = await renderHook("bia", casosDeUso({ updateAlert: falhaDominio("Alerta inexistente.") }));
    let ok = true;
    await act(async () => {
      ok = await dominio.current[1].update("a1", "x");
    });
    expect(ok).toBe(false);
    expect(dominio.current[0].error).toBe("Alerta inexistente.");

    const generico = await renderHook("bia", casosDeUso({ updateAlert: falhaGenerica }));
    await act(async () => {
      await generico.current[1].update("a1", "x");
    });
    expect(generico.current[0].error).toBe("Não foi possível atualizar o alerta.");
  });

  it("setActive pausa o alerta e recarrega a lista", async () => {
    const setActive = vi.fn(async () => undefined);
    const listAlerts = vi.fn(async () => [alerta]);
    const hook = await renderHook("bia", casosDeUso({ setActive, listAlerts }));

    await act(async () => {
      await hook.current[1].setActive("a1", false);
    });

    expect(setActive).toHaveBeenCalledWith("bia", "a1", false);
    expect(listAlerts).toHaveBeenCalledTimes(2);
  });

  it("setActive mostra o erro quando falha", async () => {
    const dominio = await renderHook("bia", casosDeUso({ setActive: falhaDominio("Não permitido.") }));
    await act(async () => {
      await dominio.current[1].setActive("a1", true);
    });
    expect(dominio.current[0].error).toBe("Não permitido.");

    const generico = await renderHook("bia", casosDeUso({ setActive: falhaGenerica }));
    await act(async () => {
      await generico.current[1].setActive("a1", true);
    });
    expect(generico.current[0].error).toBe("Não foi possível atualizar o alerta.");
  });

  it("remove exclui o alerta e recarrega a lista", async () => {
    const deleteAlert = vi.fn(async () => undefined);
    const hook = await renderHook("bia", casosDeUso({ deleteAlert }));

    let ok = false;
    await act(async () => {
      ok = await hook.current[1].remove("a1");
    });

    expect(ok).toBe(true);
    expect(deleteAlert).toHaveBeenCalledWith("bia", "a1");
  });

  it("remove mostra o erro quando falha", async () => {
    const dominio = await renderHook("bia", casosDeUso({ deleteAlert: falhaDominio("Alerta de outra pessoa.") }));
    let ok = true;
    await act(async () => {
      ok = await dominio.current[1].remove("a1");
    });
    expect(ok).toBe(false);
    expect(dominio.current[0].error).toBe("Alerta de outra pessoa.");

    const generico = await renderHook("bia", casosDeUso({ deleteAlert: falhaGenerica }));
    await act(async () => {
      await generico.current[1].remove("a1");
    });
    expect(generico.current[0].error).toBe("Não foi possível excluir o alerta.");
  });
});
