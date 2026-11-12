# ADR 0046 — Conclusão de Negociação e Avaliação Mútua

- **Status:** Aceito
- **Data:** 23 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Decisores:** Time de Engenharia Ipebook
- **Contexto técnico:** Spec 063 (Conclusão e Avaliação da Negociação), Figma `06.07`, `06.08`, `06.21`, `06.22`.
- **Relacionado a:** ADR 0004 (Design System e Tokens), ADR 0018 (Avaliações Públicas), ADR 0019 (MVVM e Componentes), ADR 0037 (Encontros Seguros), ADR 0044 (Chat de Negociação).

---

## Contexto

A plataforma IpêBook viabiliza trocas, vendas e doações de livros presenciais em Piripiri, PI. O encontro seguro (Spec 052) e o chat interno (Spec 061) preparam o terreno para o momento do encontro físico. Uma vez realizado o encontro, é essencial que ambas as partes possam registrar formalmente a conclusão da negociação e expressar sua avaliação mútua (1 a 5 estrelas), alimentando o histórico de reputação comunitária (`07.03 · Avaliações recebidas`).

A tabela `v2_ratings` já existe no banco com restrição `unique(rater_id, request_id)` e política RLS que autoriza os participantes do pedido aceito a avaliar. No entanto, faltavam a interface de usuário dedicada no fluxo da negociação e os métodos no caso de uso para submissão direta e verificação de avaliação já realizada.

## Decisão

1. **Extensão do Repositório de Avaliações (`IRatingDataSource`):**
   - Introduzir o método `findByRequestAndRater(requestId: string, raterId: string): Promise<Rating | null>` para recuperar o estado prévio da avaliação e evitar reenvios desnecessários.
2. **Caso de Uso de Avaliação (`RatingUseCases`):**
   - Adicionar o método `submitRating(sessionUserId, { requestId, ratedUserId, score })` com validação de nota inteira (1 a 5), impossibilidade de autoavaliação (`raterId !== ratedUserId`) e checagem de unicidade.
   - Adicionar o método `getNegotiationRating(sessionUserId, requestId)` para recuperar a avaliação efetuada pelo participante logado.
3. **Componente de Avaliação (`NegotiationRatingModal`):**
   - Criar modal acessível com seletor de estrelas baseado no Design System e feedback instantâneo.
4. **Integração na Tela de Negociação (`requestDetail.tsx`):**
   - Renderizar botão "Concluir e avaliar" para participantes que ainda não avaliaram o pedido.
   - Renderizar banner "Negociação concluída" exibindo as estrelas concedidas quando o usuário já tiver submetido sua nota.

## Consequências

- **Positivas:**
  - Ciclo de negociação fechado de ponta a ponta: pedido → aceite → encontro combinado → chat → conclusão e avaliação.
  - Fortalecimento da segurança e da reputação comunitária em Piripiri.
  - Reutilização da infraestrutura e políticas RLS já validadas na tabela `v2_ratings`.
- **Negativas / Limitações:**
  - Uma vez enviada, a avaliação é imutável (não é permitido editar a nota).
