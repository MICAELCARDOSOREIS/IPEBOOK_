# ADR 0088 — Melhorias de Usabilidade, Consistência e Layout Web em Combinar Encontro

- **Status:** Aceito
- **Data:** 2026-11-02
- **Decisores:** Antigravity, Usuário Micael
- **Contexto técnico:** Spec 114, Spec 052, Spec 069, Spec 094, Spec 113, ADR 0037, ADR 0066, ADR 0072

## Contexto

A etapa de combinar encontro presencial nos pontos públicos e seguros de Piripiri (`/negociacao/[id]/encontro`) é o elo físico entre a conversa digital e a entrega do livro. Após o amadurecimento das funcionalidades de mapa interativo (ADR 0072) e do status card no chat (ADR 0087), foram identificadas quatro fricções relevantes de IHC e regras de negócio:

1. **Incompatibilidade de Layout em Desktop (Web Larga):**
   - A tela de combinar encontro foi estruturada como um *bottom sheet* com gestos de toque (`PanResponder`), cobrindo 60% da altura inferior e esticando em 100% da largura em monitores widescreen (1440px), o que forçava rolagem confinada e interação anti-ergonômica com ponteiro de mouse.
2. **Incoerência entre Ponto Selecionado e Horário de Funcionamento:**
   - A lista de horários oferecia 12 opções fixas (7h às 18h) em todos os dias para qualquer local. Contudo, locais oficiais como o **Campus IFPI** e o **Museu de Piripiri** operam apenas em dias úteis das 8h às 17h, permitindo marcar encontros quando o local está trancado.
3. **Ausência de Atalho para Reagendamento no Chat:**
   - No chat (`NegotiationStatusCard`), quando a outra pessoa propunha um encontro, o receptor só podia "Confirmar", sem opção direta de "Sugerir outro horário" ou "Reagendar" pelo próprio card.
4. **Submissão Incompleta e Feedback Silencioso:**
   - O botão principal permanecia habilitado antes do preenchimento completo, disparando alertas de erro ao toque, e o retorno da tela ocorria por `backOnce()` silencioso.

## Decisão

1. **Layout Responsivo Web Desktop em 2 Colunas (`useIsWideWeb`):**
   - Em telas largas (desktop), eliminar o comportamento de bottom sheet arrastável. Apresentar um painel lateral esquerdo diagramado (largura confortável de 480px a 540px) com o formulário em fluxo contínuo e o mapa Mapbox ocupando o restante da tela à direita.
2. **Compatibilização de Horários e Dias com os Pontos Seguros:**
   - Enriquecer as regras de validação e a geração de opções de horário e dias (`meetingValidator.ts` e `useScheduleMeetingViewModel.ts`) para respeitar o funcionamento de cada local:
     - IFPI e Museu de Piripiri: dias úteis (segunda a sexta) e horários de 8h às 17h.
     - Praça da Bandeira e Praça de Eventos: diariamente, das 7h às 18h.
   - Ajustar automaticamente a seleção caso o usuário mude para um local com horário mais restrito.
3. **Prevenção de Submissão Prematura:**
   - Vincular a propriedade `disabled` do botão principal à conclusão de todos os campos (`disabled={!summary.complete}`), mantendo o feedback de suporte acessível.
4. **Ações de Reagendamento e Nova Sugestão no Chat:**
   - Adicionar botões secundários ("Sugerir outro horário" e "Reagendar") no `NegotiationStatusCard` do chat, permitindo transicionar para a tela de agendamento em um único toque.

## Consequências

- **Positivas:**
  - Experiência desktop fluida e profissional em paridade com o padrão do Figma Web.
  - Eliminação de encontros marcados fora do expediente dos locais fechados de Piripiri.
  - Redução de fricção no chat: contrapropostas de horário podem ser feitas diretamente.
- **Negativas / Mitigações:**
  - Exigência de testes cobrindo a matriz de horários permitidos por ponto e a alternância de breakpoints no layout.
