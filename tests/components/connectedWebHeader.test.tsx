import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react-native";
import { ConnectedWebHeader } from "@/view/components/ConnectedWebHeader";

const authState = {
  loading: false,
  user: null as { id: string; name?: string; email?: string } | null,
};

const refreshMock = vi.fn();

const profileState = { profile: null as { photoUrl?: string } | null };

vi.mock("@/di/container", () => ({
  makeAuthViewModel: () => [authState],
  makeNavigationBadgesViewModel: () => ({ conversations: 3, shelf: 0 }),
  makeNotificationsViewModel: () => [
    { unreadCount: 5 },
    { refresh: refreshMock },
  ],
  makeProfileViewModel: () => [profileState, {}],
}));

vi.mock("@/view/components/WebHeader", () => ({
  WebHeader: (props: Record<string, unknown>) => {
    return <div data-testid="web-header" data-initials={props.initials} data-photo={props.photoUrl ?? ""} data-badges={props.badgeCount} data-notifications={props.notificationCount} />;
  },
}));

describe("ConnectedWebHeader (Spec 093 / Spec 135)", () => {
  it("retorna null se a autenticação estiver carregando", async () => {
    authState.loading = true;
    authState.user = { id: "u-1", name: "Maria Clara" };
    const tela = await render(
      <ConnectedWebHeader pathname="/" onNavigate={vi.fn()} onAnnounce={vi.fn()} onOpenNotifications={vi.fn()} />,
    );
    expect(tela.toJSON()).toBeNull();
  });

  it("retorna null se não houver usuário autenticado", async () => {
    authState.loading = false;
    authState.user = null;
    const tela = await render(
      <ConnectedWebHeader pathname="/" onNavigate={vi.fn()} onAnnounce={vi.fn()} onOpenNotifications={vi.fn()} />,
    );
    expect(tela.toJSON()).toBeNull();
  });

  it("extrai as iniciais de nome composto corretamente", async () => {
    authState.loading = false;
    authState.user = { id: "u-1", name: "Maria Clara Almeida", email: "maria@ipebook.app" };
    const tela = await render(
      <ConnectedWebHeader pathname="/" onNavigate={vi.fn()} onAnnounce={vi.fn()} onOpenNotifications={vi.fn()} />,
    );
    const json = tela.toJSON() as unknown as { props: Record<string, unknown> };
    expect(json.props["data-initials"]).toBe("MA");
    expect(json.props["data-badges"]).toBe(3);
    expect(json.props["data-notifications"]).toBe(5);
  });

  it("extrai a inicial quando o nome é uma única palavra", async () => {
    authState.loading = false;
    authState.user = { id: "u-1", name: "Clara", email: "clara@ipebook.app" };
    const tela = await render(
      <ConnectedWebHeader pathname="/" onNavigate={vi.fn()} onAnnounce={vi.fn()} onOpenNotifications={vi.fn()} />,
    );
    const json = tela.toJSON() as unknown as { props: Record<string, unknown> };
    expect(json.props["data-initials"]).toBe("C");
  });

  it("usa o prefixo do e-mail quando o nome estiver ausente ou vazio", async () => {
    authState.loading = false;
    authState.user = { id: "u-1", name: "", email: "leitor@ipebook.app" };
    const tela = await render(
      <ConnectedWebHeader pathname="/" onNavigate={vi.fn()} onAnnounce={vi.fn()} onOpenNotifications={vi.fn()} />,
    );
    const json = tela.toJSON() as unknown as { props: Record<string, unknown> };
    expect(json.props["data-initials"]).toBe("L");
  });

  it("retorna string vazia se tanto o nome quanto o e-mail forem vazios", async () => {
    authState.loading = false;
    authState.user = { id: "u-1", name: "", email: "" };
    const tela = await render(
      <ConnectedWebHeader pathname="/" onNavigate={vi.fn()} onAnnounce={vi.fn()} onOpenNotifications={vi.fn()} />,
    );
    const json = tela.toJSON() as unknown as { props: Record<string, unknown> };
    expect(json.props["data-initials"]).toBe("");
  });

  it("mostra a foto do perfil público no avatar", async () => {
    authState.loading = false;
    authState.user = { id: "u-1", name: "Maria Clara" };
    profileState.profile = { photoUrl: "https://exemplo.test/foto.jpg" };
    const tela = await render(
      <ConnectedWebHeader pathname="/" onNavigate={vi.fn()} onAnnounce={vi.fn()} onOpenNotifications={vi.fn()} />,
    );
    const json = tela.toJSON() as unknown as { props: Record<string, unknown> };
    expect(json.props["data-photo"]).toBe("https://exemplo.test/foto.jpg");
    profileState.profile = null;
  });
});
