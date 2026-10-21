import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Share } from "react-native";
import * as Linking from "expo-linking";
import { shareUseCases } from "@/di/container";
import { DomainError } from "@/model/errors";
import type { IShareUseCases, ShareableListing } from "@/usecase/iShareUseCases";

export type ShareListingState = {
  sharing: boolean;
  linkCopied: boolean;
  error: string | null;
};

export type ShareListingActions = {
  share: (bookId: string) => Promise<void>;
  /** Compartilhamento dedicado ao WhatsApp (Issue #145), com texto formatado e fallback. */
  shareToWhatsApp: (bookId: string, listing: ShareableListing) => Promise<void>;
  dismissLinkCopied: () => void;
};

const GENERIC_ERROR = "Não foi possível compartilhar o anúncio. Tente novamente.";

type WebNavigatorWithShare = Navigator & { share?: (data: { text?: string; url?: string }) => Promise<void> };

export function useShareListingViewModel(
  useCases: IShareUseCases = shareUseCases,
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
        const url = Linking.createURL(path);
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
        const url = Linking.createURL(path);
        const message = useCases.buildShareMessage(listing, url);

        if (Platform.OS === "web") {
          const webNavigator = navigator as WebNavigatorWithShare;
          if (typeof webNavigator.share === "function") {
            await webNavigator.share({ text: message, url });
          } else {
            await navigator.clipboard.writeText(message);
          }
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

  const dismissLinkCopied = useCallback(() => {
    setState((prev) => ({ ...prev, linkCopied: false }));
  }, []);

  return [state, { share, shareToWhatsApp, dismissLinkCopied }];
}
