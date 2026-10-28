import React from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { afterEach, describe, expect, it } from "vitest";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import { StaticMeetingMap } from "@/view/requests/MeetingMapStatic";
import { TopAppBar } from "@/view/components/TopAppBar";

const TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
afterEach(() => {
  if (TOKEN === undefined) delete process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
  else process.env.EXPO_PUBLIC_MAPBOX_TOKEN = TOKEN;
});

async function draw(selectedName: string | null) {
  let screen!: Awaited<ReturnType<typeof render>>;
  await act(async () => {
    screen = await render(<StaticMeetingMap selectedName={selectedName} coveredBottom={0.5} />);
  });
  return { screen, container: screen.toJSON() };
}

describe("mapa estático da web, reserva do interativo (Spec 094, ADR 0072)", () => {
  it("sem token, não desenha nada", async () => {
    delete process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
    const { container } = await draw(null);
    expect(container).toBeNull();
  });

  it("com token, espera a medida do contêiner e mostra a imagem com o ponto escolhido", async () => {
    process.env.EXPO_PUBLIC_MAPBOX_TOKEN = "pk.teste";
    const { screen } = await draw(PIRIPIRI_MEETING_POINTS[1].name);
    expect(screen.queryByLabelText(/^Mapa de Piripiri/)).toBeNull();
    const root = screen.toJSON() as unknown as { props: { onLayout: (event: unknown) => void } };
    await act(async () => { root.props.onLayout({ nativeEvent: { layout: { width: 400, height: 800 } } }); });
    expect(screen.getByLabelText("Mapa de Piripiri com os pontos de encontro; o ponto 2 está selecionado")).toBeDefined();
    // Medir o mesmo tamanho outra vez não refaz a imagem.
    await act(async () => { root.props.onLayout({ nativeEvent: { layout: { width: 400, height: 800 } } }); });
    expect(screen.getAllByLabelText(/^Mapa de Piripiri/)).toHaveLength(1);
  });

  it("sem ponto escolhido, descreve só o mapa; se a imagem falha, some em silêncio", async () => {
    process.env.EXPO_PUBLIC_MAPBOX_TOKEN = "pk.teste";
    const { screen } = await draw(null);
    const root = screen.toJSON() as unknown as { props: { onLayout: (event: unknown) => void } };
    await act(async () => { root.props.onLayout({ nativeEvent: { layout: { width: 300, height: 600 } } }); });
    const image = screen.getByLabelText("Mapa de Piripiri com os pontos de encontro");
    await act(async () => { fireEvent(image, "error"); });
    expect(screen.toJSON()).toBeNull();
  });
});

describe("TopAppBar sobre o mapa (variação flutuante)", () => {
  it("mostra o título e o botão voltar também na variação sobre o mapa", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(<TopAppBar title="Combinar encontro" onBack={() => {}} floating />);
    });
    expect(screen.getByRole("header", { name: "Combinar encontro" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Voltar" })).toBeDefined();
  });
});
