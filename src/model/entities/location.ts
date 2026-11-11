export const DEFAULT_BETA_CITY = "Piripiri" as const;
export const DEFAULT_BETA_STATE = "PI" as const;

export const ALL_PIRIPIRI_LOCATIONS_LABEL = "Piripiri (Todos os locais)" as const;
export const DEFAULT_PIRIPIRI_LOCATION = "Piripiri" as const;

/**
 * Principais pontos de encontro públicos seguros e locais para troca/entrega em Piripiri, PI.
 * Substitui os bairros residenciais fragmentados, unificando os livros na cidade de Piripiri
 * e em seus pontos públicos de referência comunitária.
 */
export const PIRIPIRI_MEETING_POINT_NAMES = [
  "Campus IFPI Piripiri",
  "Praça da Bandeira",
  "Museu de Piripiri",
  "Praça de Eventos",
] as const;

export const PIRIPIRI_LOCATION_OPTIONS = [
  ALL_PIRIPIRI_LOCATIONS_LABEL,
  ...PIRIPIRI_MEETING_POINT_NAMES,
] as const;

export type PiripiriMeetingPointName = (typeof PIRIPIRI_MEETING_POINT_NAMES)[number];

export const PIRIPIRI_NEIGHBORHOODS = [
  "Centro",
  "Paciência",
  "Petecas",
  "Crioli",
  "Prado",
  "Matadouro",
  "Vista Alegre",
  "Fonte dos Matos",
  "Floresta",
  "Recreio",
  "São João",
  "Germano",
  "Caixa D'Água",
  "Estação",
  "Santa Maria",
  "Itacolomi",
  "Morada dos Frades",
] as const;

export type PiripiriNeighborhood = (typeof PIRIPIRI_NEIGHBORHOODS)[number] | PiripiriMeetingPointName | "Piripiri";

/**
 * Formata o local do exemplar para exibição no aplicativo.
 * Todos os livros pertencem a Piripiri. Quando o exemplar tiver um ponto de encontro
 * público associado, exibe o nome do ponto de encontro. Nos demais casos, exibe "Piripiri".
 */
export function formatBookLocation(rawLocation?: string | null): string {
  if (!rawLocation) return DEFAULT_PIRIPIRI_LOCATION;
  const trimmed = rawLocation.trim();
  if (!trimmed) return DEFAULT_PIRIPIRI_LOCATION;

  // Reconhece pontos de encontro (mesmo com pequenas variações de texto)
  const lower = trimmed.toLowerCase();
  if (lower.includes("ifpi")) return "Campus IFPI Piripiri";
  if (lower.includes("bandeira")) return "Praça da Bandeira";
  if (lower.includes("museu") || lower.includes("perypery")) return "Museu de Piripiri";
  if (lower.includes("eventos")) return "Praça de Eventos";
  if (lower.includes("todos") || lower === "all") return DEFAULT_PIRIPIRI_LOCATION;

  // Se o valor for exatamente um dos pontos de encontro cadastrados
  if ((PIRIPIRI_MEETING_POINT_NAMES as readonly string[]).includes(trimmed)) {
    return trimmed;
  }

  // Para bairros residenciais legados (Centro, Paciência, etc.), o livro é de Piripiri!
  return DEFAULT_PIRIPIRI_LOCATION;
}

export function isValidBetaLocation(city?: string | null, state?: string | null): boolean {
  if (!city && !state) return true; // Quando omitido, assume o padrão da beta
  const validCity = !city || city.trim().toLowerCase() === DEFAULT_BETA_CITY.toLowerCase();
  const validState = !state || state.trim().toUpperCase() === DEFAULT_BETA_STATE;
  return validCity && validState;
}
