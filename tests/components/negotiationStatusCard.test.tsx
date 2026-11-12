
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Meeting } from "@/model/entities/meeting";
import { NegotiationStatusCard } from "@/view/conversations/NegotiationStatusCard";

afterEach(async () => {
  await act(async () => cleanup());
});

const confirmedMeeting: Meeting = {
  id: "m-1",
  requestId: "r-1",
  pointName: "Praça da Bandeira (Centro)",
  scheduledAt: "2026-11-05T15:00:00.000Z",
  proposedBy: "other-user",
  status: "confirmed",
};

const proposedMeeting: Meeting = {
  id: "m-2",
  requestId: "r-1",
  pointName: "Praça da Bandeira (Centro)",
  scheduledAt: "2026-11-05T15:00:00.000Z",
  proposedBy: "other-user",
  status: "proposed",
};

describe("NegotiationStatusCard", () => {
  it("não renderiza nada se o pedido não estiver aceito", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <NegotiationStatusCard
          meeting={null}
          requestStatus="pending"
          counterpartName="João"
          sessionUserId="me"
          deliveryCompleted={false}
        />,
      );
    });
    expect(screen.toJSON()).toBeNull();
  });

  it("renderiza status de entrega concluída e ação de avaliação", async () => {
    const onOpenRating = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <NegotiationStatusCard
          meeting={confirmedMeeting}
          requestStatus="accepted"
          counterpartName="João"
          sessionUserId="me"
          deliveryCompleted={true}
          onOpenRating={onOpenRating}
        />,
      );
    });

    expect(screen.getByText("Entrega realizada com sucesso")).toBeTruthy();
    const ratingBtn = screen.getByLabelText("Avaliar negociação");
    await act(async () => {
      fireEvent.press(ratingBtn);
    });
    expect(onOpenRating).toHaveBeenCalled();
  });

  it("renderiza encontro confirmado com ações rápidas de entrega, mapa e agenda", async () => {
    const onOpenDelivery = vi.fn();
    const onOpenDirections = vi.fn();
    const onAddToCalendar = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <NegotiationStatusCard
          meeting={confirmedMeeting}
          requestStatus="accepted"
          counterpartName="João"
          sessionUserId="me"
          deliveryCompleted={false}
          onOpenDelivery={onOpenDelivery}
          onOpenDirections={onOpenDirections}
          onAddToCalendar={onAddToCalendar}
        />,
      );
    });

    expect(screen.getByText("Encontro confirmado")).toBeTruthy();
    expect(screen.getByText(/Praça da Bandeira/)).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Entrega do livro"));
    });
    expect(onOpenDelivery).toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Como chegar"));
    });
    expect(onOpenDirections).toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Adicionar à agenda"));
    });
    expect(onAddToCalendar).toHaveBeenCalled();
  });

  it("renderiza ação de reagendamento quando o encontro estiver confirmado (Spec 114)", async () => {
    const onRescheduleMeeting = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <NegotiationStatusCard
          meeting={confirmedMeeting}
          requestStatus="accepted"
          counterpartName="João"
          sessionUserId="me"
          deliveryCompleted={false}
          onRescheduleMeeting={onRescheduleMeeting}
        />,
      );
    });

    const btn = screen.getByLabelText("Reagendar encontro");
    expect(btn).toBeTruthy();
    await act(async () => {
      fireEvent.press(btn);
    });
    expect(onRescheduleMeeting).toHaveBeenCalledOnce();
  });

  it("renderiza proposta de encontro recebida com botão de confirmação e sugerir outro horário (Spec 114)", async () => {
    const onConfirmMeeting = vi.fn();
    const onSuggestOtherTime = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <NegotiationStatusCard
          meeting={proposedMeeting}
          requestStatus="accepted"
          counterpartName="João"
          sessionUserId="me"
          deliveryCompleted={false}
          onConfirmMeeting={onConfirmMeeting}
          onSuggestOtherTime={onSuggestOtherTime}
        />,
      );
    });

    expect(screen.getByText("Encontro sugerido por João")).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Confirmar encontro"));
    });
    expect(onConfirmMeeting).toHaveBeenCalled();

    const suggestBtn = screen.getByLabelText("Sugerir outro horário");
    expect(suggestBtn).toBeTruthy();
    await act(async () => {
      fireEvent.press(suggestBtn);
    });
    expect(onSuggestOtherTime).toHaveBeenCalled();
  });

  it("renderiza estado sem encontro e botão para combinar", async () => {
    const onCombineMeeting = vi.fn();

    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <NegotiationStatusCard
          meeting={null}
          requestStatus="accepted"
          counterpartName="João"
          sessionUserId="me"
          deliveryCompleted={false}
          onCombineMeeting={onCombineMeeting}
        />,
      );
    });

    expect(screen.getByText("Nenhum encontro marcado")).toBeTruthy();
    await act(async () => {
      fireEvent.press(screen.getByLabelText("Combinar encontro"));
    });
    expect(onCombineMeeting).toHaveBeenCalled();
  });

  it("renderiza proposta enviada pelo próprio usuário aguardando resposta", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <NegotiationStatusCard
          meeting={{ ...proposedMeeting, proposedBy: "me" }}
          requestStatus="accepted"
          counterpartName="João"
          sessionUserId="me"
          deliveryCompleted={false}
        />,
      );
    });

    expect(screen.getByText("Aguardando resposta de João")).toBeTruthy();
    expect(screen.queryByLabelText("Confirmar encontro")).toBeNull();
  });

  it("renderiza encontro com ponto alternativo sem quebrar", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;
    await act(async () => {
      screen = await render(
        <NegotiationStatusCard
          meeting={{ ...confirmedMeeting, pointName: "Estação Ferroviária" }}
          requestStatus="accepted"
          counterpartName="João"
          sessionUserId="me"
          deliveryCompleted={false}
        />,
      );
    });

    expect(screen.getByText("Estação Ferroviária")).toBeTruthy();
    expect(screen.queryByLabelText("Entrega do livro")).toBeNull();
    expect(screen.queryByLabelText("Como chegar")).toBeNull();
    expect(screen.queryByLabelText("Adicionar à agenda")).toBeNull();
  });

  it("chama onOpenRating quando fornecido e não quebra se omitido", async () => {
    const onOpenRating = vi.fn();
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <NegotiationStatusCard
          meeting={null}
          requestStatus="accepted"
          counterpartName="João"
          sessionUserId="me"
          deliveryCompleted={true}
          onOpenRating={onOpenRating}
        />,
      );
    });

    await act(async () => {
      fireEvent.press(screen.getByLabelText("Avaliar negociação"));
    });
    expect(onOpenRating).toHaveBeenCalled();

    // Sem onOpenRating
    await act(async () => {
      screen = await render(
        <NegotiationStatusCard
          meeting={null}
          requestStatus="accepted"
          counterpartName="João"
          sessionUserId="me"
          deliveryCompleted={true}
        />,
      );
    });
    expect(screen.queryByLabelText("Avaliar negociação")).toBeNull();
  });

  it("não quebra quando proposta recebida ou sem encontro não recebem callbacks", async () => {
    let screen!: Awaited<ReturnType<typeof render>>;

    await act(async () => {
      screen = await render(
        <NegotiationStatusCard
          meeting={proposedMeeting}
          requestStatus="accepted"
          counterpartName="João"
          sessionUserId="me"
          deliveryCompleted={false}
        />,
      );
    });
    expect(screen.queryByLabelText("Confirmar encontro")).toBeNull();

    await act(async () => {
      screen = await render(
        <NegotiationStatusCard
          meeting={null}
          requestStatus="accepted"
          counterpartName="João"
          sessionUserId="me"
          deliveryCompleted={false}
        />,
      );
    });
    expect(screen.queryByLabelText("Combinar encontro")).toBeNull();
  });
});
