/** Contato oficial do suporte do IpêBook (e-mail da equipe). */
export const SUPPORT_EMAIL = "ipebook738@gmail.com";

/** Link `mailto:` com assunto e corpo já preparados para a pessoa só escrever o problema. */
export function supportMailtoUrl(version: string | null): string {
  const subject = encodeURIComponent("Ajuda com o IpêBook");
  const body = encodeURIComponent(`\n\n---\nVersão do aplicativo: ${version ?? "desconhecida"}`);
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}
