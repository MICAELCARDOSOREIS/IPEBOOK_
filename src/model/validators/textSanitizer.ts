export interface SanitizeOptions {
  allowNewlines?: boolean;
  maxLength?: number;
}

const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const SCRIPT_STYLE_BLOCKS_REGEX = /<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const HTML_TAGS_REGEX = /<[^>]*>/g;
const DANGEROUS_PATTERNS_REGEX = /<\s*script|javascript\s*:|<\s*iframe|on\w+\s*=/i;

/**
 * Sanitiza campos de texto livre removendo tags HTML, scripts, caracteres de controle
 * e normalizando espaços redundantes.
 */
export function sanitizeTextInput(input: string, options: SanitizeOptions = {}): string {
  if (!input || typeof input !== "string") {
    return "";
  }

  // 1. Remove caracteres de controle invisíveis
  let clean = input.replace(CONTROL_CHARS_REGEX, "");

  // 2. Remove blocos inteiros de script e style com seu conteúdo
  clean = clean.replace(SCRIPT_STYLE_BLOCKS_REGEX, "");

  // 3. Remove demais tags HTML
  clean = clean.replace(HTML_TAGS_REGEX, "");

  // 3. Trata quebras de linha e espaços
  if (options.allowNewlines) {
    // Normaliza quebras de linha para \n
    clean = clean.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    // Colapsa mais de 2 quebras seguidas em no máximo 2
    clean = clean.replace(/\n{3,}/g, "\n\n");
    // Colapsa espaços horizontais repetidos em cada linha
    clean = clean
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .join("\n");
  } else {
    // Converte todas as quebras em espaços e colapsa espaços consecutivos
    clean = clean.replace(/[\r\n\t]+/g, " ");
    clean = clean.replace(/\s+/g, " ");
  }

  clean = clean.trim();

  // 4. Trunca se houver limite máximo
  if (options.maxLength !== undefined && options.maxLength > 0) {
    clean = clean.slice(0, options.maxLength);
  }

  return clean;
}

/**
 * Verifica se uma string contém elementos de código malicioso ou tags de script.
 */
export function containsDangerousHtml(input: string): boolean {
  if (!input || typeof input !== "string") return false;
  return DANGEROUS_PATTERNS_REGEX.test(input);
}
