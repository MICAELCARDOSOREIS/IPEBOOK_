import { act, fireEvent, render } from "@testing-library/react-native";
import * as container from "@/di/container";
import EditAlert from "@/view/search/editAlert";
import ManageAlert from "@/view/search/manageAlert";
import { BlockedUsers } from "@/view/profile/blockedUsers";
import MeetingHistory from "@/view/profile/meetingHistory";
import Favorites from "@/view/favorites/favorites";
import SearchAlerts from "@/view/search/searchAlerts";
import Notifications from "@/view/notifications/notifications";
import ReportListing from "@/view/listings/reportListing";
import ReportUser from "@/view/listings/reportUser";
import EditListing from "@/view/listings/editListing";
import { ThemeProvider } from "@/view/theme/ThemeProvider";

const noopAuthActions = {
  signIn: jest.fn().mockResolvedValue(true),
  signUp: jest.fn().mockResolvedValue(true),
  signOut: jest.fn().mockResolvedValue(true),
  signInWithGoogle: jest.fn().mockResolvedValue(true),
  requestPasswordReset: jest.fn().mockResolvedValue(true),
  refreshSession: jest.fn().mockResolvedValue(undefined),
};

const noopAlertActions = {
  setQuery: jest.fn(),
  reload: jest.fn().mockResolvedValue(undefined),
  create: jest.fn().mockResolvedValue(undefined),
  update: jest.fn().mockResolvedValue(true),
  setActive: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn().mockResolvedValue(true),
};

