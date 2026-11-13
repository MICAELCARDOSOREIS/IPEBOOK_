import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Share } from "react-native";
import * as Linking from "expo-linking";
import { DomainError } from "@/model/errors";
import type { IShareUseCases, ShareableListing } from "@/usecase/iShareUseCases";
import { defaultShareImageFile, type ShareImageFile } from "@/viewmodel/shareImageFile";

export type ShareListingState = {
  sharing: boolean;
  linkCopied: boolean;
  error: string | null;
};

export type ShareListingActions = {
  share: (bookId: string, listing?: ShareableListing, capture?: () => Promise<string>) => Promise<void>;
  /** Captura a imagem do anúncio (`capture` devolve o PNG) e abre a folha de compartilhamento (Spec 092). */
  shareImage: (bookId: string, listing: ShareableListing, capture: () => Promise<string>) => Promise<void>;
  /** Atalho do WhatsApp (Spec 118 / ADR 0110): abre o aplicativo com a mensagem formatada, sem a folha do sistema. */
  shareToWhatsApp: (bookId: string, listing: ShareableListing) => Promise<void>;
  dismissLinkCopied: () => void;
  /** Fecha o aviso de falha exibido na tela; a próxima tentativa também limpa o erro sozinha. */
  dismissError: () => void;
};

const GENERIC_ERROR = "Não foi possível compartilhar o anúncio. Tente novamente.";

/**
 * Endereço público do app. `Linking.createURL` devolvia `exp://` no Expo Go e `ipebook://` nos aplicativos,
 * que o WhatsApp não abre como link: o convite do anúncio precisa de um `https://`.
 */
export const SHARE_BASE_URL = "https://ipebook.app";

type WebNavigatorWithShare = Navigator & { share?: (data: { text?: string; url?: string }) => Promise<void> };

