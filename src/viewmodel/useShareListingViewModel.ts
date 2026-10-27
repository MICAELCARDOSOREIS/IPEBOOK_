import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Share } from "react-native";
import * as Linking from "expo-linking";
import { shareUseCases } from "@/di/container";
import { DomainError } from "@/model/errors";
import type { IShareUseCases, ShareableListing } from "@/usecase/iShareUseCases";
import { defaultShareImageFile, type ShareImageFile } from "@/viewmodel/shareImageFile";

export type ShareListingState = {
  sharing: boolean;
  linkCopied: boolean;
  error: string | null;
};

export type ShareListingActions = {
  share: (bookId: string) => Promise<void>;
  /** Captura a imagem do anúncio (`capture` devolve o PNG) e abre a folha de compartilhamento (Spec 092). */
  shareImage: (bookId: string, listing: ShareableListing, capture: () => Promise<string>) => Promise<void>;
  /** Compartilhamento dedicado ao WhatsApp (Issue #145), com texto formatado e fallback. */
  shareToWhatsApp: (bookId: string, listing: ShareableListing) => Promise<void>;
  dismissLinkCopied: () => void;
};

const GENERIC_ERROR = "Não foi possível compartilhar o anúncio. Tente novamente.";

/**
 * Endereço público do app. `Linking.createURL` devolvia `exp://` no Expo Go e `ipebook://` nos aplicativos,
 * que o WhatsApp não abre como link: o convite do anúncio precisa de um `https://`.
 */
export const SHARE_BASE_URL = "https://ipebook.app";

type WebNavigatorWithShare = Navigator & { share?: (data: { text?: string; url?: string }) => Promise<void> };

export function useShareListingViewModel(
  useCases: IShareUseCases = shareUseCases,
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
    async (bookId: string) => {
      setState((prev) => ({ ...prev, sharing: true, error: null }));
      try {
        const path = useCases.buildListingSharePath(bookId);
        const url = `${SHARE_BASE_URL}${path}`;
        if (Platform.OS === "web") {
          await navigator.clipboard.writeText(url);
          if (active.current) setState({ sharing: false, linkCopied: true, error: null });
        } else {
          await Share.share({ message: url });
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
    [useCases],
  );

  const shareToWhatsApp = useCallback(
    async (bookId: string, listing: ShareableListing) => {
      setState((prev) => ({ ...prev, sharing: true, error: null }));
      try {
        const path = useCases.buildListingSharePath(bookId);
        const url = `${SHARE_BASE_URL}${path}`;
        const message = useCases.buildShareMessage(listing, url);

        if (Platform.OS === "web") {
          const webNavigator = navigator as WebNavigatorWithShare;
          let shared = false;
          if (typeof webNavigator.share === "function") {
            try {
              await webNavigator.share({ text: message, url });
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
          if (!shared) await navigator.clipboard.writeText(message);
          if (active.current) setState({ sharing: false, linkCopied: true, error: null });
          return;
        }

        const whatsappUrl = useCases.buildWhatsAppShareUrl(message);
        const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);
        if (canOpenWhatsApp) {
          await Linking.openURL(whatsappUrl);
        } else {
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
        const shared = await shareImageFile(await capture(), "Compartilhar anúncio");
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

  return [state, { share, shareImage, shareToWhatsApp, dismissLinkCopied }];
}
