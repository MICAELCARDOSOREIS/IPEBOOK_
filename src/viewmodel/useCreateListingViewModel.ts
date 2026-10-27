import { useCallback, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  bookMetadataService as defaultMetadataService,
  bookUseCases,
  logger as defaultLogger,
  rateLimiter as defaultRateLimiter,
} from "@/di/container";
import type { Book, BookCondition, BookModality } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import { isValidIsbn, normalizeIsbn } from "@/model/isbn";
import type { ILogger } from "@/model/services/iLogger";
import type { IRateLimiter } from "@/model/services/iRateLimiter";
import type { IBookMetadataService } from "@/model/services/iBookMetadataService";
import type { CreateListingInput, IBookUseCases } from "@/usecase/iBookUseCases";
import { formKey, guardFormSubmit } from "@/viewmodel/formRateLimit";

export const CREATE_LISTING_DRAFT_KEY = "ipebook.rascunho_anuncio";

export type CreateListingDraft = {
  isbn: string;
  title: string;
  author: string;
  category: string;
  modality: BookModality;
  price: string;
  neighborhood: string;
  condition: BookCondition | null;
  description: string;
  photoUrl: string;
  photos: readonly string[];
};

export type IsbnFeedback = {
  type: "success" | "info" | "error";
  message: string;
};

export type CreateListingState = {
  isbn: string;
  lookingUpIsbn: boolean;
  isbnFeedback: IsbnFeedback | null;
  title: string;
  author: string;
  category: string;
  modality: BookModality;
  price: string;
  neighborhood: string;
  condition: BookCondition | null;
  description: string;
  photoUrl: string;
  photos: readonly string[];
  /** Identificador do rascunho no servidor quando a pessoa retomou um (Spec 017). */
  draftId: string | null;
  loading: boolean;
  error: string | null;
  success: boolean;
};

export type CreateListingActions = {
  setIsbn: (value: string) => void;
  lookupIsbn: (overrideIsbn?: string) => Promise<boolean>;
  handleBarcodeScanned: (code: string) => Promise<boolean>;
  clearIsbnFeedback: () => void;
  setTitle: (value: string) => void;
  setAuthor: (value: string) => void;
  setCategory: (value: string) => void;
  setModality: (value: BookModality) => void;
  setPrice: (value: string) => void;
  setNeighborhood: (value: string) => void;
  setCondition: (value: BookCondition | null) => void;
  setDescription: (value: string) => void;
  setPhotoUrl: (value: string) => void;
  addPhoto: (value: string) => void;
  removePhoto: (index: number) => void;
  saveDraft: () => Promise<void>;
  loadDraft: () => Promise<boolean>;
  clearDraft: () => Promise<void>;
  saveForLater: (sessionUserId: string | null, step: number) => Promise<boolean>;
  resumeDraft: (book: Book) => void;
  loadServerDraft: (draftId: string) => Promise<number | null>;
  submit: (sessionUserId: string | null) => Promise<Book | null>;
  reset: () => void;
};

const INITIAL_STATE: CreateListingState = {
  isbn: "",
  lookingUpIsbn: false,
  isbnFeedback: null,
  title: "",
  author: "",
  category: "",
  modality: "sale",
  price: "",
  neighborhood: "",
  condition: null,
  description: "",
  photoUrl: "",
  photos: [],
  draftId: null,
  loading: false,
  error: null,
  success: false,
};

const GENERIC_ERROR = "Não foi possível cadastrar o anúncio. Tente novamente.";

