import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Share } from "react-native";
import * as Linking from "expo-linking";
import { DomainError } from "@/model/errors";
import type { IShareUseCases } from "@/usecase/iShareUseCases";
import { defaultShareImageFile, type ShareImageFile } from "@/viewmodel/shareImageFile";

export type InviteFriendsState = {
  sharing: boolean;
  linkCopied: boolean;
  /** Folha de compartilhamento do aparelho aberta: o convite está pronto para enviar. */
  shared: boolean;
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
  dismissShared: () => void;
};

const GENERIC_ERROR = "Não foi possível compartilhar o convite. Tente novamente.";
const DEFAULT_APP_URL = "https://ipebook.app";

type WebNavigatorWithShare = Navigator & { share?: (data: { text?: string; url?: string }) => Promise<void> };

export function useInviteFriendsViewModel(
  useCases: IShareUseCases,
  appUrl: string = DEFAULT_APP_URL,
  shareImageFile: ShareImageFile = defaultShareImageFile,
): [InviteFriendsState, InviteFriendsActions] {
  const message = useCases.buildInviteMessage(appUrl);
  const [state, setState] = useState<InviteFriendsState>({
    sharing: false,
    linkCopied: false,
    shared: false,
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
      setState((prev) => ({ ...prev, sharing: true, shared: false, error: null }));
      try {
        // Na web não há arquivo para a folha do sistema: copia o texto com o link.
        if (Platform.OS === "web") {
          await navigator.clipboard.writeText(message);
          if (active.current) setState((prev) => ({ ...prev, sharing: false, linkCopied: true, error: null }));
          return;
        }
        const shared = await shareImageFile(await capture(), message, "Convidar amigos para o IpêBook");
        if (!shared) await Share.share({ message });
        if (active.current) setState((prev) => ({ ...prev, sharing: false, shared: true, error: null }));
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
    setState((prev) => ({ ...prev, sharing: true, shared: false, error: null }));
    try {
      if (Platform.OS === "web") {
        const webNavigator = navigator as WebNavigatorWithShare;
        if (typeof webNavigator.share === "function") {
          try {
            // O convite já termina com o link: repetir `url` duplicaria o endereço no destino.
            await webNavigator.share({ text: message });
            if (active.current) setState((prev) => ({ ...prev, sharing: false, shared: true, error: null }));
            return;
          } catch (shareError) {
            const name = (shareError as { name?: string } | null)?.name;
            // Fechar o menu do navegador não é falha; nada foi compartilhado nem copiado.
            if (name === "AbortError") {
              if (active.current) setState((prev) => ({ ...prev, sharing: false, error: null }));
              return;
            }
            // Sem permissão (iframe, falta de gesto do usuário): recorre à área de transferência.
            if (name !== "NotAllowedError") throw shareError;
          }
        }
        await navigator.clipboard.writeText(message);
        if (active.current) setState((prev) => ({ ...prev, sharing: false, linkCopied: true, error: null }));
        return;
      }

      const whatsappUrl = useCases.buildWhatsAppInviteUrl(appUrl);
      // `canOpenURL` responde "não" para o esquema do WhatsApp no Android 11+ (visibilidade de pacotes)
      // e no iOS sem `LSApplicationQueriesSchemes`, mesmo com o app instalado. Abrir de fato — e cair
      // no menu do sistema quando a abertura falha — é o teste confiável da presença do WhatsApp.
      try {
        await Linking.openURL(whatsappUrl);
      } catch {
        await Share.share({ message });
      }
      if (active.current) setState((prev) => ({ ...prev, sharing: false, shared: true, error: null }));
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
    setState((prev) => ({ ...prev, sharing: true, shared: false, error: null }));
    try {
      if (Platform.OS === "web") {
        const webNavigator = navigator as WebNavigatorWithShare;
        if (typeof webNavigator.share === "function") {
          try {
            // O convite já termina com o link: repetir `url` duplicaria o endereço no destino.
            await webNavigator.share({ text: message });
            if (active.current) setState((prev) => ({ ...prev, sharing: false, shared: true, error: null }));
            return;
          } catch (shareError) {
            const name = (shareError as { name?: string } | null)?.name;
            if (name === "AbortError") {
              if (active.current) setState((prev) => ({ ...prev, sharing: false, error: null }));
              return;
            }
            if (name !== "NotAllowedError") throw shareError;
          }
        }
        await navigator.clipboard.writeText(message);
        if (active.current) setState((prev) => ({ ...prev, sharing: false, linkCopied: true, error: null }));
        return;
      }

      await Share.share({ message });
      if (active.current) setState((prev) => ({ ...prev, sharing: false, shared: true, error: null }));
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
  }, [message]);

  const copyLink = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        await navigator.clipboard.writeText(appUrl);
        if (active.current) setState((prev) => ({ ...prev, linkCopied: true, shared: false, error: null }));
      } else {
        // No aparelho não há área de transferência no fluxo: abre a folha de compartilhamento.
        await Share.share({ message: appUrl });
        if (active.current) setState((prev) => ({ ...prev, linkCopied: false, shared: true, error: null }));
      }
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

  const dismissShared = useCallback(() => {
    if (active.current) setState((prev) => ({ ...prev, shared: false }));
  }, []);

  return [state, { shareImage, shareToWhatsApp, shareNative, copyLink, dismissLinkCopied, dismissShared }];
}
