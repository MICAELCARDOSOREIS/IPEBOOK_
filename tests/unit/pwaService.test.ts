import { Platform } from "react-native";
import { PwaService } from "@/infra/services/pwaService";
import type { ILogger } from "@/model/services/iLogger";
import { stubGlobal, unstubAllGlobals } from "../helpers/stubGlobal";

describe("PwaService (Spec 041, ADR 0035)", () => {
  const originalPlatform = Platform.OS;

  const mockLogger: ILogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(() => {
    Platform.OS = "web";
    jest.clearAllMocks();
  });

  afterEach(() => {
    Platform.OS = originalPlatform;
    unstubAllGlobals();
  });

  it("não reporta suporte quando a plataforma for nativa (Android ou iOS)", () => {
    Platform.OS = "android";
    const service = new PwaService(mockLogger);
    expect(service.isSupported()).toBe(false);

    Platform.OS = "ios";
    expect(service.isSupported()).toBe(false);
  });

  it("não reporta suporte se o navegador não disponibilizar serviceWorker", () => {
    stubGlobal("window", {
      location: { protocol: "https:", hostname: "ipebook.org" },
    });
    stubGlobal("navigator", {});

    const service = new PwaService(mockLogger);
    expect(service.isSupported()).toBe(false);
  });

  it("não reporta suporte se o protocolo for inseguro (HTTP não-localhost)", () => {
    stubGlobal("window", {
      location: { protocol: "http:", hostname: "meusite-inseguro.com" },
    });
    stubGlobal("navigator", {
      serviceWorker: {
        register: jest.fn(),
        getRegistrations: jest.fn(),
      },
    });

    const service = new PwaService(mockLogger);
    expect(service.isSupported()).toBe(false);
  });

  it("reporta suporte em contexto seguro HTTPS ou localhost", () => {
    stubGlobal("window", {
      location: { protocol: "https:", hostname: "ipebook.pages.dev" },
    });
    stubGlobal("navigator", {
      serviceWorker: {
        register: jest.fn(),
        getRegistrations: jest.fn(),
      },
    });

    const service = new PwaService(mockLogger);
    expect(service.isSupported()).toBe(true);

    // Também suporta localhost
    stubGlobal("window", {
      location: { protocol: "http:", hostname: "localhost" },
    });
    expect(service.isSupported()).toBe(true);

    // Também suporta 127.0.0.1
    stubGlobal("window", {
      location: { protocol: "http:", hostname: "127.0.0.1" },
    });
    expect(service.isSupported()).toBe(true);
  });

  it("retorna false em register() caso o ambiente não suporte Service Worker", async () => {
    Platform.OS = "android";
    const service = new PwaService(mockLogger);
    const result = await service.register();
    expect(result).toBe(false);
    expect(mockLogger.info).not.toHaveBeenCalled();
  });

  it("registra o Service Worker com sucesso e loga informações", async () => {
    const registerMock = jest.fn().mockResolvedValue({ scope: "https://ipebook.pages.dev/" });
    stubGlobal("window", {
      location: { protocol: "https:", hostname: "ipebook.pages.dev" },
    });
    stubGlobal("navigator", {
      serviceWorker: {
        register: registerMock,
        getRegistrations: jest.fn(),
      },
    });

    const service = new PwaService(mockLogger, "/sw.js", "/");
    const result = await service.register();

    expect(result).toBe(true);
    expect(registerMock).toHaveBeenCalledWith("/sw.js", { scope: "/" });
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Service Worker registrado com sucesso",
      expect.objectContaining({ scope: "https://ipebook.pages.dev/" })
    );

    // Idempotência: chamadas subsequentes não registram novamente
    const secondResult = await service.register();
    expect(secondResult).toBe(true);
    expect(registerMock).toHaveBeenCalledTimes(1);
  });

  it("trata erro de registro sem lançar exceção e loga aviso", async () => {
    const registerMock = jest.fn().mockRejectedValue(new Error("Permissão negada"));
    stubGlobal("window", {
      location: { protocol: "https:", hostname: "ipebook.pages.dev" },
    });
    stubGlobal("navigator", {
      serviceWorker: {
        register: registerMock,
        getRegistrations: jest.fn(),
      },
    });

    const service = new PwaService(mockLogger);
    const result = await service.register();

    expect(result).toBe(false);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      "Falha ao registrar Service Worker do PWA",
      expect.objectContaining({ erro: "Permissão negada" })
    );
  });

  it("retorna false em unregister() quando o ambiente não for suportado", async () => {
    Platform.OS = "ios";
    const service = new PwaService(mockLogger);
    expect(await service.unregister()).toBe(false);
  });

  it("desregistra Service Workers ativos com sucesso", async () => {
    const mockRegistration = { unregister: jest.fn().mockResolvedValue(true) };
    const getRegistrationsMock = jest.fn().mockResolvedValue([mockRegistration]);

    stubGlobal("window", {
      location: { protocol: "https:", hostname: "ipebook.pages.dev" },
    });
    stubGlobal("navigator", {
      serviceWorker: {
        register: jest.fn().mockResolvedValue({ scope: "/" }),
        getRegistrations: getRegistrationsMock,
      },
    });

    const service = new PwaService(mockLogger);
    await service.register();

    const unregisterResult = await service.unregister();
    expect(unregisterResult).toBe(true);
    expect(mockRegistration.unregister).toHaveBeenCalledTimes(1);
    expect(mockLogger.info).toHaveBeenCalledWith("Service Workers desregistrados com sucesso");
  });

  it("captura exceção durante unregister e retorna false com aviso no logger", async () => {
    const getRegistrationsMock = jest.fn().mockRejectedValue(new Error("Falha no navegador"));

    stubGlobal("window", {
      location: { protocol: "https:", hostname: "ipebook.pages.dev" },
    });
    stubGlobal("navigator", {
      serviceWorker: {
        register: jest.fn(),
        getRegistrations: getRegistrationsMock,
      },
    });

    const service = new PwaService(mockLogger);
    const result = await service.unregister();
    expect(result).toBe(false);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      "Erro ao desregistrar Service Workers",
      expect.objectContaining({ erro: "Falha no navegador" })
    );
  });
});
