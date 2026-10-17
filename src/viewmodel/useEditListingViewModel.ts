import { useCallback, useEffect, useRef, useState } from "react";
import { bookUseCases } from "@/di/container";
import type { Book, BookModality } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";

export type EditListingState = {
  book: Book | null;
  title: string;
  author: string;
  category: string;
  modality: BookModality;
  price: string;
  neighborhood: string;
  photoUrl: string;
  photos: readonly string[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: boolean;
};

export type EditListingActions = {
  load: () => Promise<void>;
  setTitle: (value: string) => void;
  setAuthor: (value: string) => void;
  setCategory: (value: string) => void;
  setModality: (value: BookModality) => void;
  setPrice: (value: string) => void;
  setNeighborhood: (value: string) => void;
  setPhotoUrl: (value: string) => void;
  addPhoto: (value: string) => void;
  removePhoto: (index: number) => void;
  submit: () => Promise<Book | null>;
};

const INITIAL_STATE: EditListingState = {
  book: null,
  title: "",
  author: "",
  category: "",
  modality: "sale",
  price: "",
  neighborhood: "",
  photoUrl: "",
  photos: [],
  loading: true,
  saving: false,
  error: null,
  success: false,
};

const GENERIC_ERROR = "Não foi possível atualizar o anúncio. Tente novamente.";

export function useEditListingViewModel(
  bookId: string,
  sessionUserId: string | null,
  useCases: IBookUseCases = bookUseCases,
): [EditListingState, EditListingActions] {
  const [state, setState] = useState<EditListingState>(INITIAL_STATE);
  const active = useRef(false);

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const book = await useCases.getBookById(bookId);
      if (sessionUserId && book.ownerId !== sessionUserId) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Você só pode editar seus próprios anúncios.",
        }));
        return;
      }
      if (book.status === "reserved") {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Não é possível editar anúncio com negociação aceita em andamento.",
        }));
        return;
      }

      setState({
        book,
        title: book.title,
        author: book.author,
        category: book.category ?? "",
        modality: book.modality,
        price: book.price !== undefined ? String(book.price) : "",
        neighborhood: book.neighborhood ?? "",
        photoUrl: book.photoUrl ?? "",
        photos: book.photos ?? [],
        loading: false,
        saving: false,
        error: null,
        success: false,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof DomainError
            ? error.message
            : "Não foi possível carregar o anúncio para edição.",
      }));
    }
  }, [bookId, sessionUserId, useCases]);

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
    setState((prev) => ({
      ...prev,
      modality: value,
      price: value !== "sale" ? "" : prev.price,
      error: null,
      success: false,
    }));
  }, []);

  const setPrice = useCallback((value: string) => {
    setState((prev) => ({ ...prev, price: value, error: null, success: false }));
  }, []);

  const setNeighborhood = useCallback((value: string) => {
    setState((prev) => ({ ...prev, neighborhood: value, error: null, success: false }));
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

  const submit = useCallback(async (): Promise<Book | null> => {
    setState((prev) => ({ ...prev, saving: true, error: null, success: false }));

    const priceNum =
      state.modality === "sale" && state.price.trim()
        ? Number(state.price.replace(",", "."))
        : undefined;

    try {
      const updated = await useCases.updateListing(
        bookId,
        {
          title: state.title,
          author: state.author,
          category: state.category.trim() || undefined,
          modality: state.modality,
          price: priceNum,
          neighborhood: state.neighborhood.trim() || undefined,
          photoUrl: state.photoUrl.trim() || undefined,
          photos: state.photos.length > 0 ? state.photos : undefined,
        },
        sessionUserId,
      );

      setState((prev) => ({
        ...prev,
        book: updated,
        saving: false,
        success: true,
      }));
      return updated;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        saving: false,
        error: error instanceof DomainError ? error.message : GENERIC_ERROR,
      }));
      return null;
    }
  }, [bookId, sessionUserId, state.title, state.author, state.category, state.modality, state.price, state.neighborhood, state.photoUrl, state.photos, useCases]);

  useEffect(() => {
    active.current = true;
    void load();
    return () => {
      active.current = false;
    };
  }, [load]);

  return [
    state,
    {
      load,
      setTitle,
      setAuthor,
      setCategory,
      setModality,
      setPrice,
      setNeighborhood,
      setPhotoUrl,
      addPhoto,
      removePhoto,
      submit,
    },
  ];
}
