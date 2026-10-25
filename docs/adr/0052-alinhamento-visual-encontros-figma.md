# ADR 0052 — Alinhamento Visual dos Encontros e Negociação ao Figma (06.04 e 06.05)

- **Status:** Aceito
- **Data:** 25 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Decisores:** Time de Engenharia Ipebook
- **Contexto técnico:** Spec 069 (Alinhamento Visual dos Encontros e Negociação ao Figma), Figma `06.04 · Combinar encontro`, `06.05 · Encontro combinado`, `06.13 · Reagendar encontro`.
- **Relacionado a:** ADR 0036 (Tema escuro tokens), ADR 0037 (Encontros da negociação), ADR 0045 (Alinhamento visual Home).

---

## Contexto

As telas de agendamento e exibição do encontro seguro da negociação presencial (`scheduleMeeting.tsx` e `meetingCard.tsx`) foram inicialmente desenvolvidas utilizando estilos e cores estáticos (`tokens.colors.*`), sem consumir a paleta dinâmica do `ThemeProvider` (`useTheme()`).

Além disso, os cartões dos 4 pontos de encontro seguros de Piripiri e os chips de seleção de dia e horário não possuíam o refinamento visual do Figma `06.04` (como caixas de ícones em `secondaryContainer`, tipografia com `fontFamily.semiBold` e bordas semânticas Material 3).

## Decisão

1. **Migração Dinâmica de Tema (`useTheme`):**
   - Refatorar `ScheduleMeeting` e `MeetingCard` para derivar seus estilos através de `createStyles(colors: ColorPalette)`, garantindo suporte automático e perfeito aos temas claro, escuro e de alto contraste.
2. **Refinamento dos Pontos Seguros de Piripiri (`06.04`):**
   - Utilizar container de ícone com cor de fundo `colors.m3.secondaryContainer` e ícone `place` em `colors.m3.onSecondaryContainer`.
   - Adicionar tipografia de sistema `fontFamily.semiBold` no nome do local e `fontFamily.regular` nas informações de horário recomendado.
   - Refinar o indicador de rádio button com cores Material 3 (`colors.m3.primary`).
3. **Refinamento dos Chips de Dia e Horário (`OptionChip`):**
   - Empregar tokens de chips selecionados (`colors.m3.secondaryContainer` / `colors.m3.onSecondaryContainer`), preservando o toque mínimo acessível de 48dp e o papel de acessibilidade `radio`.
4. **Refinamento do Card de Encontro em `MeetingCard` (`06.05`):**
   - Utilizar fundo `colors.m3.surfaceContainerLow` e contorno suave `colors.m3.outlineVariant`.

## Consequências

- **Positivas:**
  - Plena conformidade visual com o design canônico do Figma `06.04` e `06.05`.
  - Excelente legibilidade e suporte contínuo a tema escuro na negociação.
  - Zero alterações na regra de negócio ou nas tabelas do Supabase.
- **Negativas / Limitações:**
  - Nenhuma identificada.
