import { render } from "@testing-library/react-native";
import { CachedBookNotice } from "@/view/components/CachedBookNotice";

describe("CachedBookNotice (Spec 142 / ADR 0118)", () => {
  const sampleTimestamp = Date.UTC(2026, 10, 24, 15, 30);

  it("não renderiza nada quando cachedAt é nulo ou indefinido", async () => {
    const screenNull = await render(<CachedBookNotice cachedAt={null} variant="detail" />);
    expect(screenNull.toJSON()).toBeNull();

    const screenUndef = await render(<CachedBookNotice variant="catalog" />);
    expect(screenUndef.toJSON()).toBeNull();
  });

  it("exibe data e hora na variante catálogo e preserva compatibilidade com prop catalog", async () => {
    const screen = await render(<CachedBookNotice cachedAt={sampleTimestamp} variant="catalog" />);
    expect(
      screen.getByText(/Catálogo salvo em \d{2}\/\d{2} às \d{2}:\d{2}\. Conecte-se para carregar mais\./),
    ).toBeDefined();

    const legacy = await render(<CachedBookNotice cachedAt={sampleTimestamp} catalog />);
    expect(
      legacy.getByText(/Catálogo salvo em \d{2}\/\d{2} às \d{2}:\d{2}\. Conecte-se para carregar mais\./),
    ).toBeDefined();
  });

  it("exibe data e hora na variante estante", async () => {
    const screen = await render(<CachedBookNotice cachedAt={sampleTimestamp} variant="shelf" />);
    expect(screen.getByText(/Estante salva em \d{2}\/\d{2} às \d{2}:\d{2}\./)).toBeDefined();
  });

  it("exibe texto próprio de anúncio com data e hora na variante detalhe", async () => {
    const screen = await render(<CachedBookNotice cachedAt={sampleTimestamp} variant="detail" />);
    expect(
      screen.getByText(
        /Anúncio salvo em \d{2}\/\d{2} às \d{2}:\d{2}\. Conecte-se para confirmar a disponibilidade\./,
      ),
    ).toBeDefined();
    expect(screen.queryByText(/Estante salva/)).toBeNull();
  });
});
