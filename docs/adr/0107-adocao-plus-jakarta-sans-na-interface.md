# ADR 0107 — Adoção da Plus Jakarta Sans na Interface do IpêBook

- **Status:** Aceito
- **Data:** 11 de novembro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Decisores:** Time de Engenharia e Design Ipebook
- **Contexto técnico:** Evolução tipográfica e alinhamento do Design System com a identidade acolhedora e literária do app.
- **Relacionado a:** ADR 0004 (Design System e Tokens), ADR 0007 (Serifa da Marca: Source Serif 4 Bold), ADR 0009 (Design Kit Tokens), ADR 0084 (Material 3 Expressive).

---

## Contexto

O IpêBook é uma plataforma hiperlocal em Piripiri (PI) focada em circulação comunitária de livros físicos, leitura, afeto e encontros humanos seguros em praças públicas.

Até o momento, o sistema utilizava a fonte **Roboto** para a interface e **Source Serif 4 Bold** para a marca (ADR 0007). Embora a Roboto oferecesse boa legibilidade técnica, seu desenho criado em 2011 trazia uma estética excessivamente utilitária, rígida e fria, destoando da elegância clássica e do acolhimento da Source Serif 4.

Após análise tipográfica das necessidades do produto (proposta comunitária, calor humano, amor aos livros e modernidade mobile), foi identificada a oportunidade de adotar uma sem-serifa geométrica com proporções humanistas.

## Decisão

1. **Adoção da Família Plus Jakarta Sans para UI**:
   - Adotar a família **Plus Jakarta Sans** (Google Fonts / `@expo-google-fonts/plus-jakarta-sans`) para todos os textos de interface, botões, formulários, chips, modais e parágrafos.
   - Carregar e mapear os pesos estáticos canônicos:
     - `Regular (400)`: `PlusJakartaSans_400Regular` para textos de leitura, inputs e descrições.
     - `Medium (500)`: `PlusJakartaSans_500Medium` para rótulos de botões, tags, abas e chips.
     - `SemiBold (600)`: `PlusJakartaSans_600SemiBold` para títulos de seções, cabeçalhos de modais e títulos de cards.
2. **Preservação da Source Serif 4 Bold na Marca**:
   - Manter a `Source Serif 4 Bold` (`SourceSerif4_700Bold`) como a fonte de destaque poético, logotipo e manchetes editoriais, preservando o DNA de livraria e biblioteca comunitária.
3. **Atualização dos Tokens do Design System**:
   - Atualizar `fontFamily` em `src/view/tokens.ts` e o hook `useIpebookFonts` em `src/view/useIpebookFonts.ts`.

## Consequências

- **Positivas:**
  - Estética acolhedora, contemporânea e com personalidade editorial, harmonizando com a serifa da marca.
  - Excelente legibilidade em corpos pequenos (11px a 16px) em telas de smartphones.
  - Pacote oficial Expo (`@expo-google-fonts/plus-jakarta-sans`) com carregamento assíncrono otimizado e sem degradação de performance.
- **Negativas / Limitações:**
  - O arquivo do Figma deve ter os estilos de texto de interface atualizados para *Plus Jakarta Sans* para manter perfeita paridade visual com o aplicativo.
