import { describe, expect, it } from "vitest";
import { LogEntry } from "@/model/services/iLogger";
import { SafeLogger, sanitizeContext } from "@/infra/services/safeLogger";

describe("SafeLogger e sanitizeContext", () => {
  it("mascara senhas, tokens e chaves sensíveis em objetos aninhados", () => {
    const rawContext = {
      user: {
        id: "usr_123",
        email: "leitor@ipebook.local",
        password: "supersecretpassword",
        authToken: "token_abc123",
      },
      apiKey: "secret_key_xyz",
      details: {
        session_token: "sess_456",
        safeNote: "Livro em bom estado",
      },
    };

    const sanitized = sanitizeContext(rawContext) as any;

    expect(sanitized.user.id).toBe("usr_123");
    expect(sanitized.user.email).toBe("leitor@ipebook.local");
    expect(sanitized.user.password).toBe("[REDACTED]");
    expect(sanitized.user.authToken).toBe("[REDACTED]");
    expect(sanitized.apiKey).toBe("[REDACTED]");
    expect(sanitized.details.session_token).toBe("[REDACTED]");
    expect(sanitized.details.safeNote).toBe("Livro em bom estado");
  });

  it("mascara strings com padrão JWT e Bearer", () => {
    const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozGzN_ce";
    const bearer = "Bearer mySecretToken123";

    expect(sanitizeContext(jwt)).toBe("[REDACTED_JWT]");
    expect(sanitizeContext(bearer)).toBe("Bearer [REDACTED]");
  });

  it("trata referências circulares sem estourar a pilha de execução", () => {
    const obj: any = { name: "anúncio" };
    obj.self = obj;

    const sanitized = sanitizeContext(obj) as any;
    expect(sanitized.name).toBe("anúncio");
    expect(sanitized.self).toBe("[CIRCULAR]");
  });

  it("respeita o nível mínimo de log configurado", () => {
    const entries: LogEntry[] = [];
    const logger = new SafeLogger({
      minLevel: "warn",
      sink: (entry) => entries.push(entry),
    });

    logger.debug("Mensagem de depuração");
    logger.info("Informação rotineira");
    logger.warn("Aviso de latência");
    logger.error("Erro crítico", new Error("Falha no banco"));

    expect(entries).toHaveLength(2);
    expect(entries[0].level).toBe("warn");
    expect(entries[0].message).toBe("Aviso de latência");
    expect(entries[1].level).toBe("error");
    expect(entries[1].error).toBe("Falha no banco");
  });

  it("registra contexto higienizado e timestamp ISO", () => {
    const entries: LogEntry[] = [];
    const logger = new SafeLogger({
      minLevel: "debug",
      sink: (entry) => entries.push(entry),
    });

    logger.info("Novo anúncio criado", {
      listingId: "book-1",
      creatorEmail: "autor@piripiri.pi",
      secretPin: "1234",
    });

    expect(entries).toHaveLength(1);
    const entry = entries[0];
    expect(entry.level).toBe("info");
    expect(entry.message).toBe("Novo anúncio criado");
    expect(entry.context?.listingId).toBe("book-1");
    expect(entry.context?.creatorEmail).toBe("autor@piripiri.pi");
    expect(entry.context?.secretPin).toBe("[REDACTED]");
    expect(typeof entry.timestamp).toBe("string");
    expect(new Date(entry.timestamp).getTime()).not.toBeNaN();
  });
});
