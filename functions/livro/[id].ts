import {
  buildBookOpenGraph,
  injectOpenGraphIntoHtml,
} from "../../src/model/formatters/openGraphFormatter";

interface Env {
  EXPO_PUBLIC_SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  EXPO_PUBLIC_SUPABASE_KEY?: string;
}

interface EventContext<Env, P extends string, Data> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<unknown>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<P, string | string[]>;
  data: Data;
}

/** Colunas reais de `v2_books` lidas pela function (mesmos nomes do esquema em `supabase/migrations/`). */
export const OPEN_GRAPH_BOOK_COLUMNS = [
  "id",
  "title",
  "author",
  "modality",
  "price",
  "photo_url",
  "neighborhood",
  "is_box",
  "box_volumes_count",
] as const;

type PagesFunction<TEnv = Env> = (
  context: EventContext<TEnv, "id", unknown>,
) => Response | Promise<Response>;

/**
 * Cloudflare Pages Function para gerar cards Open Graph e Twitter dinâmicos
 * quando links de livros (https://ipebook.app/livro/{id}) forem compartilhados no WhatsApp.
 */
export const onRequest: PagesFunction = async (context) => {
  const { params, env, next } = context;
  const rawId = params.id;
  const bookId = typeof rawId === "string" ? rawId : Array.isArray(rawId) ? rawId[0] : "";

  // Obtém o HTML base exportado estaticamente
  const response = await next();
  if (!response.ok || !bookId) {
    return response;
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  try {
    // Sem fallback embutido: o projeto Supabase é definido apenas pelas variáveis do Cloudflare Pages.
    const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL ?? "";
    const supabaseKey = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.EXPO_PUBLIC_SUPABASE_KEY ?? "";

    if (!supabaseUrl.startsWith("https://") || !supabaseKey) {
      return response;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);

    const apiUrl = `${supabaseUrl}/rest/v1/v2_books?id=eq.${encodeURIComponent(bookId)}&select=${OPEN_GRAPH_BOOK_COLUMNS.join(",")}`;
    let res: Response;
    try {
      res = await fetch(apiUrl, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Accept: "application/json",
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      return response;
    }

    const books = (await res.json()) as Array<{
      id: string;
      title: string;
      author: string;
      modality: "sale" | "trade" | "donation";
      price?: number | null;
      photo_url?: string | null;
      neighborhood?: string | null;
      is_box?: boolean | null;
      box_volumes_count?: number | null;
    }>;

    if (!Array.isArray(books) || books.length === 0) {
      return response;
    }

    const book = books[0];
    const ogMeta = buildBookOpenGraph({
      id: book.id,
      title: book.title,
      author: book.author,
      tradeType: book.modality === "sale" ? "sell" : book.modality,
      price: book.price,
      photoUrl: book.photo_url,
      neighborhood: book.neighborhood,
      isBox: book.is_box,
      boxVolumesCount: book.box_volumes_count,
    });

    const originalHtml = await response.text();
    const enrichedHtml = injectOpenGraphIntoHtml(originalHtml, ogMeta);

    const newHeaders = new Headers(response.headers);
    newHeaders.set("Content-Type", "text/html; charset=utf-8");

    return new Response(enrichedHtml, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch {
    // Em caso de falha de timeout ou de rede, serve o HTML padrão sem interrupção
    return response;
  }
};
