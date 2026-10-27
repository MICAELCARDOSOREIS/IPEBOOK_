import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Share } from "react-native";
import * as Linking from "expo-linking";
import { shareUseCases } from "@/di/container";
import { DomainError } from "@/model/errors";
import type { IShareUseCases } from "@/usecase/iShareUseCases";
import { defaultShareImageFile, type ShareImageFile } from "@/viewmodel/shareImageFile";

export type InviteFriendsState = {
  sharing: boolean;
  linkCopied: boolean;
  error: string | null;
  inviteMessage: string;
  inviteUrl: string;
};

export type InviteFriendsActions = {
  /** Captura a imagem do convite (`capture` devolve o arquivo PNG) e abre a folha de compartilhamento (Spec 092). */
  shareImage: (capture: () => Promise<string>) => Promise<void>;
  shareToWhatsApp: () => Promise<void>;
  shareNative: () => Promise<void>;
  copyLink: () => Promise<void>;
  dismissLinkCopied: () => void;
};

const GENERIC_ERROR = "Não foi possível compartilhar o convite. Tente novamente.";
const DEFAULT_APP_URL = "https://ipebook.app";

type WebNavigatorWithShare = Navigator & { share?: (data: { text?: string; url?: string }) => Promise<void> };

export function useInviteFriendsViewModel(
  useCases: IShareUseCases = shareUseCases,
  appUrl: string = DEFAULT_APP_URL,
  shareImageFile: ShareImageFile = defaultShareImageFile,
): [InviteFriendsState, InviteFriendsActions] {
  const message = useCases.buildInviteMessage(appUrl);
  const [state, setState] = useState<InviteFriendsState>({
    sharing: false,
    linkCopied: false,
    error: null,
    inviteMessage: message,
    inviteUrl: appUrl,
  });
  const active = useRef(true);
  const busy = useRef(false);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  const shareImage = useCallback(
    async (capture: () => Promise<string>) => {
      if (busy.current) return;
      busy.current = true;
      setState((prev) => ({ ...prev, sharing: true, error: null }));
      try {
        // Na web não há arquivo para a folha do sistema: cai no texto com link.
        const shared = Platform.OS === "web" ? false : await shareImageFile(await capture(), "Convidar amigos para o IpêBook");
        if (!shared) await Share.share({ message });
        if (active.current) setState((prev) => ({ ...prev, sharing: false, linkCopied: false, error: null }));
      } catch (error) {
        if (active.current) {
          setState((prev) => ({
            ...prev,
            sharing: false,
            error: error instanceof DomainError ? error.message : GENERIC_ERROR,
          }));
        }
      } finally {
        busy.current = false;
      }
    },
    [message, shareImageFile],
  );

  const shareToWhatsApp = useCallback(async () => {
    setState((prev) => ({ ...prev, sharing: true, error: null }));
    try {
      if (Platform.OS === "web") {
        const webNavigator = navigator as WebNavigatorWithShare;
        if (typeof webNavigator.share === "function") {
          await webNavigator.share({ text: message, url: appUrl });
        } else {
          await navigator.clipboard.writeText(message);
        }
        if (active.current) setState((prev) => ({ ...prev, sharing: false, linkCopied: true, error: null }));
        return;
      }

      const whatsappUrl = useCases.buildWhatsAppInviteUrl(appUrl);
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        await Share.share({ message });
      }
      if (active.current) setState((prev) => ({ ...prev, sharing: false, linkCopied: false, error: null }));
    } catch (error) {
      if (active.current) {
        setState((prev) => ({
          ...prev,
          sharing: false,
          linkCopied: false,
          error: error instanceof DomainError ? error.message : GENERIC_ERROR,
        }));
      }
    }
  }, [appUrl, message, useCases]);

  const shareNative = useCallback(async () => {
    setState((prev) => ({ ...prev, sharing: true, error: null }));
    try {
      if (Platform.OS === "web") {
        const webNavigator = navigator as WebNavigatorWithShare;
        if (typeof webNavigator.share === "function") {
          await webNavigator.share({ text: message, url: appUrl });
          if (active.current) setState((prev) => ({ ...prev, sharing: false, linkCopied: false, error: null }));
        } else {
          await navigator.clipboard.writeText(message);
          if (active.current) setState((prev) => ({ ...prev, sharing: false, linkCopied: true, error: null }));
        }
        return;
      }

      await Share.share({ message });
      if (active.current) setState((prev) => ({ ...prev, sharing: false, linkCopied: false, error: null }));
    } catch (error) {
      if (active.current) {
        setState((prev) => ({
          ...prev,
          sharing: false,
          linkCopied: false,
          error: error instanceof DomainError ? error.message : GENERIC_ERROR,
        }));
      }
    }
  }, [appUrl, message]);

  const copyLink = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        await navigator.clipboard.writeText(appUrl);
      } else {
        await Share.share({ message: appUrl });
      }
      if (active.current) setState((prev) => ({ ...prev, linkCopied: true, error: null }));
    } catch (error) {
      if (active.current) {
        setState((prev) => ({
          ...prev,
          error: error instanceof DomainError ? error.message : GENERIC_ERROR,
        }));
      }
    }
  }, [appUrl]);

  const dismissLinkCopied = useCallback(() => {
    if (active.current) setState((prev) => ({ ...prev, linkCopied: false }));
  }, []);

  return [state, { shareImage, shareToWhatsApp, shareNative, copyLink, dismissLinkCopied }];
}
