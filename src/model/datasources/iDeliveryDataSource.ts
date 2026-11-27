import type { Delivery, DeliveryCode } from "@/model/entities/delivery";

export interface IDeliveryDataSource {
  /** Entrega concluída da negociação; `null` enquanto não foi confirmada (Spec 095). */
  findByRequest(requestId: string): Promise<Delivery | null>;
  /** Gera um código novo de uso único, invalidando o anterior (RN-03). O servidor confere o papel. */
  createCode(requestId: string, actorId: string): Promise<DeliveryCode>;
  /** Confirma a entrega com o código mostrado pelo anunciante (RN-02 a RN-06). */
  complete(requestId: string, code: string, actorId: string): Promise<Delivery>;
  /** Assina conclusão de entrega em tempo real para a negociação. */
  subscribeToRequest?(requestId: string, onChange: () => void): () => void;
  /** Assina conclusões de entrega visíveis pela sessão atual (RLS). */
  subscribeToAll?(onChange: () => void): () => void;
}
