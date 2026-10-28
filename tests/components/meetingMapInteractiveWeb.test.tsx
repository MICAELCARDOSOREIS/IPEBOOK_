import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";

// mapbox-gl simulado: guarda o que o componente pede, sem WebGL.
const gl = vi.hoisted(() => ({
  fail: false,
  maps: [] as Array<Record<string, any>>,
  markers: [] as Array<Record<string, any>>,
  elements: [] as Array<Record<string, any>>,
}));
vi.mock("mapbox-gl", () => {
  class FakeMap {
    options: Record<string, any>;
    calls: Array<[string, any]> = [];
    removed = false;
    constructor(options: Record<string, any>) {
      if (gl.fail) throw new Error("WebGL indisponível");
      this.options = options;
      gl.maps.push(this);
    }
    easeTo(arg: unknown) { this.calls.push(["easeTo", arg]); }
    fitBounds(...arg: unknown[]) { this.calls.push(["fitBounds", arg]); }
    setStyle(arg: unknown) { this.calls.push(["setStyle", arg]); }
    resize() { this.calls.push(["resize", null]); }
    remove() { this.removed = true; }
  }
  class FakeMarker {
    lngLat: unknown; removed = false; element: Record<string, any>;
    constructor(o: { element: Record<string, any> }) { this.element = o.element; gl.markers.push(this); }
    setLngLat(v: unknown) { this.lngLat = v; return this; }
    addTo() { return this; }
    remove() { this.removed = true; }
  }
  return { default: { Map: FakeMap, Marker: FakeMarker, accessToken: "" } };
});
vi.mock("mapbox-gl/dist/mapbox-gl.css", () => ({}));

import { MeetingMap } from "@/view/requests/MeetingMap";

const TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
const mounted: ReactTestRenderer[] = [];
let corners: Array<{ style: { bottom?: string } }>;

beforeEach(() => {
  gl.fail = false; gl.maps = []; gl.markers = []; gl.elements = [];
  corners = [{ style: {} }, { style: {} }];
  process.env.EXPO_PUBLIC_MAPBOX_TOKEN = "pk.teste";
  vi.stubGlobal("document", {
    createElement: () => {
      const listeners: Record<string, () => void> = {};
      const attrs: Record<string, string> = {};
      const element = {
        style: {} as Record<string, string>, textContent: "", type: "",
        setAttribute: (k: string, v: string) => { attrs[k] = v; },
        addEventListener: (k: string, fn: () => void) => { listeners[k] = fn; },
        attrs, click: () => listeners.click?.(),
      };
      gl.elements.push(element);
      return element;
    },
  });
});
afterEach(() => {
  while (mounted.length) mounted.pop()?.unmount();
  if (TOKEN === undefined) delete process.env.EXPO_PUBLIC_MAPBOX_TOKEN; else process.env.EXPO_PUBLIC_MAPBOX_TOKEN = TOKEN;
  vi.unstubAllGlobals();
});

async function mount(props: Partial<React.ComponentProps<typeof MeetingMap>> = {}) {
  const container = { clientHeight: 800, querySelectorAll: () => ({ forEach: (fn: (c: unknown) => void) => corners.forEach(fn) }) };
  let renderer!: ReactTestRenderer;
  await act(async () => {
    renderer = create(<MeetingMap selectedName={null} {...props} />, { createNodeMock: () => container });
    mounted.push(renderer);
  });
  await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  return renderer;
}

describe("mapa interativo da web (Spec 094, ADR 0072)", () => {
  it("sem token, não desenha nada", async () => {
    delete process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
    const renderer = await mount();
    expect(renderer.toJSON()).toBeNull();
    expect(gl.maps).toHaveLength(0);
  });

  it("cria o mapa com o token, enquadra os 4 pontos e põe um pino numerado em cada um", async () => {
    await mount();
    expect(gl.maps).toHaveLength(1);
    const options = gl.maps[0].options;
    expect(options.style).toBe("mapbox://styles/mapbox/streets-v12");
    expect(options.bounds).toHaveLength(2);
    expect(gl.markers.map((m) => m.lngLat)).toEqual(PIRIPIRI_MEETING_POINTS.map((p) => [p.longitude, p.latitude]));
    expect(gl.elements.map((e) => e.textContent)).toEqual(["1", "2", "3", "4"]);
    expect(gl.elements[2].attrs["aria-label"]).toBe(`Escolher o local 3, ${PIRIPIRI_MEETING_POINTS[2].name}`);
  });

  it("tocar no pino escolhe o local, mesmo com a função trocada depois", async () => {
    const first = vi.fn();
    const renderer = await mount({ onSelect: first });
    const second = vi.fn();
    await act(async () => { renderer.update(<MeetingMap selectedName={null} onSelect={second} />); });
    gl.elements[1].click();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(PIRIPIRI_MEETING_POINTS[1].name);
  });

  it("o pino escolhido fica marcado, maior e por cima", async () => {
    await mount({ selectedName: PIRIPIRI_MEETING_POINTS[2].name });
    expect(gl.elements[2].attrs["aria-pressed"]).toBe("true");
    expect(gl.elements[2].style.width).toBe("48px");
    expect(gl.elements[2].style.zIndex).toBe("2");
    expect(gl.elements[0].attrs["aria-pressed"]).toBe("false");
    expect(gl.elements[0].style.width).toBe("36px");
  });

  it("com local escolhido aproxima dele; sem escolha enquadra todos, sempre acima do painel", async () => {
    const renderer = await mount({ sheetHeight: 300 });
    const map = gl.maps[0];
    const fit = map.calls.filter(([name]: [string]) => name === "fitBounds").pop();
    expect(fit[1][1].padding).toMatchObject({ top: 150, bottom: 348 });

    await act(async () => { renderer.update(<MeetingMap selectedName={PIRIPIRI_MEETING_POINTS[0].name} sheetHeight={300} />); });
    const ease = map.calls.filter(([name]: [string]) => name === "easeTo").pop();
    expect(ease[1]).toMatchObject({
      center: [PIRIPIRI_MEETING_POINTS[0].longitude, PIRIPIRI_MEETING_POINTS[0].latitude],
      zoom: 14.5,
      padding: { bottom: 348 },
    });
  });

  it("sem altura medida do painel, usa a fração da altura do mapa", async () => {
    await mount({ coveredBottom: 0.5 });
    const fit = gl.maps[0].calls.filter(([name]: [string]) => name === "fitBounds").pop();
    expect(fit[1][1].padding.bottom).toBe(448);
  });

  it("logo e atribuição do Mapbox ficam acima do painel", async () => {
    const renderer = await mount({ sheetHeight: 280 });
    expect(corners.map((c) => c.style.bottom)).toEqual(["280px", "280px"]);
    await act(async () => { renderer.update(<MeetingMap selectedName={null} sheetHeight={120} />); });
    expect(corners.map((c) => c.style.bottom)).toEqual(["120px", "120px"]);
  });

  it("sem WebGL ou com falha ao carregar, cai na imagem estática", async () => {
    gl.fail = true;
    const renderer = await mount();
    const json = JSON.stringify(renderer.toJSON());
    expect(json).not.toContain("region");
    expect(gl.maps).toHaveLength(0);
  });

  it("ao sair da tela, remove os pinos e o mapa", async () => {
    const renderer = await mount();
    const map = gl.maps[0];
    await act(async () => { renderer.unmount(); });
    expect(map.removed).toBe(true);
    expect(gl.markers.every((m) => m.removed)).toBe(true);
  });
});
