
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render } from "@testing-library/react-native";
import {
  PERMISSION_PROMPT_COPY,
  PermissionPromptDialog,
} from "@/view/components/PermissionPromptDialog";

const noop = () => {};
const props = { onAllow: noop, onLater: noop, onDismiss: noop };

describe("PermissionPromptDialog (Spec 020 T004)", () => {
  afterEach(() => {
    cleanup();
  });

  it("não desenha nada quando o aviso está fechado", async () => {
    const { queryByText, toJSON } = await render(
      <PermissionPromptDialog permission="notifications" status="idle" {...props} />,
    );
    expect(toJSON()).toBeNull();
    expect(queryByText(PERMISSION_PROMPT_COPY.notifications.title)).toBeNull();
  });

  it("não desenha nada durante a requisição — quem aparece é o prompt do sistema", async () => {
    const { toJSON } = await render(<PermissionPromptDialog permission="photos" status="requesting" {...props} />);
    expect(toJSON()).toBeNull();
  });

  it("CA2: explica o motivo das notificações e chama permitir ou adiar", async () => {
    const onAllow = vi.fn();
    const onLater = vi.fn();
    const screen = await render(
      <PermissionPromptDialog
        permission="notifications"
        status="explain"
        onAllow={onAllow}
        onLater={onLater}
        onDismiss={noop}
      />,
    );
    expect(screen.getByText(PERMISSION_PROMPT_COPY.notifications.title)).toBeDefined();
    await act(async () => {
      fireEvent.press(screen.getByLabelText(PERMISSION_PROMPT_COPY.notifications.allow));
    });
    expect(onAllow).toHaveBeenCalledTimes(1);
    await act(async () => {
      fireEvent.press(screen.getByLabelText(PERMISSION_PROMPT_COPY.notifications.later));
    });
    expect(onLater).toHaveBeenCalledTimes(1);
  });

  it("CA3: na recusa diz o que fica indisponível, como habilitar depois e fecha com 'entendi'", async () => {
    const onDismiss = vi.fn();
    const onAllow = vi.fn();
    const screen = await render(
      <PermissionPromptDialog
        permission="notifications"
        status="denied"
        onAllow={onAllow}
        onLater={noop}
        onDismiss={onDismiss}
      />,
    );
    const message = PERMISSION_PROMPT_COPY.notifications.deniedMessage;
    expect(screen.getByText(message)).toBeDefined();
    expect(message).toContain("Ajustes do aparelho");
    await act(async () => {
      fireEvent.press(screen.getByLabelText(PERMISSION_PROMPT_COPY.notifications.understood));
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
    await act(async () => {
      fireEvent.press(screen.getByLabelText(PERMISSION_PROMPT_COPY.notifications.retry));
    });
    expect(onAllow).toHaveBeenCalledTimes(1);
  });

  it("CA4: fotos — a explicação e a recusa dão a saída de publicar sem foto", async () => {
    const explain = await render(<PermissionPromptDialog permission="photos" status="explain" {...props} />);
    expect(explain.getByText(PERMISSION_PROMPT_COPY.photos.title)).toBeDefined();
    expect(explain.getByLabelText(PERMISSION_PROMPT_COPY.photos.later)).toBeDefined();

    const denied = await render(<PermissionPromptDialog permission="photos" status="denied" {...props} />);
    expect(denied.getByText(PERMISSION_PROMPT_COPY.photos.deniedTitle)).toBeDefined();
    expect(denied.getByLabelText(PERMISSION_PROMPT_COPY.photos.understood)).toBeDefined();
  });
});
