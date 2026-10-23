import { describe, expect, it } from "vitest";
import { isValidIsbn, isValidIsbn10, isValidIsbn13, normalizeIsbn } from "@/model/isbn";

describe("isbnValidator (Spec 058)", () => {
  it("normaliza ISBN removendo hífens e espaços em branco", () => {
    expect(normalizeIsbn("978-85-359-1484-9")).toBe("9788535914849");
    expect(normalizeIsbn("  85 359 1484 6  ")).toBe("8535914846");
    expect(normalizeIsbn("0-19-853453-x")).toBe("019853453X");
  });

  it("valida ISBN-10 com dígito verificador numérico ou X", () => {
    // 0198534531 é um ISBN-10 válido
    expect(isValidIsbn10("0-19-853453-1")).toBe(true);
    // 080442957X é um ISBN-10 com dígito X válido
    expect(isValidIsbn10("080442957X")).toBe(true);
    // ISBN inválido
    expect(isValidIsbn10("0804429571")).toBe(false);
    expect(isValidIsbn10("123")).toBe(false);
  });

  it("valida ISBN-13 com cálculo de checksum oficial", () => {
    // 9788535914849 (Dom Casmurro)
    expect(isValidIsbn13("978-85-359-1484-9")).toBe(true);
    // 9788508114320 (O Cortiço)
    expect(isValidIsbn13("978-85-08-11432-0")).toBe(true);
    // Checksum errado
    expect(isValidIsbn13("978-85-359-1484-0")).toBe(false);
    expect(isValidIsbn13("abc")).toBe(false);
  });

  it("função geral isValidIsbn detecta tanto 10 quanto 13 dígitos", () => {
    expect(isValidIsbn("978-85-359-1484-9")).toBe(true);
    expect(isValidIsbn("0-19-853453-1")).toBe(true);
    expect(isValidIsbn("123456789012345")).toBe(false);
    expect(isValidIsbn("")).toBe(false);
  });
});
