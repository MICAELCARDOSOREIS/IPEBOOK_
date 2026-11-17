import React from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import type { Book } from "@/model/entities/book";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import { BuyerPendingProposalBanner, OwnerPendingProposalCard } from "@/view/conversations/ChatProposalCards";
import { CatalogCarousel, HomeEmptyCatalogSection, HomeShortcutsSection, carouselOffsetFor } from "@/view/home/CatalogCarousel";
import { BookDetailHeroSection, DetailRow, HeroIconButton } from "@/view/listings/BookDetailSections";
import { ProfileCommunityBadges, ProfileIdentityCard, ProfileMenuSection } from "@/view/profile/ProfileHubSections";
import { OptionChip, ScheduleMeetingWideLayout } from "@/view/requests/ScheduleMeetingWideLayout";

afterEach(() => cleanup());

const SAMPLE_BOOK: Book = {
  id: "book-1",
  ownerId: "user-1",
  title: "Vidas Secas",
  author: "Graciliano Ramos",
  modality: "sale",
  price: 25,
  condition: "good",
  category: "Literatura",
  neighborhood: "Centro",
  status: "available",
};

describe("Seções extraídas das telas (Spec 126 — E2 / CA5)", () => {
  it("renderiza CatalogCarousel, HomeShortcutsSection e HomeEmptyCatalogSection com contratos acessíveis", async () => {
    const onNavigateToBookDetail = jest.fn();
    const onViewMore = jest.fn();
    const onNavigateToSearch = jest.fn();
    const onExploreAll = jest.fn();
    const onChangeNeighborhood = jest.fn();

    expect(carouselOffsetFor(2)).toBeGreaterThan(0);

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <>
          <CatalogCarousel
            title="Recém-adicionados"
            displayTitle="Perto de você"
            badgeText="1 livro"
            books={[SAMPLE_BOOK]}
            onNavigateToBookDetail={onNavigateToBookDetail}
            onViewMore={onViewMore}
            viewMoreLabel="Ver mais livros recém-adicionados"
          />
          <HomeShortcutsSection
            wideWeb={false}
            donationSummary="3 livros gratuitos em Piripiri"
            onNavigateToSearch={onNavigateToSearch}
          />
          <HomeEmptyCatalogSection
            carouselDisplayTitle="Perto de você no Paciência"
            hasAnyBooks
            isSpecificNeighborhood
            effectiveNeighborhood="Paciência"
            selectedModality="donation"
            onExploreAllPiripiri={onExploreAll}
            onChangeNeighborhood={onChangeNeighborhood}
          />
        </>,
      );
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Ver mais livros recém-adicionados"));
    });
    expect(onViewMore).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Doações da semana: 3 livros gratuitos em Piripiri"));
    });
    expect(onNavigateToSearch).toHaveBeenCalledWith({ modality: "donation" });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Ver livros em toda Piripiri"));
    });
    expect(onExploreAll).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Selecionar outro local"));
    });
    expect(onChangeNeighborhood).toHaveBeenCalledTimes(1);

    const onResetModality = jest.fn();
    await act(async () => {
      screen.rerender(
        <HomeEmptyCatalogSection
          carouselDisplayTitle="Perto de você"
          hasAnyBooks
          isSpecificNeighborhood={false}
          effectiveNeighborhood="Todos os bairros (Piripiri)"
          selectedModality="trade"
          onExploreAllPiripiri={onExploreAll}
          onChangeNeighborhood={onChangeNeighborhood}
          onResetModality={onResetModality}
        />,
      );
    });

    expect(screen.getByText("Ainda não há livros para troca em Piripiri.")).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Ver todas as modalidades"));
    });
    expect(onResetModality).toHaveBeenCalledTimes(1);
  });

  it("renderiza ProfileIdentityCard, ProfileCommunityBadges e ProfileMenuSection", async () => {
    const onEditProfile = jest.fn();
    const onCreateListing = jest.fn();
    const onMyListings = jest.fn();
    const onMeetingHistory = jest.fn();
    const onRatings = jest.fn();
    const onMenuAction = jest.fn();
    const onSignOut = jest.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <>
          <ProfileIdentityCard
            name="Maria Leitora"
            neighborhood="Centro"
            instagramHandle={null}
            totalPublications={4}
            completedTrocas={2}
            ratingText="4.9"
            onEditProfile={onEditProfile}
            onCreateListing={onCreateListing}
            onMyListings={onMyListings}
            onMeetingHistory={onMeetingHistory}
            onRatings={onRatings}
          />
          <ProfileCommunityBadges neighborhood="Centro" completedTrocas={2} totalPublications={4} />
          <ProfileMenuSection
            title="Conta"
            items={[{ key: "security", icon: "lock", label: "Segurança", onPress: onMenuAction, showChevron: true }]}
            onSignOut={onSignOut}
          />
        </>,
      );
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Editar perfil"));
    });
    expect(onEditProfile).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Publicar um livro"));
    });
    expect(onCreateListing).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Segurança"));
    });
    expect(onMenuAction).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Sair da conta"));
    });
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("renderiza BookDetailHeroSection, HeroIconButton e DetailRow", async () => {
    const onBack = jest.fn();
    const onShareWhatsApp = jest.fn();
    const onShareLink = jest.fn();
    const onToggleFavorite = jest.fn();
    const onOpenGallery = jest.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <>
          <BookDetailHeroSection
            book={SAMPLE_BOOK}
            photos={["https://example.com/1.jpg", "https://example.com/2.jpg"]}
            wideWeb={false}
            topInset={0}
            sharing={false}
            isFavorite={false}
            favoriteLoading={false}
            onBack={onBack}
            onShareWhatsApp={onShareWhatsApp}
            onShareLink={onShareLink}
            onToggleFavorite={onToggleFavorite}
            onOpenGallery={onOpenGallery}
          />
          <HeroIconButton icon="info" label="Botão extra" onPress={onBack} />
          <DetailRow icon="place" label="Retirada" value="Centro" last />
        </>,
      );
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Voltar"));
    });
    expect(onBack).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Adicionar aos favoritos"));
    });
    expect(onToggleFavorite).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Ver fotos do anúncio em tela cheia"));
    });
    expect(onOpenGallery).toHaveBeenCalledTimes(1);
  });

  it("renderiza OptionChip e ScheduleMeetingWideLayout", async () => {
    const onSelectPoint = jest.fn();
    const onSelectDay = jest.fn();
    const onSelectHour = jest.fn();
    const onSubmit = jest.fn();
    const day = new Date("2026-05-06T12:00:00Z");

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <>
          <OptionChip label="14h" accessibilityLabel="Horário 14h" selected onPress={() => onSelectHour(14)} compact />
          <ScheduleMeetingWideLayout
            rescheduling={false}
            windowWidth={1280}
            windowHeight={800}
            pointName={PIRIPIRI_MEETING_POINTS[0].name}
            dayOptions={[day]}
            dayIndex={0}
            isPointOpenOnDay
            timeSlots={[9, 10]}
            hour={9}
            error={null}
            submitting={false}
            selectedPoint={PIRIPIRI_MEETING_POINTS[0]}
            summary={{ complete: true, text: "Praça da Bandeira · Qua · 9h" }}
            scrollRef={{ current: null }}
            errorRef={{ current: null }}
            onBack={jest.fn()}
            onSelectPoint={onSelectPoint}
            onSelectDay={onSelectDay}
            onSelectHour={onSelectHour}
            onSubmit={onSubmit}
          />
        </>,
      );
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Horário 10h"));
    });
    expect(onSelectHour).toHaveBeenCalledWith(10);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Enviar convite"));
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("renderiza OwnerPendingProposalCard e BuyerPendingProposalBanner", async () => {
    const onAccept = jest.fn();
    const onReject = jest.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <>
          <OwnerPendingProposalCard
            counterpartName="João"
            initialMessage="Posso buscar hoje?"
            offeredBook={SAMPLE_BOOK}
            responding={false}
            error="Erro temporário"
            onAccept={onAccept}
            onReject={onReject}
          />
          <BuyerPendingProposalBanner
            initialMessage="Posso buscar hoje?"
            offeredBook={SAMPLE_BOOK}
          />
        </>,
      );
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Aceitar proposta"));
    });
    expect(onAccept).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Recusar proposta"));
    });
    expect(onReject).toHaveBeenCalledTimes(1);
  });
});
