export type MeetingPoint = Readonly<{
  name: string;
  address: string;
  recommendedTime: string;
  latitude: number;
  longitude: number;
}>;

/**
 * Pontos públicos sugeridos para entregas em Piripiri. Fonte única para a negociação (`06.05`) e
 * para a Ajuda (`09.01`), que antes citavam locais diferentes (Spec 043, RN-13).
 */
/** Coordenadas do OpenStreetMap (Nominatim); o Museu de Piripiri corresponde ao Museu de Perypery, na Rua Leônidas Melo. */
export const PIRIPIRI_MEETING_POINTS: readonly MeetingPoint[] = [
  {
    name: "Campus IFPI Piripiri (Recepção ou Biblioteca)",
    address: "Rodovia PI-112, Km 01, Piripiri, PI",
    recommendedTime: "Dias úteis, das 8h às 17h",
    latitude: -4.2900535,
    longitude: -41.7935589,
  },
  {
    name: "Praça da Bandeira (Centro)",
    address: "Praça da Bandeira, Centro, Piripiri, PI",
    recommendedTime: "Diariamente, das 8h às 18h",
    latitude: -4.2741994,
    longitude: -41.7777509,
  },
  {
    name: "Museu de Piripiri",
    address: "Museu de Perypery, Rua Leônidas Melo, Centro, Piripiri, PI",
    recommendedTime: "Dias úteis, das 8h às 17h",
    latitude: -4.275272,
    longitude: -41.7771022,
  },
  {
    name: "Praça de Eventos",
    address: "Praça de Eventos, Centro, Piripiri, PI",
    recommendedTime: "Diariamente, das 8h às 18h",
    latitude: -4.2737597,
    longitude: -41.785176,
  },
];