export function useCreateListingViewModel(
  useCases: IBookUseCases = bookUseCases,
  rateLimiter: IRateLimiter = defaultRateLimiter,
  logger: ILogger = defaultLogger,
  metadataService: IBookMetadataService = defaultMetadataService,
): [CreateListingState, CreateListingActions] {
  const [state, setState] = useState<CreateListingState>(INITIAL_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;

  const setIsbn = useCallback((value: string) => {
    setState((prev) => ({ ...prev, isbn: value, isbnFeedback: null }));
  }, []);

  const clearIsbnFeedback = useCallback(() => {
    setState((prev) => ({ ...prev, isbnFeedback: null }));
  }, []);

  const lookupIsbn = useCallback(async (overrideIsbn?: string): Promise<boolean> => {
    const rawIsbn = (overrideIsbn !== undefined ? overrideIsbn : state.isbn).trim();
    if (overrideIsbn !== undefined) {
      setState((prev) => ({ ...prev, isbn: overrideIsbn, isbnFeedback: null }));
    }
    if (!rawIsbn) {
      setState((prev) => ({
        ...prev,
        isbnFeedback: { type: "info", message: "Digite o código ISBN para buscar." },
      }));
      return false;
    }

    if (!isValidIsbn(rawIsbn)) {
      setState((prev) => ({
        ...prev,
        isbnFeedback: {
          type: "error",
          message: "Código ISBN inválido. Digite 10 ou 13 dígitos numéricos.",
        },
      }));
      return false;
    }

    setState((prev) => ({ ...prev, lookingUpIsbn: true, isbnFeedback: null }));
    try {
      const meta = await metadataService.lookupByIsbn(rawIsbn);
      if (!meta) {
        setState((prev) => ({
          ...prev,
          lookingUpIsbn: false,
          isbnFeedback: {
            type: "info",
            message: "Livro não encontrado na base pública. Você pode digitar os dados manualmente.",
          },
        }));
        return false;
      }

      setState((prev) => ({
        ...prev,
        lookingUpIsbn: false,
        title: meta.title,
        author: meta.author,
        photoUrl: meta.coverUrl && !prev.photoUrl ? meta.coverUrl : prev.photoUrl,
        isbnFeedback: {
          type: "success",
          message: `Encontrado: "${meta.title}"!`,
        },
      }));
      return true;
    } catch {
      setState((prev) => ({
        ...prev,
        lookingUpIsbn: false,
        isbnFeedback: {
          type: "info",
          message: "Não foi possível consultar a base no momento. Digite os dados manualmente.",
        },
      }));
      return false;
    }
  }, [metadataService, state.isbn]);

  const handleBarcodeScanned = useCallback(async (code: string): Promise<boolean> => {
    const cleaned = normalizeIsbn(code);
    setIsbn(cleaned);
    return lookupIsbn(cleaned);
  }, [setIsbn, lookupIsbn]);

  const setTitle = useCallback((value: string) => {
    setState((prev) => ({ ...prev, title: value, error: null, success: false }));
  }, []);

  const setAuthor = useCallback((value: string) => {
    setState((prev) => ({ ...prev, author: value, error: null, success: false }));
  }, []);

  const setCategory = useCallback((value: string) => {
    setState((prev) => ({ ...prev, category: value, error: null, success: false }));
  }, []);

  const setModality = useCallback((value: BookModality) => {
    setState((prev) => ({ ...prev, modality: value, price: value !== "sale" ? "" : prev.price, error: null, success: false }));
  }, []);

  const setPrice = useCallback((value: string) => {
    setState((prev) => ({ ...prev, price: value, error: null, success: false }));
  }, []);

  const setNeighborhood = useCallback((value: string) => {
    setState((prev) => ({ ...prev, neighborhood: value, error: null, success: false }));
  }, []);

  const setCondition = useCallback((value: BookCondition | null) => {
    setState((prev) => ({ ...prev, condition: value, error: null, success: false }));
  }, []);

  const setDescription = useCallback((value: string) => {
    setState((prev) => ({ ...prev, description: value, error: null, success: false }));
  }, []);

  const setPhotoUrl = useCallback((value: string) => {
    setState((prev) => ({ ...prev, photoUrl: value, error: null, success: false }));
  }, []);

  const addPhoto = useCallback((value: string) => {
    setState((prev) => {
      if (prev.photos.length >= 5) {
        return { ...prev, error: "O anúncio pode conter no máximo 5 fotos." };
      }
      return {
        ...prev,
        photos: [...prev.photos, value],
        error: null,
        success: false,
      };
    });
  }, []);

  const removePhoto = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      error: null,
      success: false,
    }));
  }, []);

  const clearDraft = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(CREATE_LISTING_DRAFT_KEY);
    } catch (err) {
      logger.warn("Falha ao limpar rascunho do anúncio no AsyncStorage", { error: String(err) });
    }
  }, [logger]);

  const saveDraft = useCallback(async (): Promise<void> => {
    try {
      const cur = stateRef.current;
      const draft: CreateListingDraft = {
        isbn: cur.isbn,
        title: cur.title,
        author: cur.author,
        category: cur.category,
        modality: cur.modality,
        price: cur.price,
        neighborhood: cur.neighborhood,
        condition: cur.condition,
        description: cur.description,
        photoUrl: cur.photoUrl,
        photos: cur.photos,
      };
      await AsyncStorage.setItem(CREATE_LISTING_DRAFT_KEY, JSON.stringify(draft));
    } catch (err) {
      logger.warn("Falha ao salvar rascunho do anúncio no AsyncStorage", { error: String(err) });
    }
  }, [logger]);

  const loadDraft = useCallback(async (): Promise<boolean> => {
    try {
      const raw = await AsyncStorage.getItem(CREATE_LISTING_DRAFT_KEY);
      if (!raw) {
        return false;
      }
      const draft = JSON.parse(raw) as Partial<CreateListingDraft>;
      if (!draft || typeof draft !== "object") {
        return false;
      }
      setState((prev) => ({
        ...prev,
        isbn: typeof draft.isbn === "string" ? draft.isbn : prev.isbn,
        title: typeof draft.title === "string" ? draft.title : prev.title,
        author: typeof draft.author === "string" ? draft.author : prev.author,
        category: typeof draft.category === "string" ? draft.category : prev.category,
        modality:
          draft.modality === "trade" || draft.modality === "donation" || draft.modality === "sale"
            ? draft.modality
            : prev.modality,
        price: typeof draft.price === "string" ? draft.price : prev.price,
        neighborhood: typeof draft.neighborhood === "string" ? draft.neighborhood : prev.neighborhood,
        condition: draft.condition !== undefined ? draft.condition : prev.condition,
        description: typeof draft.description === "string" ? draft.description : prev.description,
        photoUrl: typeof draft.photoUrl === "string" ? draft.photoUrl : prev.photoUrl,
        photos: Array.isArray(draft.photos) ? draft.photos : prev.photos,
      }));
      return true;
    } catch (err) {
      logger.warn("Falha ao carregar rascunho do anúncio do AsyncStorage", { error: String(err) });
      return false;
    }
  }, [logger]);

  const buildInput = useCallback((): CreateListingInput => {
    const cur = stateRef.current;
    const priceNum = cur.modality === "sale" && cur.price.trim()
      ? Number(cur.price.replace(",", "."))
      : undefined;
    return {
      title: cur.title,
      author: cur.author,
      ...(cur.category.trim() ? { category: cur.category.trim() } : {}),
      modality: cur.modality,
      price: priceNum,
      city: "Piripiri",
      state: "PI",
      ...(cur.neighborhood.trim() ? { neighborhood: cur.neighborhood.trim() } : {}),
      ...(cur.condition ? { condition: cur.condition } : {}),
      ...(cur.description.trim() ? { description: cur.description.trim() } : {}),
      ...(cur.photoUrl.trim() ? { photoUrl: cur.photoUrl.trim() } : {}),
      ...(cur.photos.length > 0 ? { photos: cur.photos } : {}),
    };
  }, []);

  const resumeDraft = useCallback((book: Book): void => {
    setState((prev) => ({
      ...prev,
      draftId: book.id,
      title: book.title ?? prev.title,
      author: book.author ?? prev.author,
      category: book.category ?? prev.category,
      modality: book.modality ?? prev.modality,
      price: book.price !== undefined ? String(book.price) : prev.price,
      neighborhood: book.neighborhood ?? prev.neighborhood,
      condition: book.condition ?? prev.condition,
      description: book.description ?? prev.description,
      photoUrl: book.photoUrl ?? prev.photoUrl,
      photos: book.photos ?? prev.photos,
    }));
  }, []);

  const saveForLater = useCallback(
    async (sessionUserId: string | null, step: number): Promise<boolean> => {
      if (!sessionUserId) {
        return false;
      }
      try {
        const saved = await useCases.saveDraft(
          { ...buildInput(), draftId: stateRef.current.draftId ?? undefined, draftStep: step },
          sessionUserId,
        );
        setState((prev) => ({ ...prev, draftId: saved.id }));
        return true;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof DomainError
            ? error.message
            : "Não foi possível salvar o rascunho. Tente novamente.",
        }));
        logger.error("Falha ao salvar rascunho do anúncio", error);
        return false;
      }
    },
    [buildInput, logger, useCases],
  );

  const loadServerDraft = useCallback(
    async (draftId: string): Promise<number | null> => {
      try {
        const book = await useCases.getBookById(draftId);
        if (book.status !== "draft") {
          return null;
        }
        resumeDraft(book);
        return book.draftStep ?? 1;
      } catch (error) {
        logger.error("Falha ao retomar rascunho do anúncio", error);
        return null;
      }
    },
    [logger, resumeDraft, useCases],
  );

  const submit = useCallback(
    async (sessionUserId: string | null): Promise<Book | null> => {
      const guard = guardFormSubmit(rateLimiter, formKey("listing:create", sessionUserId));
      if (!guard.allowed) {
        logger.warn("Publicação de anúncio bloqueada pelo limite de tentativas do cliente");
        setState((prev) => ({ ...prev, loading: false, error: guard.message, success: false }));
        return null;
      }
      setState((prev) => ({ ...prev, loading: true, error: null, success: false }));

      const input = buildInput();
      const draftId = stateRef.current.draftId;
      try {
        const book = draftId
          ? await useCases.publishDraft(draftId, input, sessionUserId)
          : await useCases.createListing(input, sessionUserId);
        await clearDraft();
        setState({ ...INITIAL_STATE, success: true });
        return book;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof DomainError ? error.message : GENERIC_ERROR,
        }));
        logger.error("Falha ao publicar anúncio", error);
        return null;
      }
    },
    [
      buildInput,
      clearDraft,
      logger,
      rateLimiter,
      useCases,
    ],
  );

  const reset = useCallback(() => {
    void clearDraft();
    setState(INITIAL_STATE);
  }, [clearDraft]);

  return [
    state,
    {
      setIsbn,
      lookupIsbn,
      handleBarcodeScanned,
      clearIsbnFeedback,
      setTitle,
      setAuthor,
      setCategory,
      setModality,
      setPrice,
      setNeighborhood,
      setCondition,
      setDescription,
      setPhotoUrl,
      addPhoto,
      removePhoto,
      saveDraft,
      loadDraft,
      clearDraft,
      saveForLater,
      resumeDraft,
      loadServerDraft,
      submit,
      reset,
    },
  ];
}
