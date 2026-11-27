import {
  compactPhotosForPersistence,
  detectBookPhotoSide,
  extractBookSidePhotos,
  toSlotPhotos,
} from "@/model/bookPhotos";

describe("bookPhotos: mapeamento de lombada e verso sem perder slots", () => {
  const spineUrl = "https://cdn.ipebook.app/book-photos/u1/anuncio/17956-foto-lombada-123.jpg";
  const backUrl = "https://cdn.ipebook.app/book-photos/u1/anuncio/17956-foto-verso-456.jpg";
  const legacy1 = "https://cdn.ipebook.app/book-photos/u1/anuncio/17956-foto-aaa.jpg";
  const legacy2 = "https://cdn.ipebook.app/book-photos/u1/anuncio/17956-foto-bbb.jpg";

  it("identifica lado marcado pelo nome do arquivo na URL", () => {
    expect(detectBookPhotoSide(spineUrl)).toBe("spine");
    expect(detectBookPhotoSide(backUrl)).toBe("back");
    expect(detectBookPhotoSide(legacy1)).toBeNull();
    expect(detectBookPhotoSide("")).toBeNull();
  });

  it("mantém verso apenas no verso quando não há foto da lombada", () => {
    expect(extractBookSidePhotos([backUrl])).toEqual({
      backPhotoUrl: backUrl,
      extras: [],
    });
    expect(toSlotPhotos([backUrl])).toEqual(["", backUrl]);
  });

  it("mapeia lombada e verso corretamente independentemente da ordem salva", () => {
    expect(extractBookSidePhotos([backUrl, spineUrl])).toEqual({
      spinePhotoUrl: spineUrl,
      backPhotoUrl: backUrl,
      extras: [],
    });
    expect(toSlotPhotos([backUrl, spineUrl])).toEqual([spineUrl, backUrl]);
  });

  it("preserva retrocompatibilidade para livros legados sem marcação no nome", () => {
    expect(extractBookSidePhotos([legacy1, legacy2])).toEqual({
      spinePhotoUrl: legacy1,
      backPhotoUrl: legacy2,
      extras: [],
    });
    expect(toSlotPhotos([legacy1])).toEqual([legacy1]);
  });

  it("remove slots vazios antes de validar ou enviar ao banco", () => {
    expect(compactPhotosForPersistence(["", backUrl, "   "])).toEqual([backUrl]);
    expect(compactPhotosForPersistence([spineUrl, backUrl])).toEqual([spineUrl, backUrl]);
  });
});
