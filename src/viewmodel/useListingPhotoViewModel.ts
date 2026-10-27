import { useCallback, useEffect, useRef, useState } from "react";
import { imagePickerService, listingPhotoUseCases } from "@/di/container";
import { DomainError } from "@/model/errors";
import type { IImagePickerService, ImageSource } from "@/model/services/iImagePickerService";
import type { IListingPhotoUseCases } from "@/usecase/iListingPhotoUseCases";

export type ListingPhotoState = { uploading: boolean; error: string | null };

const UPLOAD_ERROR = "Não foi possível enviar a foto. Tente novamente.";
/** Capa de livro: retrato 5:8, a mesma proporção da capa ilustrativa. */
const COVER_ASPECT = [5, 8] as const;

/**
 * Foto do anúncio pela câmera ou galeria (Spec 092): abre o seletor com recorte de capa, envia e
 * devolve a URL pública. `null` quando a pessoa cancela ou dá erro.
 */
export function useListingPhotoViewModel(
  sessionUserId: string | null,
  picker: IImagePickerService = imagePickerService,
  useCases: IListingPhotoUseCases = listingPhotoUseCases,
): [ListingPhotoState, { choose: (source: ImageSource) => Promise<string | null>; clearError: () => void }] {
  const [state, setState] = useState<ListingPhotoState>({ uploading: false, error: null });
  const active = useRef(true);
  const busy = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  const choose = useCallback(
    async (source: ImageSource) => {
      if (busy.current) return null;
      busy.current = true;
      setState({ uploading: false, error: null });
      try {
        const image = await picker.pickImage(source, COVER_ASPECT);
        if (!image) return null;
        if (active.current) setState({ uploading: true, error: null });
        const url = await useCases.uploadListingPhoto(sessionUserId ?? "", image);
        if (active.current) setState({ uploading: false, error: null });
        return url;
      } catch (error) {
        if (active.current) {
          setState({ uploading: false, error: error instanceof DomainError ? error.message : UPLOAD_ERROR });
        }
        return null;
      } finally {
        busy.current = false;
      }
    },
    [picker, useCases, sessionUserId],
  );

  const clearError = useCallback(() => setState((prev) => ({ ...prev, error: null })), []);
  return [state, { choose, clearError }];
}
