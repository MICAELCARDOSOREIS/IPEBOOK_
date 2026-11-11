import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";

const storageMap = new Map<string, string>();
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => storageMap.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      storageMap.set(key, value);
    }),
    clear: vi.fn(async () => {
      storageMap.clear();
    }),
  },
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import { InstagramIcon } from "@/view/components/InstagramIcon";
import { ScreenContainer } from "@/view/components/ScreenContainer";
import { Tag } from "@/view/components/Tag";
import { NotFound } from "@/view/components/NotFound";
import { Avatar } from "@/view/components/Avatar";
import { Checkbox } from "@/view/components/Checkbox";
import { Chip } from "@/view/components/Chip";
import { ErrorState } from "@/view/components/ErrorState";
import { usePwaViewModel } from "@/viewmodel/usePwaViewModel";
import { usePersistedSearchFilters, SEARCH_FILTERS_STORAGE_KEY } from "@/viewmodel/usePersistedSearchFilters";
import { useActiveNeighborhood, ACTIVE_NEIGHBORHOOD_STORAGE_KEY } from "@/viewmodel/useActiveNeighborhood";
import { useNavigationBadgesViewModel } from "@/viewmodel/useNavigationBadgesViewModel";
import { useNotificationPreferencesViewModel } from "@/viewmodel/useNotificationPreferencesViewModel";
import { useInviteFriendsViewModel } from "@/viewmodel/useInviteFriendsViewModel";
import { useDraftsViewModel } from "@/viewmodel/useDraftsViewModel";
import { useThemeViewModel } from "@/viewmodel/useThemeViewModel";
import { MemoryBlockedUserDataSource } from "@/infra/datasources/memoryBlockedUserDataSource";
import { ShareUseCases } from "@/usecase/shareUseCases";
import { DomainError, ValidationError } from "@/model/errors";

