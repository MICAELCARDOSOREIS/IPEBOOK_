import { ValidationError } from "@/model/errors";

export type ValidateRatingParams = {
  requestId: string;
  raterId: string;
  ratedUserId: string;
  score: number;
};

export function validateRatingParams(params: ValidateRatingParams): void {
  if (!params.requestId || !params.requestId.trim()) {
    throw new ValidationError("Identificador da negociação é obrigatório.");
  }

  if (!params.raterId || !params.raterId.trim()) {
    throw new ValidationError("Identificador do avaliador é obrigatório.");
  }

  if (!params.ratedUserId || !params.ratedUserId.trim()) {
    throw new ValidationError("Identificador da pessoa avaliada é obrigatório.");
  }

  if (params.raterId === params.ratedUserId) {
    throw new ValidationError("Você não pode avaliar a si mesmo.");
  }

  if (!Number.isInteger(params.score) || params.score < 1 || params.score > 5) {
    throw new ValidationError("A nota deve ser um número inteiro de 1 a 5 estrelas.");
  }
}
