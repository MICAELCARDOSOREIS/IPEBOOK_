import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { tokens } from "@/view/tokens";

// Mock do expo-router com vi.hoisted
const { mockRouter } = vi.hoisted(() => ({
  mockRouter: {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    canGoBack: vi.fn(),
  },
}));

vi.mock("expo-router", () => ({
  router: mockRouter,
}));

vi.mock("expo-router/html", () => ({
  useServerDocumentContext: () => ({
    htmlAttributes: { className: "html-root" },
    bodyAttributes: { className: "body-root" },
    headNodes: null,
    bodyNodes: null,
  }),
  ScrollViewStyleReset: () => null,
}));

import RootHtml from "@/app/+html";
import { _resetPushOnceState, backOnce, canonicalizeHref, pushOnce, replaceOnce } from "@/view/pushOnce";

describe("PWA iPhone & Safari Apple HIG (Spec 135 / ADR 0108 / Issue #220)", () => {
  beforeEach(() => {
    _resetPushOnceState();
    mockRouter.push.mockClear();
    mockRouter.replace.mockClear();
    mockRouter.back.mockClear();
    if (!mockRouter.canGoBack) {
      mockRouter.canGoBack = vi.fn();
    } else {
      mockRouter.canGoBack.mockClear();
    }
  });

  describe("Renderização e estrutura do RootHtml (+html.tsx)", () => {
    it("renderiza o componente RootHtml sem falhas", () => {
      const vnode = RootHtml({ children: null });
      expect(vnode).not.toBeNull();
      expect(vnode.type).toBe("html");
      expect(vnode.props.lang).toBe("pt-BR");
    });
  });

  describe("Meta tags e cabeçalhos em src/app/+html.tsx", () => {
    const htmlSource = readFileSync(join(process.cwd(), "src/app/+html.tsx"), "utf-8");

    it("declara viewport-fit=cover para suporte completo às Safe Areas do iPhone (notch e Home Indicator)", () => {
      expect(htmlSource).toContain("viewport-fit=cover");
    });

    it("declara format-detection telephone=no para evitar links de discagem acidentais em números de livros", () => {
      expect(htmlSource).toContain('<meta name="format-detection" content="telephone=no" />');
    });

    it("declara links apple-touch-icon em alta resolução para WebClip do iPhone", () => {
      expect(htmlSource).toContain('rel="apple-touch-icon" href="/icone-192.png"');
      expect(htmlSource).toContain('rel="apple-touch-icon" sizes="180x180"');
      expect(htmlSource).toContain('rel="apple-touch-icon" sizes="192x192"');
      expect(htmlSource).toContain('rel="apple-touch-icon" sizes="512x512"');
    });

    it("mantém as capacidades de PWA standalone no iOS", () => {
      expect(htmlSource).toContain('<meta name="apple-mobile-web-app-capable" content="yes" />');
      expect(htmlSource).toContain('<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />');
      expect(htmlSource).toContain('<meta name="apple-mobile-web-app-title" content="IpêBook" />');
    });
  });

  describe("Regras CSS defensivas para Safari / iOS no +html.tsx", () => {
    const htmlSource = readFileSync(join(process.cwd(), "src/app/+html.tsx"), "utf-8");

    it("bloqueia zoom involuntário no Safari móvel exigindo font-size >= 16px em inputs", () => {
      expect(htmlSource).toContain("input,select,textarea{font-size:16px!important}");
      expect(htmlSource).toContain("@supports (-webkit-touch-callout:none)");
    });

    it("elimina o rubber-banding elástico excessivo no PWA standalone com overscroll-behavior-y: none", () => {
      expect(htmlSource).toContain("overscroll-behavior-y:none");
    });

    it("remove o destaque cinza nativo do Safari com -webkit-tap-highlight-color: transparent", () => {
      expect(htmlSource).toContain("-webkit-tap-highlight-color:transparent");
    });

    it("protege o dock flutuante contra o Home Indicator com env(safe-area-inset-bottom)", () => {
      expect(htmlSource).toContain('data-testid="navigation-bar-tablist"');
      expect(htmlSource).toContain("env(safe-area-inset-bottom,0px)");
    });
  });

  describe("Navegação de retorno segura no PWA Standalone (backOnce)", () => {
    it("navega via router.back() quando há histórico na pilha (canGoBack = true)", () => {
      mockRouter.canGoBack.mockReturnValue(true);
      backOnce();
      expect(mockRouter.back).toHaveBeenCalledTimes(1);
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it("redireciona para o fallback (/) quando aberto diretamente sem histórico (canGoBack = false)", () => {
      mockRouter.canGoBack.mockReturnValue(false);
      backOnce();
      expect(mockRouter.back).not.toHaveBeenCalled();
      expect(mockRouter.replace).toHaveBeenCalledWith("/");
    });

    it("aceita rota de fallback customizada quando não há histórico", () => {
      mockRouter.canGoBack.mockReturnValue(false);
      backOnce("/meus-pedidos");
      expect(mockRouter.back).not.toHaveBeenCalled();
      expect(mockRouter.replace).toHaveBeenCalledWith("/meus-pedidos");
    });

    it("chama router.back() se router.canGoBack não for função", () => {
      // @ts-expect-error teste de robustez em runtime
      mockRouter.canGoBack = undefined;
      backOnce();
      expect(mockRouter.back).toHaveBeenCalledTimes(1);
    });

    it("bloqueia chamadas de backOnce repetidas dentro da janela de debounce", () => {
      mockRouter.canGoBack.mockReturnValue(true);
      backOnce();
      backOnce();
      expect(mockRouter.back).toHaveBeenCalledTimes(1);
    });
  });

  describe("Normalização canônica de rotas em pushOnce e replaceOnce", () => {
    it("canonicalizeHref lida com string sem query", () => {
      expect(canonicalizeHref("/livro/123")).toBe("/livro/123");
    });

    it("canonicalizeHref lida com objeto sem pathname", () => {
      expect(canonicalizeHref({} as never)).toBe("/");
    });

    it("canonicalizeHref lida com parâmetro dinâmico ausente ou nulo", () => {
      expect(canonicalizeHref({ pathname: "/livro/[id]", params: { id: null } as never })).toBe("/livro/[id]");
    });

    it("canonicalizeHref filtra parâmetros vazios da query string", () => {
      expect(canonicalizeHref({ pathname: "/busca" as never, params: { q: "", cat: "geral" } })).toBe("/busca?cat=geral");
    });

    it("replaceOnce bloqueia duplicata consecutiva", () => {
      replaceOnce("/perfil");
      replaceOnce("/perfil");
      expect(mockRouter.replace).toHaveBeenCalledTimes(1);
    });

    it("bloqueia alternância rápida entre push e replace para o mesmo destino", () => {
      pushOnce("/perfil");
      replaceOnce("/perfil");
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe("Ergonomia e Alvos de Toque (Apple HIG)", () => {
    it("garante piso mínimo de 44 pt para alvos interativos", () => {
      expect(tokens.accessibility.touchTarget).toBeGreaterThanOrEqual(44);
      expect(tokens.accessibility.touchTarget).toBe(48);
    });

    it("mantém foco acessível visível", () => {
      expect(tokens.accessibility.focusWidth).toBeGreaterThanOrEqual(2);
    });
  });
});