export function useShareListingViewModel(
  useCases: IShareUseCases,
  shareImageFile: ShareImageFile = defaultShareImageFile,
): [ShareListingState, ShareListingActions] {
  const [state, setState] = useState<ShareListingState>({
    sharing: false,
    linkCopied: false,
    error: null,
  });
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  const share = useCallback(
    async (bookId: string, listing?: ShareableListing, capture?: () => Promise<string>) => {
      setState((prev) => ({ ...prev, sharing: true, error: null }));
      try {
        const path = useCases.buildListingSharePath(bookId);
        const url = `${SHARE_BASE_URL}${path}`;
        const message = listing
          ? useCases.buildWhatsAppShareMessage
            ? useCases.buildWhatsAppShareMessage(listing, url)
            : useCases.buildShareMessage(listing, url)
          : url;

        if (Platform.OS === "web") {
          const webNavigator = navigator as WebNavigatorWithShare;
          if (listing && typeof webNavigator?.share === "function") {
            try {
              // A mensagem já termina com o link: passar `url` também duplicaria o endereço no destino.
              await webNavigator.share({ text: message });
              // A folha do sistema é o próprio retorno; nada foi copiado para a área de transferência.
              if (active.current) setState({ sharing: false, linkCopied: false, error: null });
              return;
            } catch (shareError) {
              const name = (shareError as { name?: string } | null)?.name;
              if (name === "AbortError") {
                if (active.current) setState({ sharing: false, linkCopied: false, error: null });
                return;
              }
              if (name !== "NotAllowedError") throw shareError;
            }
          }
          await navigator.clipboard.writeText(message);
          if (active.current) setState({ sharing: false, linkCopied: true, error: null });
        } else {
          if (listing && capture) {
            try {
              const imageUri = await capture();
              const sharedWithFile = await shareImageFile(imageUri, message, "Compartilhar anúncio");
              if (sharedWithFile) {
                if (active.current) setState({ sharing: false, linkCopied: false, error: null });
                return;
              }
            } catch {
              // Prossegue para o compartilhamento nativo do texto com link se a captura falhar
            }
          }
          await Share.share({ message });
          if (active.current) setState({ sharing: false, linkCopied: false, error: null });
        }
      } catch (error) {
        if (active.current) {
          setState({
            sharing: false,
            linkCopied: false,
            error: error instanceof DomainError ? error.message : GENERIC_ERROR,
          });
        }
      }
    },
    [useCases, shareImageFile],
  );

  const shareToWhatsApp = useCallback(
    async (bookId: string, listing: ShareableListing) => {
      setState((prev) => ({ ...prev, sharing: true, error: null }));
      try {
        const path = useCases.buildListingSharePath(bookId);
        const url = `${SHARE_BASE_URL}${path}`;
        const message = useCases.buildWhatsAppShareMessage
          ? useCases.buildWhatsAppShareMessage(listing, url)
          : useCases.buildShareMessage(listing, url);

        if (Platform.OS === "web") {
          const webNavigator = navigator as WebNavigatorWithShare;
          let shared = false;
          if (typeof webNavigator.share === "function") {
            try {
              await webNavigator.share({ text: message });
              shared = true;
            } catch (shareError) {
              const name = (shareError as { name?: string } | null)?.name;
              // Fechar o menu do navegador não é falha; nada foi compartilhado nem copiado.
              if (name === "AbortError") {
                if (active.current) setState({ sharing: false, linkCopied: false, error: null });
                return;
              }
              // Sem permissão (iframe, falta de gesto do usuário): recorre à área de transferência.
              if (name !== "NotAllowedError") throw shareError;
            }
          }
          if (!shared) {
            const webUrl = useCases.buildWhatsAppShareUrl(message, true);
            let opened = false;
            try {
              if (typeof window !== "undefined" && typeof window.open === "function") {
                const win = window.open(webUrl, "_blank", "noopener,noreferrer");
                opened = Boolean(win);
              }
            } catch {
              opened = false;
            }
            if (!opened) {
              await Linking.openURL(webUrl).catch(() => null);
            }
            if (navigator?.clipboard?.writeText) {
              await navigator.clipboard.writeText(message).catch(() => null);
            }
          }
          // Só houve cópia quando a folha do sistema não foi usada com sucesso.
          if (active.current) setState({ sharing: false, linkCopied: !shared, error: null });
          return;
        }

        // Mobile: abre o WhatsApp direto com a mensagem formatada. A arte do card continua no botão de
        // compartilhamento geral: enviá-la por `ACTION_SEND` abria a mesma folha do sistema que ele, e o
        // atalho do WhatsApp deixava de ser um atalho (ADR 0110). O link canônico já gera a prévia do
        // anúncio no WhatsApp pelas tags Open Graph (Spec 119).
        const whatsappUrl = useCases.buildWhatsAppShareUrl(message, false);
        // `canOpenURL` responde "não" para o esquema do WhatsApp no Android 11+ (visibilidade de pacotes)
        // e no iOS sem `LSApplicationQueriesSchemes`, mesmo com o app instalado. Abrir de fato — e cair
        // no menu do sistema só quando a abertura falha — é o teste confiável da presença do WhatsApp.
        try {
          await Linking.openURL(whatsappUrl);
        } catch {
          await Share.share({ message });
        }
        if (active.current) setState({ sharing: false, linkCopied: false, error: null });
      } catch (error) {
        if (active.current) {
          setState({
            sharing: false,
            linkCopied: false,
            error: error instanceof DomainError ? error.message : GENERIC_ERROR,
          });
        }
      }
    },
    [useCases],
  );

  const shareImage = useCallback(
    async (bookId: string, listing: ShareableListing, capture: () => Promise<string>) => {
      setState((prev) => ({ ...prev, sharing: true, error: null }));
      try {
        const url = `${SHARE_BASE_URL}${useCases.buildListingSharePath(bookId)}`;
        const message = useCases.buildShareMessage(listing, url);
        if (Platform.OS === "web") {
          // Na web não há arquivo para a folha do sistema: copia o texto com o link.
          await navigator.clipboard.writeText(message);
          if (active.current) setState({ sharing: false, linkCopied: true, error: null });
          return;
        }
        const shared = await shareImageFile(await capture(), message, "Compartilhar anúncio");
        if (!shared) await Share.share({ message });
        if (active.current) setState({ sharing: false, linkCopied: false, error: null });
      } catch (error) {
        if (active.current) {
          setState({
            sharing: false,
            linkCopied: false,
            error: error instanceof DomainError ? error.message : GENERIC_ERROR,
          });
        }
      }
    },
    [useCases, shareImageFile],
  );

  const dismissLinkCopied = useCallback(() => {
    setState((prev) => ({ ...prev, linkCopied: false }));
  }, []);

  const dismissError = useCallback(() => {
    setState((prev) => (prev.error ? { ...prev, error: null } : prev));
  }, []);

  return [state, { share, shareImage, shareToWhatsApp, dismissLinkCopied, dismissError }];
}
