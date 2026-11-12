# Spec 114 — Melhorias de Usabilidade e Consistência em Combinar Encontro

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)  
**Data:** 2 de novembro de 2026  
**Issue:** #215 (Melhorias no fluxo de encontro)  
**Telas no Figma:** `06.04 · Combinar encontro` (`27:809`), `06.05 · Encontro combinado` (`27:921`), `06.13 · Reagendar encontro` (`370:6601`), Figma Web Desktop `06.04`.  
**Decisão Arquitetural Vinculada:** ADR 0088  
**Depende de:** Spec 052 (combinar encontro), Spec 069 (alinhamento visual Figma), Spec 094 (mapa Mapbox), Spec 113 (status card no chat).

---

## 1. Problema

A funcionalidade de combinar encontro presencial nos pontos públicos e seguros de Piripiri (`/negociacao/[id]/encontro`) apresenta quatro desalinhamentos em relação às práticas de IHC e à operação do mundo real:
1. **Comportamento no Desktop:** A tela mantém a mecânica de *bottom sheet* com gestos de toque móvel, esticando um painel de 1440px de largura com mouse drag.
2. **Conflito de Horários em Locais Fechados:** O app permite agendar em dias e horários fora do expediente do Campus IFPI e do Museu de Piripiri (que funcionam exclusivamente em dias úteis das 8h às 17h).
3. **Fricção no Chat:** No chat da negociação (`NegotiationStatusCard`), não há ação direta para recusar a data proposta e sugerir um novo horário ou reagendar o encontro confirmado sem sair da conversa.
4. **Prevenção de Erros:** O botão de submissão pode ser clicado antes de qualquer seleção, provocando mensagem de erro em vermelho em vez de comunicar visualmente o estado pendente.

---

## 2. Requisitos e Regras de Negócio

- **RN-01 (Horários por Local):**
  - **Campus IFPI** e **Museu de Piripiri**: disponíveis de segunda a sexta-feira, das 8h às 17h. Fins de semana e horários fora dessa faixa são desativados/invalidados.
  - **Praça da Bandeira** e **Praça de Eventos**: disponíveis diariamente, das 7h às 18h.
- **RN-02 (Validação do Domínio):**
  - `validateMeetingProposal` recusa proposta no IFPI ou Museu em sábados/domingos ou com hora < 8 ou > 17 com mensagem clara.
- **RN-03 (Layout Web Desktop):**
  - Quando `useIsWideWeb` for verdadeiro, o formulário é renderizado como painel lateral esquerdo com largura delimitada (480px a 540px) e o mapa ocupa a área restante à direita, sem gestos de arrasto ou redimensionamento móvel.
- **RN-04 (Ação no Chat):**
  - O `NegotiationStatusCard` oferece botão de ação para "Sugerir outro horário" quando o encontro estiver proposto pela contraparte e "Reagendar" quando o encontro estiver confirmado.
- **RN-05 (Prevenção de Cliques Inválidos):**
  - O botão de ação de envio fica desabilitado (`disabled={!summary.complete}`) enquanto faltar o local, dia ou horário.

---

## 3. Critérios de Aceite

1. **CA1 (Validação de Expediente):** Não é possível enviar convite para o Campus IFPI ou Museu de Piripiri em finais de semana ou fora do intervalo de 8h às 17h.
2. **CA2 (Slots Dinâmicos):** Ao selecionar o Campus IFPI ou Museu, os horários exibidos e disponíveis restringem-se ao intervalo das 8h às 17h; ao selecionar um sábado ou domingo, o app orienta a escolher um local com funcionamento diário.
3. **CA3 (Desktop em 2 Colunas):** Em janelas de 960px ou mais na Web, o mapa e o formulário ficam dispostos lado a lado, sem barra arrastável.
4. **CA4 (Reagendamento no Chat):** O cartão de negociação no chat exibe o botão "Sugerir outro horário" (encontro proposto) ou "Reagendar" (encontro confirmado) e direciona à tela de agendamento.
5. **CA5 (Botão com Estado Habilitado/Desabilitado):** O botão de envio permanece desabilitado até a seleção dos três campos obrigatórios.
6. **CA6 (Regressão e Cobertura):** Toda a suíte de testes passa com 100% de sucesso e cobertura ≥ 80%.
