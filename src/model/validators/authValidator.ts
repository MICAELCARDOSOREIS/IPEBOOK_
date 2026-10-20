export type AuthValidationResult = Readonly<{
  isValid: boolean;
  errors: readonly string[];
}>;

const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 80;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Nome completo pedido no cadastro (Figma `01.03 · Criar conta`). */
export function validateFullName(name: unknown): AuthValidationResult {
  if (typeof name !== "string" || name.trim().length === 0) {
    return { isValid: false, errors: ["Nome completo é obrigatório."] };
  }
  const trimmed = name.trim();
  if (trimmed.length < MIN_NAME_LENGTH) {
    return { isValid: false, errors: [`Nome deve conter no mínimo ${MIN_NAME_LENGTH} caracteres.`] };
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    return { isValid: false, errors: [`Nome deve conter no máximo ${MAX_NAME_LENGTH} caracteres.`] };
  }
  return { isValid: true, errors: [] };
}

/** Cadastro: nome, e-mail e senha juntos, na ordem em que a tela os apresenta. */
export function validateSignUpPayload(input: unknown): AuthValidationResult {
  const raw = (input ?? {}) as Record<string, unknown>;
  const nameResult = validateFullName(raw.name);
  const credentialsResult = validateAuthPayload(input);
  const errors = [...nameResult.errors, ...credentialsResult.errors];
  return { isValid: errors.length === 0, errors };
}

export function validateNewPassword(password: string): AuthValidationResult {
  const errors = password.length < MIN_PASSWORD_LENGTH
    ? [`Senha deve conter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`]
    : [];
  return { isValid: errors.length === 0, errors };
}

export function validateAuthPayload(input: unknown): AuthValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return {
      isValid: false,
      errors: ["Dados de autenticação inválidos ou não fornecidos."],
    };
  }

  const raw = input as Record<string, unknown>;

  if (typeof raw.email !== "string" || raw.email.trim().length === 0) {
    errors.push("E-mail é obrigatório.");
  } else if (!EMAIL_PATTERN.test(raw.email.trim())) {
    errors.push("E-mail em formato inválido.");
  }

  if (typeof raw.password !== "string" || raw.password.length === 0) {
    errors.push("Senha é obrigatória.");
  } else if (raw.password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Senha deve conter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
