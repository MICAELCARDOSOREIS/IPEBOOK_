import { fireEvent, render } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import { Platform, StyleSheet } from "react-native";
import type { Book } from "@/model/entities/book";
import { Chip } from "@/view/components/Chip";
import { CatalogCarousel } from "@/view/home/CatalogCarousel";
import { HomeFloatingAddButton } from "@/view/home/HomeFloatingChatButton";
import { SearchBookCard } from "@/view/search/SearchBookCard";
import { colors, tokens } from "@/view/tokens";

const sampleBook: Book = {
  id: "livro-1",
  title: "O Pequeno Príncipe",
  author: "Antoine de Saint-Exupéry",
  modality: "sale",
  price: 25,
  condition: "good",
  status: "available",
  ownerId: "user-1",
  neighborhood: "Centro",
  createdAt: "2026-11-18T12:00:00.000Z",
};

describe("Cards de Catálogo e Busca iOS 26 (Spec 137 · #229)", () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, "OS", { value: originalPlatform, configurable: true });
    jest.clearAllMocks();
  });

  it("aplica superfície Liquid Glass (radius 20) e haptic ao tocar em card do catálogo no iOS", async () => {
    Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
    const impactSpy = jest.spyOn(Haptics, "impactAsync").mockResolvedValue();
    const onDetail = jest.fn();

    const view = await render(
      <CatalogCarousel
        title="Destaques"
        books={[sampleBook]}
        onNavigateToBookDetail={onDetail}
        onViewMore={jest.fn()}
        viewMoreLabel="Ver mais"
      />,
    );

    const card = view.getByLabelText("Ver detalhe de O Pequeno Príncipe, Antoine de Saint-Exupéry em Centro");
    const style = StyleSheet.flatten(card.props.style);
    expect(style.borderRadius).toBe(tokens.radius.xl);
    expect(style.backgroundColor).toBe(tokens.glass.fill);

    await fireEvent.press(card);
    expect(onDetail).toHaveBeenCalledWith("livro-1");
    expect(impactSpy).toHaveBeenCalledTimes(1);
    impactSpy.mockRestore();
  });

  it("aplica haptic no card de busca no iOS e preserva Android sem alterações", async () => {
    Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
    const impactSpy = jest.spyOn(Haptics, "impactAsync").mockResolvedValue();
    const onPress = jest.fn();

    const iosView = await render(
      <SearchBookCard
        item={sampleBook}
        wideWeb={false}
        gridColumns={1}
        userId={null}
        onPress={onPress}
        onFavoriteToggle={jest.fn()}
      />,
    );
    await fireEvent.press(iosView.getByLabelText("Ver detalhe de O Pequeno Príncipe, Antoine de Saint-Exupéry em Centro"));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(impactSpy).toHaveBeenCalledTimes(1);

    Object.defineProperty(Platform, "OS", { value: "android", configurable: true });
    const androidView = await render(
      <SearchBookCard
        item={sampleBook}
        wideWeb={false}
        gridColumns={1}
        userId={null}
        onPress={onPress}
        onFavoriteToggle={jest.fn()}
      />,
    );
    await fireEvent.press(androidView.getByLabelText("Ver detalhe de O Pequeno Príncipe, Antoine de Saint-Exupéry em Centro"));
    expect(impactSpy).toHaveBeenCalledTimes(1);
    impactSpy.mockRestore();
  });

  it("aplica Liquid Glass e haptic no botão flutuante e chips da Home no iOS", async () => {
    Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
    const impactSpy = jest.spyOn(Haptics, "impactAsync").mockResolvedValue();
    const onAdd = jest.fn();

    const addView = await render(<HomeFloatingAddButton onPress={onAdd} />);
    const fab = addView.getByTestId("home-floating-add-button");
    const fabStyle = StyleSheet.flatten(fab.props.style);
    expect(fabStyle.borderRadius).toBe(tokens.radius.full);
    expect(fabStyle.backgroundColor).toBe(tokens.glass.fill);
    await fireEvent.press(fab);
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(impactSpy).toHaveBeenCalledTimes(1);

    const chipView = await render(<Chip label="Venda" selected={false} onPress={jest.fn()} />);
    const chipStyle = StyleSheet.flatten(chipView.getByRole("checkbox", { name: "Venda" }).props.style);
    expect(chipStyle.backgroundColor).toBe(tokens.glass.fill);
    expect(chipStyle.borderColor).toBe(tokens.glass.stroke);

    Object.defineProperty(Platform, "OS", { value: "android", configurable: true });
    const androidFab = await render(<HomeFloatingAddButton onPress={onAdd} />);
    const androidFabStyle = StyleSheet.flatten(androidFab.getByTestId("home-floating-add-button").props.style);
    expect(androidFabStyle.backgroundColor).toBe(colors.nature.sprout);
    impactSpy.mockRestore();
  });
});
