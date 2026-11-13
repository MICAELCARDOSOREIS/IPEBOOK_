import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

// Mock do expo-router com vi.hoisted (mesma convenção de pwaIphoneAppleHig.test.tsx)
vi.mock("expo-router/html", () => ({
  useServerDocumentContext: () => ({
    htmlAttributes: {},
    bodyAttributes: {},
    headNodes: null,
    bodyNodes: null,
  }),
  ScrollViewStyleReset: () => null,
}));

import RootHtml from "@/app/+html";

type VNode = { type?: unknown; props?: { children?: unknown } };

function findElement(vnode: unknown, tag: string): VNode | null {
  if (!vnode || typeof vnode !== "object") return null;
  const node = vnode as VNode;
  if (node.type === tag) return node;
  const children = node.props?.children;
  const list: unknown[] = Array.isArray(children)
    ? children
    : children === null || children === undefined
      ? []
      : [children];
  for (const child of list) {
    const found = findElement(child, tag);
    if (found) return found;
  }
  return null;
}

describe("Título estático no HTML da Web (Spec 025 / QA web 2026-11-13)", () => {
  it("declara <title> no head do +html.tsx para crawlers que não executam JavaScript", () => {
    const htmlSource = readFileSync(join(process.cwd(), "src/app/+html.tsx"), "utf-8");
    expect(htmlSource).toMatch(/<title>[^<]+<\/title>/);
  });

  it("renderiza a tag <title> no head com o título da marca e da proposta de valor", () => {
    const root = RootHtml({ children: null }) as unknown as VNode;
    const head = findElement(root, "head");
    expect(head).not.toBeNull();
    const title = findElement(head, "title");
    expect(title).not.toBeNull();
    const titleText = title?.props?.children;
    expect(typeof titleText).toBe("string");
    expect(titleText).toBe("IpêBook · Livros usados em Piripiri, PI");
  });
});
