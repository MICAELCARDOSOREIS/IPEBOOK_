import type { Delivery, DeliveryCode } from "@/model/entities/delivery";

export type DeliveryRole = "giver" | "receiver";

export interface IDeliveryUseCases {
  /** Entrega já concluída da negociação, ou `null` (Spec 095, CA7). */
  getDelivery(requestId: string, sessionUserId: string | null): Promise<Delivery | null>;
  /** Papel da pessoa na entrega: anunciante entrega, leitor recebe. */
  getRole(requestId: string, sessionUserId: string | null): Promise<DeliveryRole>;
  /** Anunciante gera o código do QR; exige encontro confirmado (RN-01, RN-02, RN-03). */
  generateCode(requestId: string, sessionUserId: string | null): Promise<DeliveryCode>;
  /** Leitor confirma a entrega pelo código lido ou digitado (RN-02 a RN-06). */
  confirmDelivery(requestId: string, code: string, sessionUserId: string | null): Promise<Delivery>;
}
