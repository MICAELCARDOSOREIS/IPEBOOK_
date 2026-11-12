# Spec 063 — Conclusão de Negociação e Avaliação Mútua

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)  
**Data:** 23 de outubro de 2026  
**Issue:** #206  
**Telas no Figma:** `06.07 · Concluir negociação` (`27:1025`), `06.08 · Negociação concluída` (`27:1138`), `06.21 · Avaliar negociação` (`596:8314`), `06.22 · Avaliação enviada` (`596:8354`), `07.03 · Avaliações recebidas` (`145:2486`).  
**Depende de:** Spec 018 (perfil público e avaliações), Spec 052 (combinar encontro), Spec 061 (chat de negociação), ADR 0004 (design system), ADR 0019 (MVVM e componentes), ADR 0037 (encontros seguros), ADR 0044 (chat).

---

## 1. Problema

Após combinarem o encontro em um dos pontos seguros de Piripiri (Spec 052) e realizarem a entrega do livro, os participantes da negociação não tinham uma forma intuitiva dentro do app para registrar que o encontro foi realizado com sucesso e avaliar a contraparte. O Figma documenta um fluxo direto de conclusão com feedback de 1 a 5 estrelas (`06.21` e `06.22`), alimentando o histórico comunitário de confiança e reputação em Piripiri.

## 2. Usuários afetados

Todos os leitores de Piripiri que participam de uma negociação aceita (seja quem anunciou ou quem solicitou o livro).

## 3. Escopo

1. **Ação "Concluir e avaliar" na Negociação:**
   - Na tela da negociação aceita (`requestDetail.tsx`), disponibilizar o botão/ação para iniciar o encerramento da entrega.
2. **Modal / Diálogo de Avaliação (`06.21 · Avaliar negociação`):**
   - Apresentar o nome da contraparte e a indicação de avaliação da experiência.
   - Seletor de nota interativo de 1 a 5 estrelas com indicação semântica e acessível para leitores de tela (`accessibilityRole="radio"`, rótulos "1 estrela", "2 estrelas", ..., "5 estrelas").
   - Botão de envio "Enviar avaliação".
3. **Estado de Negociação Concluída e Avaliada (`06.08` e `06.22`):**
   - Feedback imediato de "Avaliação enviada com sucesso!".
   - Exibição de badge/banner permanente de negociação concluída indicando a nota atribuída pela pessoa autenticada.
   - O estado de conclusão da negociação na interface é determinado pela existência da avaliação registrada via `findByRequestAndRater` (mantendo o status do pedido em `v2_requests` como `accepted` sem mutações destrutivas na máquina de estados de empréstimos/trocas).
   - Prevenção de reenvio de avaliação no mesmo pedido (respeitando a restrição do banco `unique (rater_id, request_id)`).
4. **Camadas de Negócio e Repositório:**
   - Adicionar método `submitRating(sessionUserId, { requestId, ratedUserId, score })` no caso de uso de avaliações (`IRatingUseCases`).
   - Adicionar consulta `findByRequestAndRater(requestId, raterId)` em `IRatingDataSource` e implementações (`MemoryRatingDataSource` e `SupabaseRatingDataSource`) para recuperar o estado prévio da avaliação.
5. **Acessibilidade:**
   - Estados de foco, toque mínimo de 48dp nos botões de estrelas e alertas acessíveis `accessibilityLiveRegion="polite"`.

## 4. Fora do escopo

- Avaliação textual aberta com comentários longos (o Figma utiliza avaliação estrita por estrelas 1 a 5).
- Denúncias por não comparecimento (já cobertas pelo módulo de denúncias da Spec 017 / ADR 0017).

## 5. Regras de Negócio

- **RN-01 (Autorização Estrita):** Apenas os dois participantes legítimos de um pedido aceito (`accepted`) podem submeter avaliação.
- **RN-02 (Escala de Nota):** A nota deve ser um número inteiro entre 1 e 5.
- **RN-03 (Unicidade por Participante):** Cada participante pode avaliar o outro apenas uma vez por pedido. Tentativas subsequentes são impedidas pela regra de negócio e pela restrição `unique(rater_id, request_id)` no banco.
- **RN-04 (Autoavaliação Proibida):** Um usuário nunca pode avaliar a si próprio (`raterId !== ratedUserId`).

## 6. Critérios de Aceite

1. O usuário visualiza o botão de avaliação na negociação aceita.
2. O modal de avaliação exibe 5 estrelas selecionáveis de 1 a 5.
3. Ao submeter uma nota válida, a avaliação é persistida em `v2_ratings`.
4. A tela passa a exibir o estado de "Negociação concluída" e a nota atribuída.
5. Tentativas duplicadas ou notas inválidas são bloqueadas com mensagem clara.
6. 100% dos testes unitários e de componente passam, com 0 violações de arquitetura.
