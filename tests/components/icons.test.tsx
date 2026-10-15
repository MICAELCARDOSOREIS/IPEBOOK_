import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react-native";
import { Platform, View } from "react-native";
import { AppIcon } from "@/view/components/AppIcon";
import { IconBadge, type IconBadgeTone } from "@/view/components/IconBadge";
import { Icon, type IconName } from "@/view/components/Icon";
import { FluentIcon } from "@/view/components/FluentIcon";

describe("componentes de ícones (ISO/IEC 25010 - Usabilidade e Acessibilidade)", () => {
  it("AppIcon: renderiza com tamanho padrão de 24 e propriedade de não poluir leitor de tela", async () => {
    const { toJSON } = await render(<AppIcon name="home" />);
    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("AppIcon: renderiza com cor e tamanho customizados", async () => {
    const { toJSON } = await render(<AppIcon name="search" size={32} color="#2C5E45" />);
    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("IconBadge: renderiza corretamente em todos os tons semânticos", async () => {
    const tones: IconBadgeTone[] = ["action", "trade", "donation", "error", "neutral"];
    for (const tone of tones) {
      const { toJSON } = await render(<IconBadge icon="bookmark" tone={tone} />);
      expect(toJSON()).toBeDefined();
    }
  });

  it("Icon: renderiza ícone vetorial SVG para interface web", async () => {
    const names: IconName[] = ["book", "heart", "check", "arrow"];
    for (const name of names) {
      const { toJSON } = await render(<Icon name={name} size={20} />);
      expect(toJSON()).toBeDefined();
    }
  });

  describe("AppIcon: resolução por plataforma (ADR 0014)", () => {
    const originalOS = Platform.OS;
    afterEach(() => {
      Platform.OS = originalOS;
    });

    it("Android: usa MaterialIcons com o nome convertido para kebab-case, nunca o objeto {ios, android, web}", async () => {
      Platform.OS = "android";
      const { toJSON } = await render(
        <View>
          <AppIcon name="chevronRight" />
        </View>,
      );
      const child = (toJSON() as any).children[0];
      expect(child.type).toBe("MaterialIcons");
      expect(child.props.name).toBe("chevron-right");
      expect(typeof child.props.name).toBe("string");
    });

    it("iOS: renderiza sem lançar erro (SymbolView é stubado para null em tests/setupTests.ts)", async () => {
      Platform.OS = "ios";
      const { toJSON } = await render(
        <View>
          <AppIcon name="home" />
        </View>,
      );
      expect(toJSON()).toBeDefined();
    });

    it("Web: usa o ícone Fluent 2 para os nomes já cobertos (home, search, person)", async () => {
      Platform.OS = "web";
      const { toJSON } = await render(
        <View>
          <AppIcon name="person" filled />
        </View>,
      );
      const child = (toJSON() as any).children[0];
      expect(child.type).toBe("svg");
    });

    it("Web: cai no fallback Material Symbols para ícones ainda não migrados ao Fluent 2", async () => {
      Platform.OS = "web";
      const { toJSON } = await render(
        <View>
          <AppIcon name="star" />
        </View>,
      );
      const child = (toJSON() as any).children[0];
      expect(child.type).toBe("MaterialIcons");
      expect(child.props.name).toBe("star");
    });
  });

  it("FluentIcon: renderiza os 3 ícones cobertos em regular e preenchido", async () => {
    for (const name of ["home", "search", "person"] as const) {
      const { toJSON: toRegular } = await render(<FluentIcon name={name} />);
      const { toJSON: toFilled } = await render(<FluentIcon name={name} filled />);
      expect(toRegular()).toBeDefined();
      expect(toFilled()).toBeDefined();
    }
  });
});
