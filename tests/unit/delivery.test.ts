import { describe, expect, it } from "vitest";
import {
  buildDeliveryPayload,
  isValidDeliveryCode,
  normalizeDeliveryCode,
  parseDeliveryPayload,
} from "@/model/entities/delivery";

const requestId = "3301dadb-0181-4b91-8266-2bd2f363f5f5";

describe("QR da entrega (Spec 095, CA5)", () => {
  it("o conteúdo do QR volta igual ao ler", () => {
    const payload = buildDeliveryPayload(requestId, "K7M2QXWA");
    expect(payload).toBe(`ipebook:entrega:${requestId}:K7M2QXWA`);
    expect(parseDeliveryPayload(payload)).toEqual({ requestId, code: "K7M2QXWA" });
  });

  it("aceita o QR com espaços e maiúsculas trocadas", () => {
    expect(parseDeliveryPayload(`  IpeBook:Entrega:${requestId}:k7m2qxwa \n`)).toEqual({ requestId, code: "K7M2QXWA" });
  });

  it("recusa QR de outro app, sem código ou com caracteres fora do alfabeto", () => {
    expect(parseDeliveryPayload("https://exemplo.com")).toBeNull();
    expect(parseDeliveryPayload(`ipebook:entrega:${requestId}`)).toBeNull();
    expect(parseDeliveryPayload(`ipebook:entrega:${requestId}:K7M2QXW0`)).toBeNull();
    expect(parseDeliveryPayload(`ipebook:entrega:${requestId}:K7M2QXW`)).toBeNull();
  });

  it("normaliza o código digitado e valida o formato", () => {
    expect(normalizeDeliveryCode(" k7m2-qxwa ")).toBe("K7M2QXWA");
    expect(isValidDeliveryCode("K7M2QXWA")).toBe(true);
    expect(isValidDeliveryCode("K7M2QXW1")).toBe(false);
    expect(isValidDeliveryCode("k7m2qxwa")).toBe(false);
  });
});
