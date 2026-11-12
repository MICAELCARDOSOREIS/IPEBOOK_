import { describe, expect, it, vi } from "vitest";
import { ListingPhotoUseCases } from "@/usecase/listingPhotoUseCases";

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0]);

describe("ListingPhotoUseCases (Spec 092)", () => {
  it("envia a foto para a pasta de anúncios da pessoa com nome único e devolve a URL", async () => {
    const uploadPhoto = vi.fn().mockResolvedValue("https://cdn/u1/anuncio/foto.jpg");
    const uc = new ListingPhotoUseCases({ uploadPhoto, deletePhoto: vi.fn() });
    const url = await uc.uploadListingPhoto(" u1 ", { bytes: JPEG, fileName: "x.jpg" });
    expect(url).toBe("https://cdn/u1/anuncio/foto.jpg");
    const payload = uploadPhoto.mock.calls[0][0];
    expect(payload).toMatchObject({ userId: "u1", bookId: "anuncio", contentType: "image/jpeg" });
    expect(payload.fileName).toMatch(/^foto-\d+-[a-z0-9]+\.jpg$/);
    await uc.uploadListingPhoto("u1", { bytes: JPEG, fileName: "x.jpg" });
    expect(uploadPhoto.mock.calls[1][0].fileName).not.toBe(payload.fileName);
  });

  it("exige sessão, formato de imagem real e tamanho máximo", async () => {
    const uploadPhoto = vi.fn();
    const uc = new ListingPhotoUseCases({ uploadPhoto, deletePhoto: vi.fn() });
    await expect(uc.uploadListingPhoto("", { bytes: JPEG, fileName: "x" })).rejects.toThrow(/Entre na sua conta/);
    await expect(uc.uploadListingPhoto("u1", { bytes: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), fileName: "x" })).rejects.toThrow(/JPEG, PNG ou WebP/);
    await expect(uc.uploadListingPhoto("u1", { bytes: new Uint8Array(5 * 1024 * 1024 + 1), fileName: "x" })).rejects.toThrow(/5 MB/);
    expect(uploadPhoto).not.toHaveBeenCalled();
  });
});
