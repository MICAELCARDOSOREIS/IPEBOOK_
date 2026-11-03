function formatPriceBrl(value: number): string {
  const [integer, cents] = Math.abs(value).toFixed(2).split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${value < 0 ? "-" : ""}R$ ${grouped},${cents}`;
}

export type OpenGraphBookInput = {
  id: string;
  title: string;
  author: string;
  tradeType: "sell" | "trade" | "donation";
  price?: number | null;
  photoUrl?: string | null;
  bairro?: string | null;
  neighborhood?: string | null;
  isBox?: boolean | null;
  boxVolumesCount?: number | null;
};

export type OpenGraphMetadata = {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  siteName: string;
};

export const DEFAULT_OG_IMAGE = "https://ipebook.app/icone-512.png";
export const DEFAULT_SITE_NAME = "IpêBook Piripiri";

/**
 * Constrói os metadados de Open Graph para um livro do catálogo de Piripiri.
 */
export function buildBookOpenGraph(book: OpenGraphBookInput): OpenGraphMetadata {
  const isBox = Boolean(book.isBox && (book.boxVolumesCount ?? 0) >= 2);
  const titlePrefix = isBox ? `Box: ${book.title} (${book.boxVolumesCount} vols)` : book.title;
  const pageTitle = `${titlePrefix} · ${book.author} | IpêBook Piripiri`;

  let modality = "🔄 Disponível para troca";
  if (book.tradeType === "sell") {
    modality = `💰 Venda: ${formatPriceBrl(book.price ?? 0)}`;
  } else if (book.tradeType === "donation") {
    modality = "🎁 Doação gratuita";
  }

  const rawBairro = book.neighborhood ?? book.bairro;
  const location = rawBairro?.trim() ? `no bairro ${rawBairro.trim()}, Piripiri - PI` : "em Piripiri - PI";

  const boxDetail = isBox ? `Coleção completa com ${book.boxVolumesCount} volumes. ` : "";
  const description = `${modality} ${location}. ${boxDetail}Acesse o IpêBook para ver detalhes e combinar a entrega segura!`;

  const validPhoto = book.photoUrl && book.photoUrl.startsWith("http") ? book.photoUrl : DEFAULT_OG_IMAGE;

  return {
    title: pageTitle,
    description,
    image: validPhoto,
    url: `https://ipebook.app/livro/${book.id}`,
    type: "book",
    siteName: DEFAULT_SITE_NAME,
  };
}

/**
 * Gera a string de tags <meta> para injeção no cabeçalho HTML.
 */
export function buildOpenGraphHtmlTags(meta: OpenGraphMetadata): string {
  return [
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:image" content="${escapeHtml(meta.image)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.url)}" />`,
    `<meta property="og:type" content="${escapeHtml(meta.type)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(meta.siteName)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`,
  ].join("\n    ");
}

/**
 * Injeta metadados Open Graph e título em um documento HTML.
 */
export function injectOpenGraphIntoHtml(html: string, meta: OpenGraphMetadata): string {
  let result = html;

  // Substitui ou injeta o <title>
  if (result.includes("<title>")) {
    result = result.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  } else if (result.includes("<head>")) {
    result = result.replace("<head>", `<head>\n    <title>${escapeHtml(meta.title)}</title>`);
  }

  // Remove meta tags og:* e twitter:* pré-existentes para evitar duplicações
  result = result.replace(/<meta\s+property="og:[^"]*"\s+content="[^"]*"\s*\/?>\n?\s*/gi, "");
  result = result.replace(/<meta\s+name="twitter:[^"]*"\s+content="[^"]*"\s*\/?>\n?\s*/gi, "");

  // Injeta as novas tags antes de </head>
  const tags = buildOpenGraphHtmlTags(meta);
  if (result.includes("</head>")) {
    result = result.replace("</head>", `    ${tags}\n  </head>`);
  } else {
    result += `\n${tags}`;
  }

  return result;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
