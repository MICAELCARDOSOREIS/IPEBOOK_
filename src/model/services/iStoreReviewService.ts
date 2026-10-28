/** Pedido de avaliação do app na loja (Spec 105). O Android/iOS decidem se mostram e com que frequência. */
export interface IStoreReviewService {
  requestReview(): Promise<void>;
}
