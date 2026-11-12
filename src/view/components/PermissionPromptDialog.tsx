import type { PermissionKind } from "@/model/entities/permission";
import type { PermissionPromptStatus } from "@/viewmodel/usePermissionPromptViewModel";
import { Dialog } from "@/view/components/Dialog";

type PromptCopy = {
  title: string;
  message: string;
  allow: string;
  later: string;
  deniedTitle: string;
  /** Recusa: o que ficou indisponível e como habilitar depois (CA3 da Spec 020). */
  deniedMessage: string;
  understood: string;
  retry: string;
};

/**
 * Textos do aviso que precede o prompt nativo (Spec 020). Uma linha por permissão: a tela é a mesma,
 * o motivo e o que fica indisponível mudam.
 */
export const PERMISSION_PROMPT_COPY: Record<PermissionKind, PromptCopy> = {
  notifications: {
    title: "Avisos no seu celular",
    message:
      "O IpêBook pode avisar quando chega uma proposta, quando um livro dos seus alertas aparece ou quando o encontro de entrega está perto. Em seguida o aparelho vai perguntar se você aceita.",
    allow: "Permitir avisos",
    later: "Agora não",
    deniedTitle: "Avisos só dentro do app",
    deniedMessage:
      "Sem essa permissão você continua vendo todos os avisos na Central de notificações do IpêBook, mas o celular não avisa sozinho. Para receber, ative em Ajustes do aparelho > Aplicativos > IpêBook > Notificações.",
    understood: "Entendi",
    retry: "Tentar de novo",
  },
  photos: {
    title: "Fotos do seu livro",
    message:
      "Para tirar ou escolher uma foto, o IpêBook pede acesso à câmera e às fotos do aparelho. Se preferir, publique sem foto: usamos uma capa ilustrativa do livro.",
    allow: "Permitir e escolher",
    later: "Publicar sem foto",
    deniedTitle: "Foto indisponível",
    deniedMessage:
      "Sem o acesso liberado não dá para enviar a imagem. Publique com a capa ilustrativa agora ou libere em Ajustes do aparelho > Aplicativos > IpêBook e tente de novo.",
    understood: "Publicar sem foto",
    retry: "Tentar de novo",
  },
};

export type PermissionPromptDialogProps = {
  permission: PermissionKind;
  status: PermissionPromptStatus;
  onAllow: () => void;
  onLater: () => void;
  onDismiss: () => void;
};

/**
 * Tela parametrizada que explica o motivo antes do prompt nativo e informa o que ficou indisponível
 * depois da recusa (Spec 020 T004). Usa o diálogo do design system, com foco preso e toque de 48dp.
 */
export function PermissionPromptDialog({
  permission,
  status,
  onAllow,
  onLater,
  onDismiss,
}: PermissionPromptDialogProps) {
  const copy = PERMISSION_PROMPT_COPY[permission];
  if (status === "explain") {
    return (
      <Dialog
        visible
        title={copy.title}
        message={copy.message}
        confirmLabel={copy.allow}
        cancelLabel={copy.later}
        onConfirm={onAllow}
        onCancel={onLater}
      />
    );
  }
  if (status === "denied") {
    return (
      <Dialog
        visible
        title={copy.deniedTitle}
        message={copy.deniedMessage}
        confirmLabel={copy.understood}
        cancelLabel={copy.retry}
        onConfirm={onDismiss}
        onCancel={onAllow}
      />
    );
  }
  return null;
}
