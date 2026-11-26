import { useCallback, useEffect, useRef, useState } from "react";
import type { BookPhotoSide } from "@/model/bookPhotos";
import { DomainError, ImagePermissionDeniedError } from "@/model/errors";
import type { IImagePickerService, ImageSource } from "@/model/services/iImagePickerService";
import type { IListingPhotoUseCases } from "@/usecase/iListingPhotoUseCases";

export type ListingPhotoState = { uploading: boolean; error: string | null; permissionDenied?: boolean };

const UPLOAD_ERROR = "Não foi possível enviar a foto. Tente novamente.";
/** Capa e verso do livro: retrato 5:8, a mesma proporção da capa ilustrativa. */
const COVER_ASPECT = [5, 8] as const;
/** Lombada do livro: faixa vertical estreita 1:6 proporcional ao Book3D. */
const SPINE_ASPECT = [1, 6] as const;

/**
 * Foto do anúncio pela câmera ou galeria (Spec 092): abre o seletor com recorte de capa, envia e
 * devolve a URL pública. `null` quando a pessoa cancela ou dá erro.
 */
export function useListingPhotoViewModel(
  sessionUserId: string | null,
  picker: IImagePickerService,
  useCases: IListingPhotoUseCases,
): [
  ListingPhotoState,
  { choose: (source: ImageSource, side?: BookPhotoSide) => Promise<string | null>; clearError: () => void },
] {
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
    async (source: ImageSource, side?: BookPhotoSide) => {
      if (busy.current) return null;
      busy.current = true;
      setState({ uploading: false, error: null });
      try {
        const aspect = side === "spine" ? SPINE_ASPECT : COVER_ASPECT;
        const image = await picker.pickImage(source, aspect);
        if (!image) return null;
        if (active.current) setState({ uploading: true, error: null });
        const file = side ? { ...image, side } : image;
        const url = await useCases.uploadListingPhoto(sessionUserId ?? "", file);
        if (active.current) setState({ uploading: false, error: null });
        return url;
      } catch (error) {
        if (active.current) {
          setState({
            uploading: false,
            error: error instanceof DomainError ? error.message : UPLOAD_ERROR,
            ...(error instanceof ImagePermissionDeniedError ? { permissionDenied: true } : {}),
          });
        }
        return null;
      } finally {
        busy.current = false;
      }
    },
    [picker, useCases, sessionUserId],
  );

  const clearError = useCallback(() => setState((prev) => ({ uploading: prev.uploading, error: null })), []);
  return [state, { choose, clearError }];
}
