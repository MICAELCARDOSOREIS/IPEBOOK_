import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Share } from "react-native";
import * as Linking from "expo-linking";
import { shareUseCases } from "@/di/container";
import { DomainError } from "@/model/errors";
import type { IShareUseCases } from "@/usecase/iShareUseCases";

export type ShareListingState = {
  sharing: boolean;
  linkCopied: boolean;
  error: string | null;
};

export type ShareListingActions = {
  share: (bookId: string) => Promise<void>;
  dismissLinkCopied: () => void;
};

const GENERIC_ERROR = "Não foi possível compartilhar o anúncio. Tente novamente.";

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

  const dismissLinkCopied = useCallback(() => {
    setState((prev) => ({ ...prev, linkCopied: false }));
  }, []);

  return [state, { share, dismissLinkCopied }];
}
