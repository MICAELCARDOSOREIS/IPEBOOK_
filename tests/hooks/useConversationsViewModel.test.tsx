import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Book } from "@/model/entities/book";
import type { NegotiationMessage } from "@/model/entities/negotiationMessage";
import type { RequestWithListing } from "@/usecase/iBookRequestUseCases";
import {
  formatConversationTime,
  useConversationsViewModel,
  type ConversationsDeps,
} from "@/viewmodel/useConversationsViewModel";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const mounted: ReactTestRenderer[] = [];

afterEach(async () => {
  await act(async () => {
    mounted.splice(0).forEach((tree) => tree.unmount());
  });
});

async function renderHook(sessionUserId: string | null, deps: ConversationsDeps) {
  let result!: ReturnType<typeof useConversationsViewModel>;
  function HookProbe() {
    result = useConversationsViewModel(sessionUserId, deps);
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

const book = (id: string, title: string, ownerId: string): Book => ({
  id,
  title,
  author: "Autor",
  ownerId,
  modality: "trade",
  status: "available",
});

const msg = (requestId: string, senderId: string, content: string, createdAt: string): NegotiationMessage => ({
  id: `${requestId}-${createdAt}`,
  requestId,
  senderId,
  content,
  createdAt,
});

function deps(
  sent: RequestWithListing[],
  received: RequestWithListing[],
  messages: Record<string, NegotiationMessage[]>,
  names: Record<string, string>,
  photos: Record<string, string> = {},
): ConversationsDeps {
  return {
    listSentRequests: vi.fn().mockResolvedValue(sent),
    listReceivedRequests: vi.fn().mockResolvedValue(received),
    getMessages: vi.fn(async (requestId: string) => messages[requestId] ?? []),
    getProfile: vi.fn(async (userId: string) => ({ name: names[userId] ?? null, photoUrl: photos[userId] ?? null })),
  };
}

describe("useConversationsViewModel (Spec 076)", () => {
  it("junta enviados e recebidos, sem recusados, com o nome da outra pessoa e ordem por mensagem (CA1, CA2)", async () => {
    const domCasmurro = book("b1", "Dom Casmurro", "me");
    const vidasSecas = book("b2", "Vidas Secas", "lucas");
    const iracema = book("b3", "Iracema", "me");
    const hook = await renderHook(
      "me",
      deps(
        [{ request: { id: "r2", listingId: "b2", requesterId: "me", status: "accepted" }, listing: vidasSecas }],
        [
          { request: { id: "r1", listingId: "b1", requesterId: "ana", status: "accepted" }, listing: domCasmurro, requesterName: "Ana Paula" },
          { request: { id: "r3", listingId: "b3", requesterId: "caio", status: "rejected" }, listing: iracema, requesterName: "Caio" },
        ],
        {
          r1: [msg("r1", "ana", "Oi!", "2026-10-26T08:00:00Z"), msg("r1", "ana", "Pode ser sábado na praça?", "2026-10-26T10:00:00Z")],
          r2: [msg("r2", "me", "Combinado, levo o livro.", "2026-10-25T18:00:00Z")],
        },
        { lucas: "Lucas" },
      ),
    );

    const items = hook.current[0].items;
    expect(items.map((i) => i.requestId)).toEqual(["r1", "r2"]);
    expect(items[0]).toMatchObject({ otherName: "Ana Paula", preview: "Pode ser sábado na praça?", kind: "accepted", lastMessageAt: "2026-10-26T10:00:00Z" });
    expect(items[1]).toMatchObject({ otherName: "Lucas", preview: "Você: Combinado, levo o livro.", kind: "accepted" });
    expect(hook.current[0].loading).toBe(false);
  });

  it("coloca a proposta recebida pendente no topo e as conversas depois, da mais recente para a mais antiga (Spec 089)", async () => {
    const hook = await renderHook(
      "me",
      deps(
        [{ request: { id: "s2", listingId: "b2", requesterId: "me", status: "accepted" }, listing: book("b2", "Vidas Secas", "lucas") }],
        [
          { request: { id: "a1", listingId: "b1", requesterId: "ana", status: "accepted" }, listing: book("b1", "Dom Casmurro", "me"), requesterName: "Ana" },
          { request: { id: "p1", listingId: "b3", requesterId: "caio", status: "pending" }, listing: book("b3", "Iracema", "me"), requesterName: "Caio" },
        ],
        {
          a1: [msg("a1", "ana", "Oi", "2026-10-26T10:00:00Z")],
          s2: [msg("s2", "lucas", "Levo o livro", "2026-10-26T12:00:00Z")],
        },
        { lucas: "Lucas" },
      ),
    );
    expect(hook.current[0].items.map((i) => i.requestId)).toEqual(["p1", "s2", "a1"]);
  });

  it("traz a foto da outra pessoa nos enviados e nos recebidos (Spec 084)", async () => {
    const hook = await renderHook(
      "me",
      deps(
        [{ request: { id: "s1", listingId: "b9", requesterId: "me", status: "pending" }, listing: book("b9", "Iracema", "ze") }],
        [
          {
            request: { id: "p1", listingId: "b1", requesterId: "ana", status: "pending" },
            listing: book("b1", "Dom Casmurro", "me"),
            requesterName: "Ana",
            requesterPhotoUrl: "https://cdn/ana.jpg",
          },
        ],
        {},
        { ze: "Zé" },
        { ze: "https://cdn/ze.jpg" },
      ),
    );
    const byId = Object.fromEntries(hook.current[0].items.map((i) => [i.requestId, i]));
    expect(byId.s1.otherPhotoUrl).toBe("https://cdn/ze.jpg");
    expect(byId.p1.otherPhotoUrl).toBe("https://cdn/ana.jpg");
  });

  it("descreve pendentes e aceitas sem mensagem (CA3)", async () => {
    const hook = await renderHook(
      "me",
      deps(
        [{ request: { id: "s1", listingId: "b9", requesterId: "me", status: "pending" }, listing: book("b9", "Iracema", "ze") }],
        [
          { request: { id: "p1", listingId: "b1", requesterId: "ana", status: "pending" }, listing: book("b1", "Dom Casmurro", "me"), requesterName: null },
          { request: { id: "a1", listingId: "b2", requesterId: "bia", status: "accepted" }, listing: book("b2", "Vidas Secas", "me"), requesterName: "Bia" },
        ],
        {},
        {},
      ),
    );
    const byId = Object.fromEntries(hook.current[0].items.map((i) => [i.requestId, i]));
    expect(byId.p1).toMatchObject({ preview: "Proposta recebida", kind: "pendingReceived", otherName: "Pessoa da comunidade" });
    expect(byId.s1).toMatchObject({ preview: "Aguardando resposta", kind: "pendingSent", otherName: "Pessoa da comunidade" });
    expect(byId.a1).toMatchObject({ preview: "Combinem os detalhes pelo chat", kind: "accepted", lastMessageAt: null });
  });

  it("mostra erro amigável quando a lista falha", async () => {
    const failing = deps([], [], {}, {});
    failing.listSentRequests = vi.fn().mockRejectedValue(new Error("rede"));
    const hook = await renderHook("me", failing);
    expect(hook.current[0].error).toBe("Não foi possível carregar suas conversas. Tente novamente.");
  });

  it("formata o horário relativo como no Figma 06.01", () => {
    const now = new Date("2026-10-26T15:00:00");
    expect(formatConversationTime("2026-10-26T06:00:00", now)).toBe("9h");
    expect(formatConversationTime("2026-10-26T14:50:00", now)).toBe("10 min");
    expect(formatConversationTime("2026-10-25T20:00:00", now)).toBe("Ontem");
    expect(formatConversationTime("2026-10-24T09:00:00", now)).toBe("sáb");
    expect(formatConversationTime("2026-10-01T09:00:00", now)).toBe("01/10");
  });

  it("recarrega a lista quando chega mudança em tempo real e cancela ao desmontar (Spec 086)", async () => {
    let push: (() => void) | undefined;
    const unsubscribe = vi.fn();
    const base = deps([], [], {}, {});
    const listReceivedRequests = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { request: { id: "r9", listingId: "b9", requesterId: "ana", status: "pending" }, listing: book("b9", "Iracema", "me"), requesterName: "Ana" },
      ]);
    const subscribe = vi.fn((_userId: string, onChange: () => void) => {
      push = onChange;
      return unsubscribe;
    });
    const hook = await renderHook("me", { ...base, listReceivedRequests, subscribe });
    expect(hook.current[0].items).toHaveLength(0);

    await act(async () => {
      push?.();
    });
    expect(hook.current[0].items).toHaveLength(1);

    await act(async () => {
      mounted.splice(0).forEach((tree) => tree.unmount());
    });
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
