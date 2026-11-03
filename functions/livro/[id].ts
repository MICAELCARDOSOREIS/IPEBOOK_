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
    const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL || "https://kxyjafjvxovlqaswddas.supabase.co";
    const supabaseKey = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.EXPO_PUBLIC_SUPABASE_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
      return response;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);

    const apiUrl = `${supabaseUrl}/rest/v1/v2_books?id=eq.${encodeURIComponent(bookId)}&select=id,title,author,trade_type,price,photo_url,bairro,is_box,box_volumes_count`;
    const res = await fetch(apiUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return response;
    }

    const books = (await res.json()) as Array<{
      id: string;
      title: string;
      author: string;
      trade_type: "sell" | "trade" | "donation";
      price?: number | null;
      photo_url?: string | null;
      bairro?: string | null;
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
      tradeType: book.trade_type,
      price: book.price,
      photoUrl: book.photo_url,
      bairro: book.bairro,
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
