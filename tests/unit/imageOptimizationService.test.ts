import { describe, expect, it } from "vitest";
import {
  MAX_IMAGE_SIZE_BYTES,
  sanitizeImageFilename,
  validateImageFile,
} from "@/infra/services/imageOptimizationService";

describe("ImageOptimizationService", () => {
  describe("validateImageFile", () => {
    it("aceita imagem JPEG válida dentro do limite", () => {
      const res = validateImageFile({
        name: "capa_livro.jpg",
        size: 1024 * 500, // 500 KB
        type: "image/jpeg",
      });
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it("aceita imagem PNG válida", () => {
      const res = validateImageFile({
        name: "foto.png",
        size: 1024 * 1024 * 2, // 2 MB
        type: "image/png",
      });
      expect(res.valid).toBe(true);
    });

    it("aceita imagem WebP válida", () => {
      const res = validateImageFile({
        name: "foto.webp",
        size: 1024 * 300,
        type: "image/webp",
      });
      expect(res.valid).toBe(true);
    });

    it("rejeita arquivo com tamanho zero (vazio)", () => {
      const res = validateImageFile({
        name: "vazio.jpg",
        size: 0,
        type: "image/jpeg",
      });
      expect(res.valid).toBe(false);
      expect(res.error).toContain("vazio");
    });

    it("rejeita arquivo acima do limite de 5 MB", () => {
      const res = validateImageFile({
        name: "foto_pesada.jpg",
        size: MAX_IMAGE_SIZE_BYTES + 1,
        type: "image/jpeg",
      });
      expect(res.valid).toBe(false);
      expect(res.error).toContain("5 MB");
    });

    it("rejeita formato não suportado (ex: PDF ou executável)", () => {
      const res = validateImageFile({
        name: "documento.pdf",
        size: 1024 * 50,
        type: "application/pdf",
      });
      expect(res.valid).toBe(false);
      expect(res.error).toContain("não suportado");
    });

    it("rejeita arquivo sem metadados válidos", () => {
      const res = validateImageFile(null as any);
      expect(res.valid).toBe(false);
    });
  });

  describe("sanitizeImageFilename", () => {
    it("sanitiza nome prevenindo path traversal", () => {
      const safe = sanitizeImageFilename("../../../etc/passwd.png");
      expect(safe).not.toContain("..");
      expect(safe).not.toContain("/");
      expect(safe).toMatch(/^capa_\d+_[a-z0-9]+\.png$/);
    });

    it("converte extensão desconhecida para jpg como fallback seguro", () => {
      const safe = sanitizeImageFilename("script.exe");
      expect(safe.endsWith(".jpg")).toBe(true);
    });
  });
});
