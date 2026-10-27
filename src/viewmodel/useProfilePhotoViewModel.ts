import { useCallback, useEffect, useRef, useState } from "react";
import { imagePickerService, profilePhotoUseCases } from "@/di/container";
import { DomainError } from "@/model/errors";
import type { IImagePickerService, ImageSource } from "@/model/services/iImagePickerService";
import type { IProfilePhotoUseCases } from "@/usecase/iProfilePhotoUseCases";

export type ProfilePhotoState = { uploading: boolean; error: string | null };

const UPLOAD_ERROR = "Não foi possível enviar a foto. Tente novamente.";

/**
 * Foto de perfil pela câmera ou galeria (Spec 081, ADR 0065): abre o seletor, envia e devolve a URL
 * pública, que a tela guarda no formulário até salvar. `null` quando a pessoa cancela ou dá erro.
 */
export function useProfilePhotoViewModel(
  sessionUserId: string | null,
  picker: IImagePickerService = imagePickerService,
  useCases: IProfilePhotoUseCases = profilePhotoUseCases,
): [ProfilePhotoState, { choose: (source: ImageSource) => Promise<string | null>; clearError: () => void }] {
  const [state, setState] = useState<ProfilePhotoState>({ uploading: false, error: null });
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  const choose = useCallback(
    async (source: ImageSource) => {
      setState({ uploading: false, error: null });
      try {
        const image = await picker.pickSquareImage(source);
        if (!image) return null;
        if (active.current) setState({ uploading: true, error: null });
        const url = await useCases.uploadProfilePhoto(sessionUserId ?? "", image);
        if (active.current) setState({ uploading: false, error: null });
        return url;
      } catch (error) {
        if (active.current) {
          setState({ uploading: false, error: error instanceof DomainError ? error.message : UPLOAD_ERROR });
        }
        return null;
      }
    },
    [picker, useCases, sessionUserId],
  );

  const clearError = useCallback(() => setState((prev) => ({ ...prev, error: null })), []);
  return [state, { choose, clearError }];
}