describe("telas com dados do banco exibem carregamento antes de erro ou vazio", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("EditAlert aguarda sessão e mostra ErrorState com tentar novamente em falha de carga", async () => {
    const reload = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(container, "makeSearchAlertsViewModel").mockReturnValue([
      { alerts: [], query: "", loading: false, error: null, loadError: null, message: null },
      { ...noopAlertActions, reload },
    ]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <EditAlert alertId="a1" userId={null} sessionLoading onBack={jest.fn()} onSaved={jest.fn()} />
        </ThemeProvider>,
      );
    });
    expect(screen.getByLabelText("Carregando alerta")).toBeDefined();
    expect(screen.queryByText("Alerta não encontrado")).toBeNull();

    jest.spyOn(container, "makeSearchAlertsViewModel").mockReturnValue([
      {
        alerts: [],
        query: "",
        loading: false,
        error: "Não foi possível carregar alertas.",
        loadError: "Não foi possível carregar alertas.",
        message: null,
      },
      { ...noopAlertActions, reload },
    ]);
    await act(async () => {
      screen.rerender(
        <ThemeProvider>
          <EditAlert alertId="a1" userId="u1" sessionLoading={false} onBack={jest.fn()} onSaved={jest.fn()} />
        </ThemeProvider>,
      );
    });
    expect(screen.getByText("Não foi possível carregar alertas.")).toBeDefined();
    expect(screen.queryByText("Alerta não encontrado")).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("ManageAlert aguarda sessão e mostra ErrorState em falha de carga antes de 'não encontrado'", async () => {
    const reload = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(container, "makeSearchAlertsViewModel").mockReturnValue([
      { alerts: [], query: "", loading: false, error: null, loadError: null, message: null },
      { ...noopAlertActions, reload },
    ]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <ManageAlert
            alertId="a1"
            userId={null}
            sessionLoading
            onBack={jest.fn()}
            onEditAlert={jest.fn()}
            onAlertDeleted={jest.fn()}
          />
        </ThemeProvider>,
      );
    });
    expect(screen.getByLabelText("Carregando alerta")).toBeDefined();
    expect(screen.queryByText("Alerta não encontrado")).toBeNull();

    jest.spyOn(container, "makeSearchAlertsViewModel").mockReturnValue([
      {
        alerts: [],
        query: "",
        loading: false,
        error: "Falha no banco.",
        loadError: "Falha no banco.",
        message: null,
      },
      { ...noopAlertActions, reload },
    ]);
    await act(async () => {
      screen.rerender(
        <ThemeProvider>
          <ManageAlert
            alertId="a1"
            userId="u1"
            sessionLoading={false}
            onBack={jest.fn()}
            onEditAlert={jest.fn()}
            onAlertDeleted={jest.fn()}
          />
        </ThemeProvider>,
      );
    });
    expect(screen.getByText("Falha no banco.")).toBeDefined();
    expect(screen.queryByText("Alerta não encontrado")).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("BlockedUsers exibe carregamento enquanto sessão ainda está carregando", async () => {
    jest.spyOn(container, "makeAuthViewModel").mockReturnValue([
      { user: null, loading: true, error: null },
      noopAuthActions,
    ]);
    jest.spyOn(container, "makeBlockedUsersViewModel").mockReturnValue([
      {
        blockedUsers: [],
        loading: false,
        error: "Sessão necessária para acessar pessoas bloqueadas.",
        unblockingId: null,
        actionMessage: null,
      },
      { reload: jest.fn(), unblockUser: jest.fn(), clearActionMessage: jest.fn() },
    ]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <BlockedUsers onBack={jest.fn()} />
        </ThemeProvider>,
      );
    });
    expect(screen.getByLabelText("Carregando pessoas bloqueadas")).toBeDefined();
    expect(screen.queryByText("Sessão necessária para acessar pessoas bloqueadas.")).toBeNull();
  });

  it("MeetingHistory exibe carregamento enquanto sessão ainda está carregando", async () => {
    jest.spyOn(container, "makeAuthViewModel").mockReturnValue([
      { user: null, loading: true, error: null },
      noopAuthActions,
    ]);
    jest.spyOn(container, "makeUserMeetingsViewModel").mockReturnValue([
      { meetings: [], loading: false, error: null },
      { reload: jest.fn() },
    ]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <MeetingHistory onBack={jest.fn()} />
        </ThemeProvider>,
      );
    });
    expect(screen.getByLabelText("Carregando encontros…")).toBeDefined();
    expect(screen.queryByText("Nenhum encontro registrado")).toBeNull();
  });

  it("Favorites e SearchAlerts exibem carregamento enquanto sessionLoading=true", async () => {
    jest.spyOn(container, "makeFavoritesViewModel").mockReturnValue([
      { books: [], loading: false, error: null, removingId: null, actionError: null },
      { reload: jest.fn(), removeFavorite: jest.fn(), clearActionError: jest.fn() },
    ]);
    jest.spyOn(container, "makeSearchAlertsViewModel").mockReturnValue([
      { alerts: [], query: "", loading: false, error: null, loadError: null, message: null },
      noopAlertActions,
    ]);

    let fav!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      fav = await render(
        <ThemeProvider>
          <Favorites userId={null} sessionLoading onBack={jest.fn()} onLogin={jest.fn()} onBook={jest.fn()} />
        </ThemeProvider>,
      );
    });
    expect(fav.getByLabelText("Carregando favoritos")).toBeDefined();
    expect(fav.queryByText("Entre para ver seus favoritos")).toBeNull();

    let alerts!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      alerts = await render(
        <ThemeProvider>
          <SearchAlerts userId={null} sessionLoading onBack={jest.fn()} onLogin={jest.fn()} />
        </ThemeProvider>,
      );
    });
    expect(alerts.getByLabelText("Carregando alertas")).toBeDefined();
    expect(alerts.queryByText("Entre para criar alertas")).toBeNull();
  });

  it("Notifications exibe carregamento enquanto sessionLoading=true", async () => {
    jest.spyOn(container, "makeNotificationsViewModel").mockReturnValue([
      {
        notifications: [],
        filteredNotifications: [],
        unreadCount: 0,
        loading: false,
        error: null,
        actionError: null,
        filter: "all",
        systemPermissionGranted: true,
      },
      {
        reload: jest.fn().mockResolvedValue(undefined),
        refresh: jest.fn().mockResolvedValue(undefined),
        setFilter: jest.fn(),
        markAsRead: jest.fn().mockResolvedValue(undefined),
        markAllAsRead: jest.fn().mockResolvedValue(undefined),
        deleteNotification: jest.fn().mockResolvedValue(undefined),
        clearAll: jest.fn().mockResolvedValue(undefined),
        clearRead: jest.fn().mockResolvedValue(undefined),
        clearActionError: jest.fn(),
      },
    ]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <Notifications sessionUserId={null} sessionLoading onBack={jest.fn()} />
        </ThemeProvider>,
      );
    });
    expect(screen.getByLabelText("Carregando notificações")).toBeDefined();
    expect(screen.queryByText("Sessão necessária")).toBeNull();
  });

  it("ReportListing e ReportUser exibem carregamento enquanto a sessão carrega", async () => {
    jest.spyOn(container, "makeAuthViewModel").mockReturnValue([
      { user: null, loading: true, error: null },
      noopAuthActions,
    ]);

    let repListing!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      repListing = await render(
        <ThemeProvider>
          <ReportListing listingId="b1" sessionUserId={null} sessionLoading onBack={jest.fn()} />
        </ThemeProvider>,
      );
    });
    expect(repListing.getByLabelText("Carregando sessão")).toBeDefined();
    expect(repListing.queryByText("Identificação necessária")).toBeNull();

    let repUser!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      repUser = await render(
        <ThemeProvider>
          <ReportUser userId="u2" onBack={jest.fn()} />
        </ThemeProvider>,
      );
    });
    expect(repUser.getByLabelText("Carregando sessão")).toBeDefined();
    expect(repUser.queryByText("Identificação necessária")).toBeNull();
  });

  it("EditListing exibe ErrorState com Tentar novamente quando a carga do anúncio falha", async () => {
    const load = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(container, "makeEditListingViewModel").mockReturnValue([
      {
        book: null,
        title: "",
        author: "",
        category: "",
        modality: "sale",
        price: "",
        neighborhood: "",
        condition: null,
        description: "",
        photoUrl: "",
        photos: [],
        isBox: false,
        boxVolumesCount: "",
        loading: false,
        saving: false,
        error: "Não foi possível carregar o anúncio para edição.",
        success: false,
      },
      {
        load,
        setTitle: jest.fn(),
        setAuthor: jest.fn(),
        setCategory: jest.fn(),
        setModality: jest.fn(),
        setPrice: jest.fn(),
        setNeighborhood: jest.fn(),
        setCondition: jest.fn(),
        setDescription: jest.fn(),
        setPhotoUrl: jest.fn(),
        addPhoto: jest.fn(),
        setPhotoAt: jest.fn(),
        removePhoto: jest.fn(),
        setIsBox: jest.fn(),
        setBoxVolumesCount: jest.fn(),
        submit: jest.fn().mockResolvedValue(null),
      },
    ]);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <ThemeProvider>
          <EditListing bookId="b1" sessionUserId="u1" onCancel={jest.fn()} />
        </ThemeProvider>,
      );
    });
    expect(screen.getByText("Não foi possível carregar o anúncio para edição.")).toBeDefined();
    fireEvent.press(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(load).toHaveBeenCalledTimes(1);
  });
});
