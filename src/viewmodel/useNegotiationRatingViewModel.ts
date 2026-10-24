import { useCallback, useEffect, useState } from "react";
import type { Rating } from "@/model/entities/rating";
import { ratingUseCases } from "@/di/container";

export type NegotiationRatingState = {
  isLoading: boolean;
  isSubmitting: boolean;
  userRating: Rating | null;
  selectedScore: number;
  error: string | null;
  submitError: string | null;
  isSuccess: boolean;
};

export type NegotiationRatingActions = {
  setSelectedScore: (score: number) => void;
  submitRating: () => Promise<boolean>;
  reload: () => Promise<void>;
  resetFeedback: () => void;
};

/**
 * ViewModel para avaliação e conclusão da negociação (Spec 063 / ADR 0046).
 * Telas Figma 06.07, 06.08, 06.21 e 06.22.
 */
export function useNegotiationRatingViewModel(
  requestId: string,
  sessionUserId: string | null,
  ratedUserId: string,
  useCases = ratingUseCases,
): [NegotiationRatingState, NegotiationRatingActions] {
  const [userRating, setUserRating] = useState<Rating | null>(null);
  const [selectedScore, setSelectedScore] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const loadExistingRating = useCallback(async () => {
    if (!requestId || !sessionUserId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const rating = await useCases.getNegotiationRating(sessionUserId, requestId);
      setUserRating(rating);
      if (rating) {
        setSelectedScore(rating.score);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar avaliação.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [requestId, sessionUserId, useCases]);

  useEffect(() => {
    void loadExistingRating();
  }, [loadExistingRating]);

  const submitRating = useCallback(async (): Promise<boolean> => {
    if (!sessionUserId) {
      setSubmitError("Sessão obrigatória para enviar avaliação.");
      return false;
    }

    if (!ratedUserId) {
      setSubmitError("Participante a ser avaliado não identificado.");
      return false;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const created = await useCases.submitRating(sessionUserId, {
        requestId,
        ratedUserId,
        score: selectedScore,
      });
      setUserRating(created);
      setIsSuccess(true);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao registrar avaliação.";
      setSubmitError(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [requestId, sessionUserId, ratedUserId, selectedScore, useCases]);

  const resetFeedback = useCallback(() => {
    setSubmitError(null);
    setIsSuccess(false);
  }, []);

  return [
    {
      isLoading,
      isSubmitting,
      userRating,
      selectedScore,
      error,
      submitError,
      isSuccess,
    },
    {
      setSelectedScore,
      submitRating,
      reload: loadExistingRating,
      resetFeedback,
    },
  ];
}
