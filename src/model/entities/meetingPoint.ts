export type MeetingPoint = Readonly<{
  name: string;
  address: string;
  recommendedTime: string;
}>;

/**
 * Pontos públicos sugeridos para entregas em Piripiri. Fonte única para a negociação (`06.05`) e
 * para a Ajuda (`09.01`), que antes citavam locais diferentes (Spec 043, RN-13).
 */
export const PIRIPIRI_MEETING_POINTS: readonly MeetingPoint[] = [
  {
    name: "Campus IFPI Piripiri (Recepção ou Biblioteca)",
    address: "Rodovia PI-112, Km 01, Piripiri, PI",
    recommendedTime: "Dias úteis, das 8h às 17h",
  },
  {
    name: "Praça da Bandeira (Centro)",
    address: "Praça da Bandeira, Centro, Piripiri, PI",
    recommendedTime: "Diariamente, das 8h às 18h",
  },
  {
    name: "Praça de Alimentação / Mercado Central",
    address: "Mercado Central de Piripiri, Centro, Piripiri, PI",
    recommendedTime: "Diariamente, das 8h às 18h",
  },
  {
    name: "Praça de Eventos",
    address: "Praça de Eventos, Centro, Piripiri, PI",
    recommendedTime: "Diariamente, das 8h às 18h",
  },
];
