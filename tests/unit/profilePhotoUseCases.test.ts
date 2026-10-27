import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/model/errors";
import { detectImageMimeType } from "@/model/validators/imageBytesValidator";
import { ProfilePhotoUseCases } from "@/usecase/profilePhotoUseCases";
import type { IPhotoStorageDataSource } from "@/model/datasources/iPhotoStorageDataSource";

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const WEBP = new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50]);
const GIF = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0, 0, 0, 0, 0, 0]);

describe("detectImageMimeType (Spec 081, CA1)", () => {
  it("reconhece JPEG, PNG e WebP pelos bytes iniciais", () => {
    expect(detectImageMimeType(JPEG)).toBe("image/jpeg");
    expect(detectImageMimeType(PNG)).toBe("image/png");
    expect(detectImageMimeType(WEBP)).toBe("image/webp");
  });

  it("recusa GIF, arquivo curto e texto disfarçado", () => {
    expect(detectImageMimeType(GIF)).toBeNull();
    expect(detectImageMimeType(new Uint8Array([0xff, 0xd8]))).toBeNull();
    expect(detectImageMimeType(new TextEncoder().encode("<script>alert(1)</script>"))).toBeNull();
  });
});

describe("ProfilePhotoUseCases (Spec 081, CA2)", () => {
  function storage(): IPhotoStorageDataSource & { uploadPhoto: ReturnType<typeof vi.fn> } {
    return {
      uploadPhoto: vi.fn(async () => "https://cdn.exemplo/book-photos/u1/perfil/foto.jpg"),
      deletePhoto: vi.fn(async () => {}),
    };
  }

  it("envia JPEG válido para a pasta perfil do usuário com o tipo detectado", async () => {
    const photos = storage();
    const url = await new ProfilePhotoUseCases(photos).uploadProfilePhoto("u1", { bytes: JPEG, fileName: "IMG 01.jpg" });
    expect(url).toBe("https://cdn.exemplo/book-photos/u1/perfil/foto.jpg");
    expect(photos.uploadPhoto).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u1", bookId: "perfil", contentType: "image/jpeg", fileBytes: JPEG }),
    );
  });

  it("usa o tipo dos bytes, não o nome do arquivo", async () => {
    const photos = storage();
    await new ProfilePhotoUseCases(photos).uploadProfilePhoto("u1", { bytes: PNG, fileName: "foto.jpg" });
    expect(photos.uploadPhoto).toHaveBeenCalledWith(expect.objectContaining({ contentType: "image/png" }));
  });

  it("recusa formato inválido, arquivo acima de 5 MB e usuário vazio sem enviar", async () => {
    const photos = storage();
    const useCases = new ProfilePhotoUseCases(photos);
    await expect(useCases.uploadProfilePhoto("u1", { bytes: GIF, fileName: "a.gif" })).rejects.toThrow(
      "Use uma foto em JPEG, PNG ou WebP.",
    );
    const big = new Uint8Array(5 * 1024 * 1024 + 1);
    big.set(JPEG);
    await expect(useCases.uploadProfilePhoto("u1", { bytes: big, fileName: "a.jpg" })).rejects.toThrow(
      "A foto deve ter no máximo 5 MB.",
    );
    await expect(useCases.uploadProfilePhoto(" ", { bytes: JPEG, fileName: "a.jpg" })).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(photos.uploadPhoto).not.toHaveBeenCalled();
  });
});
