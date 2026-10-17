import { useCallback, useState } from "react";
import { bookUseCases } from "@/di/container";
import type { Book, BookModality } from "@/model/entities/book";
import { DomainError } from "@/model/errors";
import type { IBookUseCases } from "@/usecase/iBookUseCases";

export type CreateListingState = {
  title: string;
  author: string;
  category: string;
  modality: BookModality;
  price: string;
  neighborhood: string;
  loading: boolean;
  error: string | null;
  success: boolean;
};

export type CreateListingActions = {
  setTitle: (value: string) => void;
  setAuthor: (value: string) => void;
  setCategory: (value: string) => void;
  setModality: (value: BookModality) => void;
  setPrice: (value: string) => void;
  setNeighborhood: (value: string) => void;
  submit: (sessionUserId: string | null) => Promise<Book | null>;
  reset: () => void;
};

const INITIAL_STATE: CreateListingState = {
  title: "",
  author: "",
  category: "",
  modality: "sale",
  price: "",
  neighborhood: "",
  loading: false,
  error: null,
  success: false,
};

const GENERIC_ERROR = "Não foi possível cadastrar o anúncio. Tente novamente.";

export function useCreateListingViewModel(
  useCases: IBookUseCases = bookUseCases,
): [CreateListingState, CreateListingActions] {
  const [state, setState] = useState<CreateListingState>(INITIAL_STATE);

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

  const submit = useCallback(
    async (sessionUserId: string | null): Promise<Book | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null, success: false }));

      const priceNum = state.modality === "sale" && state.price.trim()
        ? Number(state.price.replace(",", "."))
        : undefined;

      try {
        const book = await useCases.createListing(
          {
            title: state.title,
            author: state.author,
            ...(state.category.trim() ? { category: state.category.trim() } : {}),
            modality: state.modality,
            price: priceNum,
            city: "Piripiri",
            state: "PI",
            ...(state.neighborhood.trim() ? { neighborhood: state.neighborhood.trim() } : {}),
          },
          sessionUserId,
        );
        setState({ ...INITIAL_STATE, success: true });
        return book;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof DomainError ? error.message : GENERIC_ERROR,
        }));
        return null;
      }
    },
    [state.title, state.author, state.category, state.modality, state.price, state.neighborhood, useCases],
  );

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return [state, { setTitle, setAuthor, setCategory, setModality, setPrice, setNeighborhood, submit, reset }];
}
