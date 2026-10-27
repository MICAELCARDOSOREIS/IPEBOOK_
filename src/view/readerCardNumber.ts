/**
 * Número do cartão de leitor: seis dígitos derivados do id da pessoa, sempre os mesmos para a mesma
 * conta e sem expor o id. Sem id devolve um número neutro para o cartão de convidado ou de prévia.
 */
export function readerCardNumber(userId: string | null | undefined): string {
  if (!userId) return "IPE 000000";
  const hash = [...userId].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
  return `IPE ${String(hash % 1_000_000).padStart(6, "0")}`;
}

/** "out/2026" a partir da data ISO de entrada; vazio quando a data é inválida ou ausente. */
export function readerCardSince(joinedAt: string | null | undefined): string {
  if (!joinedAt) return "";
  const date = new Date(joinedAt);
  if (Number.isNaN(date.getTime())) return "";
  const month = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "");
  return `${month}/${date.getFullYear()}`;
}
