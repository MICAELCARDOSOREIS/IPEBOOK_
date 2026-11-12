/**
 * Regra única do domínio para @perfil do Instagram (Spec 081).
 *
 * O valor é incorporado a URLs externas (`https://instagram.com/<handle>`) nas telas de
 * perfil, então só o padrão oficial do Instagram é aceito: letras, números, ponto e
 * sublinhado, 1 a 30 caracteres. Isso impede que dados vindos de qualquer fonte
 * (entrada antiga, resposta remota) injetem caminho, consulta ou outro destino na URL.
 */
const INSTAGRAM_HANDLE_PATTERN = /^[A-Za-z0-9._]{1,30}$/;

/** "@perfil", " perfil " → "@perfil"; `null` para vazio, link ou caractere fora do padrão. */
export function normalizeInstagramHandle(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const handle = raw.trim().replace(/^@+/, "");
  return INSTAGRAM_HANDLE_PATTERN.test(handle) ? `@${handle}` : null;
}
