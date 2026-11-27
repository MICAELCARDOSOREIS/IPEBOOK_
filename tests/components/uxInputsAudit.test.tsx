import { createRef, type ComponentRef } from "react";
import { act, fireEvent, render } from "@testing-library/react-native";
import { StyleSheet, View } from "react-native";
import { ThemeProvider } from "@/view/theme/ThemeProvider";
import { colors } from "@/view/tokens";
import { createChatStyles } from "@/view/conversations/chatStyles";
import { NeighborhoodSelectorModal } from "@/view/components/NeighborhoodSelectorModal";
import { ShareListingFeedback } from "@/view/listings/BookDetailSections";
import { ReservedListingSheet } from "@/view/listings/ReservedListingSheet";
import ReportListing from "@/view/listings/reportListing";
import { OwnerPendingProposalCard } from "@/view/conversations/ChatProposalCards";

describe("auditoria de inputs, foco Web, textos e ícones (Spec 136 / UX)", () => {
  it("mantém fontSize >= 16 no campo de mensagem do chat para evitar zoom no Safari iOS", () => {
    const styles = createChatStyles(colors);
    const flat = StyleSheet.flatten(styles.input);
    expect(flat?.fontSize).toBeGreaterThanOrEqual(16);
  });

  it("mantém fontSize >= 16 no campo de busca de NeighborhoodSelectorModal", async () => {
    const screen = await render(
      <ThemeProvider>
        <NeighborhoodSelectorModal
          visible
          onSelect={jest.fn()}
          onClose={jest.fn()}
        />
      </ThemeProvider>,
    );

    const input = screen.getByLabelText("Buscar ponto de encontro em Piripiri");
    const flat = StyleSheet.flatten(input.props.style);
    expect(flat?.fontSize).toBeGreaterThanOrEqual(16);
  });

  it("mantém fontSize >= 16 no campo de link manual de compartilhamento", async () => {
    const shareButtonRef = createRef<ComponentRef<typeof View>>();
    const screen = await render(
      <ThemeProvider>
        <ShareListingFeedback
          state={{
            sharing: false,
            linkCopied: false,
            manualShareLink: "https://ipebook.app/anuncio/livro-1",
            error: null,
          }}
          onDismissCopied={jest.fn()}
          onDismissError={jest.fn()}
          shareButtonRef={shareButtonRef}
        />
      </ThemeProvider>,
    );

    const input = screen.getByLabelText("Link do anúncio");
    const flat = StyleSheet.flatten(input.props.style);
    expect(flat?.fontSize).toBeGreaterThanOrEqual(16);
  });

  it("evita preposição duplicada ('de deste leitor') em ReservedListingSheet sem nome do anunciante", async () => {
    const screen = await render(
      <ThemeProvider>
        <ReservedListingSheet
          visible
          status="reserved"
          onClose={jest.fn()}
          onViewOwnerProfile={jest.fn()}
          ownerName={null}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText("Outros livros deste leitor")).toBeDefined();
    expect(screen.queryByText(/de deste leitor/i)).toBeNull();
    expect(
      screen.getByRole("button", { name: "Ver perfil e outros anúncios deste leitor" }),
    ).toBeDefined();
  });

  it("usa o primeiro nome do anunciante corretamente em ReservedListingSheet", async () => {
    const screen = await render(
      <ThemeProvider>
        <ReservedListingSheet
          visible
          status="reserved"
          onClose={jest.fn()}
          onViewOwnerProfile={jest.fn()}
          ownerName="Maria Silva"
        />
      </ThemeProvider>,
    );

    expect(screen.getByText("Outros livros de Maria")).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Ver perfil e outros anúncios de Maria Silva" }),
    ).toBeDefined();
  });

  it("exibe contador 0/500 e textAlignVertical='top' nos detalhes da denúncia de anúncio", async () => {
    const screen = await render(
      <ThemeProvider>
        <ReportListing
          listingId="book-1"
          listingTitle="Drácula"
          sessionUserId="user-1"
          onBack={jest.fn()}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText("0/500")).toBeDefined();
    const input = screen.getByLabelText("Detalhes adicionais da denúncia");
    expect(input.props.textAlignVertical).toBe("top");

    await act(async () => {
      fireEvent.changeText(input, "Texto de teste");
    });
    expect(screen.getByText("14/500")).toBeDefined();
  });

  it("renderiza OwnerPendingProposalCard com modalidade de venda, doação e troca", async () => {
    const screen = await render(
      <ThemeProvider>
        <OwnerPendingProposalCard
          counterpartName="João"
          modality="sale"
          responding={false}
          onAccept={jest.fn()}
          onReject={jest.fn()}
        />
      </ThemeProvider>,
    );
    expect(screen.getByText("Nova proposta recebida")).toBeDefined();

    await screen.rerender(
      <ThemeProvider>
        <OwnerPendingProposalCard
          counterpartName="João"
          modality="donation"
          responding={false}
          onAccept={jest.fn()}
          onReject={jest.fn()}
        />
      </ThemeProvider>,
    );
    expect(screen.getByText("Nova proposta recebida")).toBeDefined();

    await screen.rerender(
      <ThemeProvider>
        <OwnerPendingProposalCard
          counterpartName="João"
          modality="trade"
          responding={false}
          onAccept={jest.fn()}
          onReject={jest.fn()}
        />
      </ThemeProvider>,
    );
    expect(screen.getByText("Nova proposta recebida")).toBeDefined();
  });
});
