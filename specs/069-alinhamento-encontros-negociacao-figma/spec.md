# Spec 069 — Alinhamento Visual dos Encontros e Negociação ao Figma (06.04 e 06.05)

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)  
**Data:** 25 de outubro de 2026  
**Telas no Figma:** `06.04 · Combinar encontro` (`27:809`), `06.05 · Encontro combinado` (`27:950`), `06.13 · Reagendar encontro` (`370:6601`).  
**Depende de:** Spec 037 (pontos de encontro e mapa), Spec 052 (combinar encontro), Spec 054 (tema escuro tokens), Spec 061 (chat na negociação), ADR 0037 (encontros da negociação), ADR 0052 (alinhamento visual encontros Figma).

---

## 1. Problema

As telas de agendamento e exibição do encontro seguro da negociação presencial (`scheduleMeeting.tsx` e `meetingCard.tsx`) foram implementadas inicialmente com cores e estilos fixos (`tokens.colors.*`), sem consumir o hook dinâmico de tema `useTheme()`, e com espaçamentos e alinhamentos visuais que destoavam dos nós canônicos do Figma `06.04` e `06.05`.

Especificamente:
1. `ScheduleMeeting` utilizava `StyleSheet.create` com cores estáticas do tema claro, quebrando a fidelidade e o contraste no tema escuro (Spec 054);
2. Os cartões dos 4 pontos seguros de Piripiri (Praça de Eventos, Praça da Bandeira, Estação Ferroviária e Curva de Piripiri) não usavam os tokens de elevação e contorno do Material 3 (`outlineVariant`, `surfaceContainer`, `primary`);
3. Os chips de seleção de dia e horário não aproveitavam os tokens semânticos de chip selecionado (`selectedContainer`, `onSelectedContainer`), e o feedback de seleção utilizava borda crua de 2px;
4. No `meetingCard.tsx`, os estados de encontro ("Encontro combinado", "Aguardando confirmação", "Convite para encontro") não possuíam o acabamento estético em container card com suporte a tema dinâmico e alinhamento tipográfico `fontFamily.semiBold`.

## 2. Usuários Afetados

Todos os leitores da comunidade de Piripiri que estão em processo de negociação aceita e vão combinar ou visualizar o encontro presencial para entrega ou troca de livros nos pontos públicos da cidade.

## 3. Escopo

1. **Migração para Tema Dinâmico (`useTheme`):**
   - Atualização de `scheduleMeeting.tsx` e `meetingCard.tsx` para usar `createStyles(colors)` derivado de `useTheme()`.
2. **Polimento dos Cartões de Pontos Seguros (`06.04`):**
   - Box de ícone com background `colors.m3.secondaryContainer` e ícone `place` em `colors.m3.onSecondaryContainer`;
   - Nome do ponto em `fontFamily.semiBold` e `colors.m3.onSurface`;
   - Endereço e recomendação de horário em `colors.m3.onSurfaceVariant`;
   - Radio button acessível e estilizado conforme M3 (`colors.m3.primary`).
3. **Alinhamento dos Chips de Dia e Horário (`OptionChip`):**
   - Chips com raio `tokens.radius.full` ou `tokens.radius.small`, altura mínima acessível de 48dp, cores `colors.m3.surfaceContainerLow` quando inativo e `colors.m3.secondaryContainer` quando selecionado.
4. **Alinhamento do Card de Encontro em `meetingCard.tsx` (`06.05`):**
   - Card com borda sutil `colors.m3.outlineVariant` e fundo `colors.m3.surfaceContainerLow`;
   - Tipografia canônica para status e detalhes do encontro.
5. **Preservação Integral das Regras e Testes:**
   - 100% de compatibilidade com os testes de acessibilidade, rádio-grupos, reagendamento e confirmação existentes.

## 4. Fora do Escopo

- Alterações na tabela `v2_meetings` ou no contrato `IMeetingDataSource` (a persistência e RLS estão consolidadas).
- Modificação dos 4 pontos seguros de Piripiri (os locais oficiais são mantidos).

## 5. Critérios de Aceite

1. `ScheduleMeeting` adapta cores e contraste em tempo real nos modos claro e escuro via `useTheme()`.
2. Os cartões de seleção dos pontos seguros de Piripiri respeitam os tokens visuais do Figma `06.04`.
3. Os chips de data e horário utilizam tokens semânticos do Design System com área de toque mínima de 48dp.
4. `MeetingCard` exibe o resumo do encontro com design refinado do Figma `06.05`.
5. Todos os testes existentes e novos continuam passando com 100% de sucesso.
