export class DomainError extends Error {}
export class ValidationError extends DomainError {}
export class AuthError extends DomainError {}
export class DataSourceError extends DomainError {}
export class DuplicateReportError extends DomainError {}
/** E-mail já cadastrado e confirmado (Issue #97 — estado "E-mail já cadastrado"). */
export class EmailAlreadyRegisteredError extends AuthError {}
/** Link de recuperação de senha inválido ou expirado (Issue #97 — estado "Link expirado"). */
export class ExpiredLinkError extends AuthError {}
