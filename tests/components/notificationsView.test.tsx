
import { act, fireEvent, render } from "@testing-library/react-native";
import Notifications from "@/view/notifications/notifications";
import NotificationsScreen from "@/view/notifications/notificationsScreen";

describe("Notifications Component (Spec 015)", () => {
  beforeEach(async () => {
    const { notificationUseCases } = await import("@/di/container");
    const ds = (notificationUseCases as unknown as { dataSource?: { notifications?: unknown[] } }).dataSource;
    if (ds && Array.isArray(ds.notifications)) {
      ds.notifications.length = 0;
      ds.notifications.push(
        {
          id: "notif-001",
          userId: "user-1",
          title: "Dica de Segurança em Piripiri",
          message: "Ao marcar entregas de livros, priorize locais públicos e movimentados como o IFPI ou a Praça da Bandeira.",
          type: "safety_tip",
          read: false,
          createdAt: "2026-10-15T10:00:00.000Z",
          actionUrl: "/ajuda",
        },
        {
          id: "notif-002",
          userId: "user-1",
          title: "Novo pedido para seu livro!",
          message: "Um leitor solicitou um exemplar do seu catálogo de doações.",
          type: "request_received",
          read: false,
          createdAt: "2026-10-14T14:30:00.000Z",
          actionUrl: "/pedidos-recebidos",
        },
        {
          id: "notif-003",
          userId: "user-1",
          title: "Pedido aceito!",
          message: "Sua solicitação de livro foi aceita. Veja as orientações de encontro.",
          type: "request_accepted",
          read: true,
          createdAt: "2026-10-13T09:15:00.000Z",
          actionUrl: "/meus-pedidos",
        },
      );
    }
  });
  it("exibe aviso de sessão necessária quando o usuário não estiver autenticado", async () => {
    const onLogin = jest.fn();
    const onBack = jest.fn();
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <Notifications
          sessionUserId={null}
          onBack={onBack}
          onNavigateToLogin={onLogin}
        />,
      );
    });

    expect(screen.getByRole("header", { name: "Sessão necessária" })).toBeDefined();
    expect(screen.getByText(/Você precisa estar conectado à sua conta/)).toBeDefined();

    const loginBtn = screen.getByRole("button", { name: "Entrar na conta" });
    await act(async () => {
      fireEvent.press(loginBtn);
    });
    expect(onLogin).toHaveBeenCalledTimes(1);

    const backBtn = screen.getByRole("button", { name: "Voltar" });
    await act(async () => {
      fireEvent.press(backBtn);
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("anuncia contagens dos filtros e filtra as notificações não lidas", async () => {
    const onBack = jest.fn();
    const onAction = jest.fn();
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <Notifications
          sessionUserId="user-1"
          onBack={onBack}
          onNavigateToAction={onAction}
        />,
      );
    });

    expect(screen.getByRole("header", { name: "Notificações" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Todas (3)", selected: true })).toBeDefined();
    expect(screen.getByRole("button", { name: "Não lidas (2)", selected: false })).toBeDefined();

    // Filtra por não lidas
    const unreadFilter = screen.getByRole("button", { name: "Não lidas (2)" });
    await act(async () => {
      fireEvent.press(unreadFilter);
    });
    expect(screen.getByRole("button", { name: "Não lidas (2)", selected: true })).toBeDefined();
    expect(screen.queryByText("Pedido aceito!")).toBeNull();

    // Clica no botão de marcar lidas se estiver visível
    const markAllBtn = screen.queryByRole("button", { name: "Marcar todas como lidas" });
    if (markAllBtn) {
      await act(async () => {
        fireEvent.press(markAllBtn);
      });
    }

    // Quando não há não lidas, exibe botão para voltar a todas (Issue #163)
    const seeAllBtn = screen.queryByRole("button", { name: "Ver todas as notificações" });
    if (seeAllBtn) {
      await act(async () => {
        fireEvent.press(seeAllBtn);
      });
    }

    // Clica em uma notificação para navegar
    const notifButtons = screen.getAllByRole("button");
    const itemBtn = notifButtons.find((btn) =>
      btn.props.accessibilityLabel?.includes("Dica de Segurança"),
    );
    if (itemBtn) {
      await act(async () => {
        fireEvent.press(itemBtn);
      });
      expect(onAction).toHaveBeenCalledWith("/ajuda");
    }

    // Clica em voltar
    const backBtn = screen.getByRole("button", { name: "Voltar" });
    await act(async () => {
      fireEvent.press(backBtn);
    });
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renderiza NotificationsScreen integrando com estado de autenticação", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <NotificationsScreen
          onBack={() => {}}
          onNavigateToLogin={() => {}}
          onNavigateToAction={() => {}}
          onExploreBooks={() => {}}
        />,
      );
    });

    expect(screen.getByRole("header", { name: "Notificações" })).toBeDefined();
  });

  it("agrupa as notificações por data com cabeçalhos legíveis", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<Notifications sessionUserId="user-1" onBack={jest.fn()} />);
    });

    const cabecalhos = screen
      .getAllByRole("header")
      .map((node) => node.props.children)
      .filter((texto) => typeof texto === "string" && /^(Hoje|\d{1,2} de \p{L}+( de \d{4})?)$/u.test(texto));

    expect(cabecalhos.length).toBeGreaterThan(0);
    // Spec 043 RN-12: cada item traz o horário curto ("· 10h", "· Seg" ou "· 10/10").
    expect(screen.getAllByText(/(?:^| )·\s(\d{1,2}h|Dom|Seg|Ter|Qua|Qui|Sex|Sáb|\d{2}\/\d{2})$/).length).toBeGreaterThan(0);
  });

  it("permite marcar uma notificação individualmente como lida", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<Notifications sessionUserId="user-1" onBack={jest.fn()} />);
    });

    const markReadBtn = screen.getByTestId("mark-read-notif-notif-001");
    expect(markReadBtn).toBeDefined();

    await act(async () => {
      fireEvent.press(markReadBtn);
    });

    expect(screen.queryByTestId("mark-read-notif-notif-001")).toBeNull();
    expect(screen.getByText("Dica de Segurança em Piripiri")).toBeDefined();
  });

  it("exibe alerta quando as permissões de notificação estiverem desativadas (Spec 111)", async () => {
    const { pushNotificationService } = await import("@/di/container");
    jest.spyOn(pushNotificationService, "getPermissions").mockResolvedValueOnce(false);
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<Notifications sessionUserId="user-1" onBack={jest.fn()} />);
    });

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText("Notificações desativadas")).toBeDefined();
    expect(screen.getByText(/Ative as notificações do IpêBook/)).toBeDefined();
  });

  it("permite excluir uma notificação individualmente", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<Notifications sessionUserId="user-1" onBack={jest.fn()} />);
    });

    const deleteBtn = screen.getByTestId("delete-notif-notif-001");
    expect(deleteBtn).toBeDefined();

    await act(async () => {
      fireEvent.press(deleteBtn);
    });

    expect(screen.queryByTestId("delete-notif-notif-001")).toBeNull();
  });

  it("confirma exclusão de notificações lidas e depois a exclusão de todas", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(<Notifications sessionUserId="user-1" onBack={jest.fn()} />);
    });

    const openManagement = async () => {
      await act(async () => {
        fireEvent.press(screen.getByRole("button", { name: "Gerenciar notificações" }));
      });
    };

    await openManagement();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Excluir notificações lidas" }));
    });
    expect(screen.getByText("Excluir notificações lidas?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Excluir" })); });

    await openManagement();
    await act(async () => {
      fireEvent.press(screen.getByRole("button", { name: "Excluir todas as notificações" }));
    });
    expect(screen.getByText("Excluir todas as notificações?")).toBeDefined();
    await act(async () => { fireEvent.press(screen.getByRole("button", { name: "Excluir" })); });

    expect(screen.getByText("Você está em dia")).toBeDefined();
  });
});