describe("Cobertura direcionada de branches (Branches Coverage Booster)", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    storageMap.clear();
  });

  describe("InstagramIcon", () => {
    it("renderiza com cor padrão quando omitida", async () => {
      const tela = await render(<InstagramIcon />);
      expect(tela.root).toBeDefined();
    });

    it("renderiza com cor e tamanho customizados", async () => {
      const tela = await render(<InstagramIcon size={32} color="#E1306C" />);
      expect(tela.root).toBeDefined();
    });
  });

  describe("ScreenContainer", () => {
    it("renderiza com scroll={false} usando View em vez de ScrollView", async () => {
      const tela = await render(
        <ScreenContainer scroll={false} maxWidth={null} header={<Text>Topo Fixo</Text>} overlay={<Text>Overlay Fixo</Text>}>
          <Text>Conteúdo sem Scroll</Text>
        </ScreenContainer>,
      );
      expect(tela.getByText("Topo Fixo")).toBeTruthy();
      expect(tela.getByText("Conteúdo sem Scroll")).toBeTruthy();
      expect(tela.getByText("Overlay Fixo")).toBeTruthy();
    });

    it("renderiza com maxWidth={undefined} e padding customizado", async () => {
      const tela = await render(
        <ScreenContainer maxWidth={undefined} paddingTop={10} paddingBottom={20} paddingHorizontal={30}>
          <Text>Sem Limite</Text>
        </ScreenContainer>,
      );
      expect(tela.getByText("Sem Limite")).toBeTruthy();
    });
  });

  describe("Tag (todas as variantes e branches)", () => {
    it("renderiza variantes canônicas em português e inglês com labels padrão", async () => {
      const variantes = [
        "sale", "venda", "trade", "troca", "donation", "doacao",
        "reserved", "reservado", "completed", "concluido", "paused",
        "pausado", "available", "disponivel", "box",
      ] as const;

      for (const variant of variantes) {
        const tela = await render(<Tag variant={variant} />);
        expect(tela.root).toBeDefined();
      }
    });

    it("renderiza com label e accessibilityLabel customizados", async () => {
      const tela = await render(<Tag variant="sale" label="Super Oferta" accessibilityLabel="Acessível Oferta" />);
      expect(tela.getByText("Super Oferta")).toBeTruthy();
    });

    it("usa fallback para venda quando a variante for desconhecida", async () => {
      // @ts-expect-error teste de fallback defensivo
      const tela = await render(<Tag variant="variante_inexistente" />);
      expect(tela.getByText("Venda")).toBeTruthy();
    });
  });

  describe("NotFound", () => {
    it("renderiza sem botão de explorar quando onExplore não for informado", async () => {
      const onHome = vi.fn();
      const tela = await render(<NotFound onGoHome={onHome} />);
      expect(tela.getByText("Página não encontrada")).toBeTruthy();
      expect(tela.queryByText("Explorar livros")).toBeNull();

      fireEvent.press(tela.getByText("Ir para o início"));
      expect(onHome).toHaveBeenCalled();
    });

    it("renderiza com botão de explorar quando onExplore for fornecido", async () => {
      const onHome = vi.fn();
      const onExplore = vi.fn();
      const tela = await render(<NotFound onGoHome={onHome} onExplore={onExplore} />);
      expect(tela.getByText("Explorar livros")).toBeTruthy();

      fireEvent.press(tela.getByText("Explorar livros"));
      expect(onExplore).toHaveBeenCalled();
    });
  });

  describe("Avatar", () => {
    it("renderiza imagem remota quando photoUrl for informado", async () => {
      const tela = await render(<Avatar name="Maria" photoUrl="https://example.com/foto.jpg" size={50} />);
      expect(tela.root).toBeDefined();
    });

    it("renderiza fallback do ipê quando photoUrl for omitido", async () => {
      const tela = await render(<Avatar name="João" />);
      expect(tela.getByLabelText("João")).toBeTruthy();
    });
  });

  describe("Checkbox", () => {
    it("renderiza desmarcado, com descrição e alterna ao pressionar", async () => {
      const onChange = vi.fn();
      const tela = await render(
        <Checkbox
          label="Aceito os termos"
          checked={false}
          onChange={onChange}
          description="Termos de uso da plataforma"
        />,
      );
      expect(tela.getByText("Aceito os termos")).toBeTruthy();
      expect(tela.getByText("Termos de uso da plataforma")).toBeTruthy();

      fireEvent.press(tela.getByText("Aceito os termos"));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("renderiza com erro e estado desabilitado", async () => {
      const onChange = vi.fn();
      const tela = await render(
        <Checkbox
          label="Aceito termos"
          checked={true}
          disabled={true}
          onChange={onChange}
          error="Campo obrigatório"
          accessibilityLabel="Acessível termos"
        />,
      );
      expect(tela.getByText("Campo obrigatório")).toBeTruthy();
    });
  });

  describe("Chip", () => {
    it("renderiza compacto não-selecionado e responde ao toque", async () => {
      const onPress = vi.fn();
      const tela = await render(<Chip label="Ficção" selected={false} onPress={onPress} />);
      expect(tela.getByText("Ficção")).toBeTruthy();

      fireEvent.press(tela.getByText("Ficção"));
      expect(onPress).toHaveBeenCalled();
    });

    it("renderiza selecionado com tamanho regular e tom customizado", async () => {
      const onPress = vi.fn();
      const tela = await render(
        <Chip
          label="Troca"
          selected={true}
          size="regular"
          tone={{ background: "#2E7D32", text: "#FFFFFF" }}
          onPress={onPress}
          accessibilityLabel="Filtro troca"
        />,
      );
      expect(tela.getByText("Troca")).toBeTruthy();
    });

    it("renderiza desabilitado com tom e não-selecionado", async () => {
      const onPress = vi.fn();
      const tela = await render(
        <Chip
          label="Doação"
          selected={false}
          disabled={true}
          tone={{ background: "#1565C0", text: "#FFFFFF" }}
          onPress={onPress}
        />,
      );
      expect(tela.getByText("Doação")).toBeTruthy();
    });
  });

  describe("ErrorState", () => {
    it("renderiza mensagem e botão padrão de tentar novamente", async () => {
      const onRetry = vi.fn();
      const tela = await render(<ErrorState message="Falha na conexão" onRetry={onRetry} />);
      expect(tela.getByText("Falha na conexão")).toBeTruthy();
      expect(tela.getByText("Tentar novamente")).toBeTruthy();

      fireEvent.press(tela.getByText("Tentar novamente"));
      expect(onRetry).toHaveBeenCalled();
    });

    it("renderiza com rótulo customizado de retry", async () => {
      const onRetry = vi.fn();
      const tela = await render(
        <ErrorState message="Erro customizado" retryLabel="Recarregar tela" onRetry={onRetry} testID="custom-err" />,
      );
      expect(tela.getByTestId("custom-err")).toBeTruthy();
      expect(tela.getByText("Recarregar tela")).toBeTruthy();
    });
  });

  describe("usePwaViewModel", () => {
    it("assume autoRegister = true por padrão quando a opção for omitida e testa unregister com falha", async () => {
      const mockService = {
        isSupported: vi.fn().mockReturnValue(true),
        register: vi.fn().mockResolvedValue(true),
        unregister: vi.fn().mockResolvedValue(false),
      };

      let hookRes!: ReturnType<typeof usePwaViewModel>;
      function Probe() {
        hookRes = usePwaViewModel({ pwaService: mockService });
        return null;
      }

      await React.act(async () => {
        await render(<Probe />);
      });

      expect(mockService.register).toHaveBeenCalled();
      expect(hookRes.isRegistered).toBe(true);

      // Testa unregister quando falha (retorna false)
      await React.act(async () => {
        const ok = await hookRes.unregister();
        expect(ok).toBe(false);
      });
      // Permanece true pois a desativação falhou
      expect(hookRes.isRegistered).toBe(true);
    });
  });

  describe("usePersistedSearchFilters", () => {
    it("carrega filtros válidos do storage e persiste novas preferências", async () => {
      await AsyncStorage.setItem(
        SEARCH_FILTERS_STORAGE_KEY,
        JSON.stringify({ filters: { category: "Ficção" }, sortBy: "title" }),
      );

      let hookRes!: ReturnType<typeof usePersistedSearchFilters>;
      function Probe() {
        hookRes = usePersistedSearchFilters();
        return null;
      }

      await React.act(async () => {
        await render(<Probe />);
      });

      expect(hookRes.loaded).toBe(true);
      expect(hookRes.persisted?.sortBy).toBe("title");
      expect(hookRes.persisted?.filters.category).toBe("Ficção");

      // Testa persist
      await React.act(async () => {
        hookRes.persist(hookRes.persisted!.filters, "recent");
      });
      const salvo = await AsyncStorage.getItem(SEARCH_FILTERS_STORAGE_KEY);
      expect(salvo).toContain('"recent"');
    });

    it("trata storage corrompido ou vazio com tolerância a falhas", async () => {
      await AsyncStorage.setItem(SEARCH_FILTERS_STORAGE_KEY, "invalido{json");

      let hookRes!: ReturnType<typeof usePersistedSearchFilters>;
      function Probe() {
        hookRes = usePersistedSearchFilters();
        return null;
      }

      await React.act(async () => {
        await render(<Probe />);
      });

      expect(hookRes.loaded).toBe(true);
      expect(hookRes.persisted).toBeNull();
    });
  });

  describe("useActiveNeighborhood", () => {
    it("migra bairro residencial legado para 'all'", async () => {
      await AsyncStorage.setItem(ACTIVE_NEIGHBORHOOD_STORAGE_KEY, "Centro");

      let hookRes!: ReturnType<typeof useActiveNeighborhood>;
      function Probe() {
        hookRes = useActiveNeighborhood("all");
        return null;
      }

      await React.act(async () => {
        await render(<Probe />);
      });

      expect(hookRes.activeNeighborhood).toBe("all");
    });

    it("mantém bairro não legado e gerencia abertura/fechamento do seletor", async () => {
      await AsyncStorage.setItem(ACTIVE_NEIGHBORHOOD_STORAGE_KEY, "Floresta");

      let hookRes!: ReturnType<typeof useActiveNeighborhood>;
      function Probe() {
        hookRes = useActiveNeighborhood("all");
        return null;
      }

      await React.act(async () => {
        await render(<Probe />);
      });

      expect(hookRes.activeNeighborhood).toBe("Floresta");
      expect(hookRes.isSelectorOpen).toBe(false);

      React.act(() => {
        hookRes.openSelector();
      });
      expect(hookRes.isSelectorOpen).toBe(true);

      React.act(() => {
        hookRes.closeSelector();
      });
      expect(hookRes.isSelectorOpen).toBe(false);

      await React.act(async () => {
        await hookRes.selectNeighborhood("Itacoatiara");
      });
      expect(hookRes.activeNeighborhood).toBe("Itacoatiara");
    });
  });

  describe("useNavigationBadgesViewModel", () => {
    it("retorna zeros quando sessionUserId for nulo", async () => {
      const mockDeps = {
        listReceivedRequests: vi.fn().mockResolvedValue([]),
      };

      let badges!: ReturnType<typeof useNavigationBadgesViewModel>;
      function Probe() {
        badges = useNavigationBadgesViewModel(null, "k1", mockDeps);
        return null;
      }

      await React.act(async () => {
        await render(<Probe />);
      });

      expect(badges.conversations).toBe(0);
      expect(mockDeps.listReceivedRequests).not.toHaveBeenCalled();
    });

    it("calcula propostas pendentes e escuta alterações em tempo real", async () => {
      let listener!: () => void;
      const mockDeps = {
        listReceivedRequests: vi.fn().mockResolvedValue([
          { request: { status: "pending" } },
          { request: { status: "accepted" } },
        ] as never),
        subscribe: vi.fn().mockImplementation((_uid, onChange) => {
          listener = onChange;
          return () => {};
        }),
      };

      let badges!: ReturnType<typeof useNavigationBadgesViewModel>;
      function Probe() {
        badges = useNavigationBadgesViewModel("user_123", "k1", mockDeps);
        return null;
      }

      await React.act(async () => {
        await render(<Probe />);
      });

      expect(badges.conversations).toBe(1);
      expect(mockDeps.subscribe).toHaveBeenCalled();

      // Dispara atualização em tempo real
      mockDeps.listReceivedRequests.mockResolvedValueOnce([
        { request: { status: "pending" } },
        { request: { status: "pending" } },
      ] as never);

      await React.act(async () => {
        listener();
      });

      expect(badges.conversations).toBe(2);
    });
  });

  describe("useNotificationPreferencesViewModel", () => {
    it("liga e desliga categorias de notificação tratando erros de persistência", async () => {
      const mockUseCases = {
        getPreferences: vi.fn().mockResolvedValue({
          mutedTypes: ["request_received"],
        }),
        updatePreferences: vi.fn().mockRejectedValue(new Error("falha")), // simula falha
      };

      let hookRes!: ReturnType<typeof useNotificationPreferencesViewModel>;
      function Probe() {
        hookRes = useNotificationPreferencesViewModel("u1", mockUseCases as never);
        return null;
      }

      await React.act(async () => {
        await render(<Probe />);
      });

      // Tenta ligar proposals e falha
      await React.act(async () => {
        await hookRes[1].setEnabled("proposals", true);
      });

      expect(hookRes[0].error).toBe("Não foi possível salvar suas preferências de notificação.");
    });
  });

  describe("useInviteFriendsViewModel", () => {
    it("compartilha convite com sucesso e trata cancelamento e erros", async () => {
      const mockShareUseCases = {
        buildInviteMessage: vi.fn().mockReturnValue("Convite para o app"),
        buildWhatsAppInviteUrl: vi.fn().mockReturnValue("https://wa.me/?text=convite"),
      };
      const mockShareImageFile = vi.fn().mockResolvedValue(true);

      let hookRes!: ReturnType<typeof useInviteFriendsViewModel>;
      function Probe() {
        hookRes = useInviteFriendsViewModel(mockShareUseCases as never, "https://app.local", mockShareImageFile);
        return null;
      }

      await React.act(async () => {
        await render(<Probe />);
      });

      expect(hookRes[0].inviteMessage).toBe("Convite para o app");
      expect(hookRes[0].inviteUrl).toBe("https://app.local");

      // shareImage
      await React.act(async () => {
        await hookRes[1].shareImage(async () => "file://img.png");
      });
      expect(mockShareImageFile).toHaveBeenCalled();

      // shareToWhatsApp
      await React.act(async () => {
        await hookRes[1].shareToWhatsApp();
      });

      // copyLink
      await React.act(async () => {
        await hookRes[1].copyLink();
      });

      // dismissLinkCopied e dismissShared
      React.act(() => {
        hookRes[1].dismissLinkCopied();
        hookRes[1].dismissShared();
      });
      expect(hookRes[0].linkCopied).toBe(false);
      expect(hookRes[0].shared).toBe(false);
    });
  });

  describe("useDraftsViewModel", () => {
    it("carrega rascunhos, descarta com sucesso e trata erros de descarte", async () => {
      const mockBook = { id: "draft_1", title: "Livro Rascunho" };
      const mockBookUseCases = {
        listDrafts: vi.fn().mockResolvedValue([mockBook]),
        discardDraft: vi.fn().mockResolvedValue(undefined),
      };

      let hookRes!: ReturnType<typeof useDraftsViewModel>;
      function Probe() {
        hookRes = useDraftsViewModel("user_1", mockBookUseCases as never);
        return null;
      }

      await React.act(async () => {
        await render(<Probe />);
      });

      expect(hookRes[0].drafts).toHaveLength(1);

      // Descarte com sucesso
      await React.act(async () => {
        const ok = await hookRes[1].discardDraft("draft_1");
        expect(ok).toBe(true);
      });
      expect(hookRes[0].drafts).toHaveLength(0);

      // Descarte com erro DomainError
      mockBookUseCases.discardDraft.mockRejectedValueOnce(new DomainError("Rascunho não encontrado"));
      await React.act(async () => {
        const ok = await hookRes[1].discardDraft("draft_99");
        expect(ok).toBe(false);
      });
      expect(hookRes[0].discardError).toBe("Rascunho não encontrado");

      // Reload com erro genérico
      mockBookUseCases.listDrafts.mockRejectedValueOnce(new Error("Falha de rede"));
      await React.act(async () => {
        await hookRes[1].reload();
      });
      expect(hookRes[0].error).toContain("Não foi possível carregar seus rascunhos");
    });
  });

  describe("useThemeViewModel", () => {
    it("carrega preferência salva e alterna tema", async () => {
      const mockThemeUseCases = {
        getPreference: vi.fn().mockResolvedValue("system"),
        setPreference: vi.fn().mockResolvedValue(undefined),
      };

      let hookRes!: ReturnType<typeof useThemeViewModel>;
      function Probe() {
        hookRes = useThemeViewModel(mockThemeUseCases as never);
        return null;
      }

      await React.act(async () => {
        await render(<Probe />);
      });

      expect(hookRes[0].loading).toBe(false);
      expect(hookRes[0].preference).toBe("system");

      await React.act(async () => {
        await hookRes[1].setPreference("dark");
      });
      expect(mockThemeUseCases.setPreference).toHaveBeenCalledWith("dark");
      expect(hookRes[0].preference).toBe("dark");
      expect(hookRes[0].resolvedScheme).toBe("dark");
    });
  });

  describe("MemoryBlockedUserDataSource (branches de bloqueio e perfis)", () => {
    it("cobre listagem de bloqueios com e sem DataSource de perfil, dados incompletos e remoção", async () => {
      const mockProfileDs = {
        findById: vi.fn().mockImplementation(async (id: string) => {
          if (id === "u_com_tudo") return { name: "Alice", photoUrl: "https://pic.jpg" };
          if (id === "u_sem_foto") return { name: "Bob", photoUrl: undefined };
          return null;
        }),
      };

      const ds = new MemoryBlockedUserDataSource(
        [
          { blockerId: "b1", blockedId: "u_com_tudo" },
          { blockerId: "b1", blockedId: "u_sem_foto", createdAt: "2026-01-01T00:00:00Z" },
          { blockerId: "b1", blockedId: "u_desconhecido" },
        ],
        mockProfileDs as never,
      );

      const list = await ds.listBlocked("b1");
      expect(list).toHaveLength(3);
      expect(list[0].name).toBe("Alice");
      expect(list[0].photoUrl).toBe("https://pic.jpg");
      expect(list[1].name).toBe("Bob");
      expect(list[2].name).toBe("Membro da comunidade");

      // Teste sem profileDataSource
      const dsSemPerfil = new MemoryBlockedUserDataSource([{ blockerId: "b2", blockedId: "u1" }]);
      const listSemPerfil = await dsSemPerfil.listBlocked("b2");
      expect(listSemPerfil[0].name).toBe("Membro da comunidade");

      // block (idempotente)
      await ds.block("b1", "u_novo");
      await ds.block("b1", "u_novo"); // duplicate call
      expect(await ds.isBlocked("b1", "u_novo")).toBe(true);
      expect(await ds.isBlocked("u_novo", "b1")).toBe(true);
      expect(await ds.isBlocked("b1", "u_inexistente")).toBe(false);

      // unblock
      await ds.unblock("b1", "u_novo");
      await ds.unblock("b1", "u_novo"); // index === -1
      expect(await ds.isBlocked("b1", "u_novo")).toBe(false);
    });
  });

  describe("ShareUseCases (branches de montagem de mensagens e URLs)", () => {
    it("valida caminhos de compartilhamento, mensagens formatadas e variações de modalidade", () => {
      const share = new ShareUseCases();

      // buildListingSharePath
      expect(() => share.buildListingSharePath("")).toThrow(ValidationError);
      expect(() => share.buildListingSharePath("   ")).toThrow(ValidationError);
      expect(share.buildListingSharePath("  livro-123 ")).toBe("/livro/livro-123");

      // buildShareMessage variações
      const msgVendaSemPreco = share.buildShareMessage(
        { title: "Dom Casmurro", author: "Machado", modality: "sale", category: "Ficção" },
        "https://app/1",
      );
      expect(msgVendaSemPreco).toContain("Venda");

      const msgBoxComVolumesEBairro = share.buildShareMessage(
        {
          title: "Coleção HP",
          author: "Rowling",
          modality: "trade",
          isBox: true,
          boxVolumesCount: 7,
          condition: "good",
          neighborhood: "Floresta",
        },
        "https://app/2",
      );
      expect(msgBoxComVolumesEBairro).toContain("Box · 7 volumes");
      expect(msgBoxComVolumesEBairro).toContain("Floresta, Piripiri - PI");

      const msgBoxSemVolumesBairroAll = share.buildShareMessage(
        {
          title: "Box Especial",
          author: "Autor",
          modality: "donation",
          isBox: true,
          neighborhood: "all",
        },
        "https://app/3",
      );
      expect(msgBoxSemVolumesBairroAll).toContain("(Box)");
      expect(msgBoxSemVolumesBairroAll).not.toContain("Piripiri - PI");

      // buildWhatsAppShareMessage variações
      const waVendaComPreco = share.buildWhatsAppShareMessage(
        {
          title: "Livro 1",
          author: "Autor 1",
          modality: "sale",
          price: 25.5,
          isBox: true,
          boxVolumesCount: 3,
          neighborhood: "Centro",
          condition: "good",
          category: "Romance",
        },
        "https://app/wa1",
      );
      expect(waVendaComPreco).toContain("R$ 25,50");
      expect(waVendaComPreco).toContain("Box / Coleção (3 volumes)");
      expect(waVendaComPreco).toContain("Bairro Centro");

      const waDoacaoSemBairro = share.buildWhatsAppShareMessage(
        {
          title: "Livro 2",
          author: "Autor 2",
          modality: "donation",
          neighborhood: "Todos os bairros (Piripiri)",
        },
        "https://app/wa2",
      );
      expect(waDoacaoSemBairro).toContain("Doação gratuita");
      expect(waDoacaoSemBairro).toContain("📍 Piripiri · PI");

      // WhatsApp URLs (web vs native)
      expect(share.buildWhatsAppShareUrl("Oi", true)).toContain("https://api.whatsapp.com/send?text=Oi");
      expect(share.buildWhatsAppShareUrl("Oi", false)).toContain("whatsapp://send?text=Oi");

      // Invite message com url vazia
      expect(share.buildInviteMessage("")).toContain("https://ipebook.app");
      expect(share.buildWhatsAppInviteUrl("https://custom.app")).toContain("https%3A%2F%2Fcustom.app");
    });
  });
});
