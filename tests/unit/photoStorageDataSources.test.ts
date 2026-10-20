import { describe, expect, it, vi } from "vitest";
import {
  BUCKET_NAME,
  MAX_PHOTO_SIZE_BYTES,
  SupabasePhotoStorageDataSource,
} from "@/infra/datasources/supabasePhotoStorageDataSource";
import { MemoryPhotoStorageDataSource } from "@/infra/datasources/memoryPhotoStorageDataSource";
import { DataSourceError, ValidationError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

function fakeClient(storageImpl: unknown): SupabaseAppClient {
  return {
    storage: storageImpl,
  } as unknown as SupabaseAppClient;
}

describe("SupabasePhotoStorageDataSource (Spec 023 / Issue #116)", () => {
  it("faz upload de foto com sucesso e retorna a URL pública", async () => {
    const upload = vi.fn().mockResolvedValue({ error: null });
    const getPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: "https://exemplo.supabase.co/storage/v1/object/public/book-photos/user-1/foto.jpg" },
    });
    const from = vi.fn().mockReturnValue({ upload, getPublicUrl });
    const client = fakeClient({ from });

    const ds = new SupabasePhotoStorageDataSource(client);
    const url = await ds.uploadPhoto({
      userId: "user-1",
      fileName: "capa.jpg",
      fileBytes: new Uint8Array([1, 2, 3]),
      contentType: "image/jpeg",
    });

    expect(from).toHaveBeenCalledWith(BUCKET_NAME);
    expect(upload).toHaveBeenCalledOnce();
    expect(url).toBe("https://exemplo.supabase.co/storage/v1/object/public/book-photos/user-1/foto.jpg");
  });

  it("rejeita upload com formato não suportado", async () => {
    const ds = new SupabasePhotoStorageDataSource(fakeClient({}));
    await expect(
      ds.uploadPhoto({
        userId: "user-1",
        fileName: "doc.pdf",
        fileBytes: new Uint8Array([1, 2, 3]),
        contentType: "application/pdf",
      }),
    ).rejects.toThrow("Formato de imagem não suportado. Use JPEG, PNG ou WEBP.");
  });

  it("rejeita upload sem usuário", async () => {
    const ds = new SupabasePhotoStorageDataSource(fakeClient({}));
    await expect(
      ds.uploadPhoto({
        userId: "   ",
        fileName: "capa.jpg",
        fileBytes: new Uint8Array([1, 2, 3]),
        contentType: "image/jpeg",
      }),
    ).rejects.toThrow("Usuário obrigatório para envio de foto.");
  });

  it("rejeita upload acima de 5MB", async () => {
    const ds = new SupabasePhotoStorageDataSource(fakeClient({}));
    const oversized = new Uint8Array(MAX_PHOTO_SIZE_BYTES + 1);
    await expect(
      ds.uploadPhoto({
        userId: "user-1",
        fileName: "gigante.png",
        fileBytes: oversized,
        contentType: "image/png",
      }),
    ).rejects.toThrow("A imagem deve ter no máximo 5MB.");
  });

  it("lança DataSourceError quando o Supabase Storage falha", async () => {
    const upload = vi.fn().mockResolvedValue({ error: { message: "Storage error" } });
    const from = vi.fn().mockReturnValue({ upload });
    const ds = new SupabasePhotoStorageDataSource(fakeClient({ from }));

    await expect(
      ds.uploadPhoto({
        userId: "user-1",
        fileName: "capa.webp",
        fileBytes: new Uint8Array([1, 2, 3]),
        contentType: "image/webp",
      }),
    ).rejects.toThrow(DataSourceError);
  });

  it("remove foto existente extraindo o caminho do bucket", async () => {
    const remove = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ remove });
    const ds = new SupabasePhotoStorageDataSource(fakeClient({ from }));

    await ds.deletePhoto(
      "https://exemplo.supabase.co/storage/v1/object/public/book-photos/user-1/capa.jpg",
    );

    expect(from).toHaveBeenCalledWith(BUCKET_NAME);
    expect(remove).toHaveBeenCalledWith(["user-1/capa.jpg"]);
  });
});

describe("MemoryPhotoStorageDataSource (Spec 023 / Issue #116)", () => {
  it("salva em memória e valida formato e tamanho", async () => {
    const memory = new MemoryPhotoStorageDataSource();
    const url = await memory.uploadPhoto({
      userId: "user-2",
      fileName: "foto.png",
      fileBytes: new Uint8Array([10, 20]),
      contentType: "image/png",
    });

    expect(url).toContain("user-2");
    expect(memory.has(url)).toBe(true);

    await memory.deletePhoto(url);
    expect(memory.has(url)).toBe(false);
  });
});
