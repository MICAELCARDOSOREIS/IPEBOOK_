export type AuthValidationResult = Readonly<{
  isValid: boolean;
  errors: readonly string[];
}>;

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
