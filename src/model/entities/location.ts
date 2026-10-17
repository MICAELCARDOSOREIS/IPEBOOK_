export const DEFAULT_BETA_CITY = "Piripiri" as const;
export const DEFAULT_BETA_STATE = "PI" as const;

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

export type PiripiriNeighborhood = (typeof PIRIPIRI_NEIGHBORHOODS)[number];

export function isValidBetaLocation(city?: string | null, state?: string | null): boolean {
  if (!city && !state) return true; // Quando omitido, assume o padrão da beta
  const validCity = !city || city.trim().toLowerCase() === DEFAULT_BETA_CITY.toLowerCase();
  const validState = !state || state.trim().toUpperCase() === DEFAULT_BETA_STATE;
  return validCity && validState;
}
