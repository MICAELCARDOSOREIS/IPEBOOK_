# Spec 072 — Alinhamento global das telas Android ao Figma

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)
**Data:** 25 de outubro de 2026
**Telas no Figma:** canvas `APP · 10 · Android · Material 3` (137 telas, inventário em
[`design-system/telas-android-figma.md`](../../design-system/telas-android-figma.md)).
**Referências locais:** SVGs canônicos em `design-system/figma-exports/svgs/` e contexto de código em
`design-system/figma-exports/context/`.
**Depende de:** ADR 0004 (design system e tokens), ADR 0007 (serifa da marca), ADR 0011 (navegação),
ADR 0019 (componentes e MVVM), ADRs 0045–0054 (alinhamentos por tela), ADR 0055 (este alinhamento global).

---

## 1. Problema

As Specs 062, 064, 065, 066 e 069 alinharam Início, Estante, Perfil, Explorar e Encontros ao Figma,
mas as demais telas continuam com layout provisório. Exemplo verificado no Galaxy A16 via ADB: o
detalhe do livro (`03.01`) mostra capa sem ilustração, título sans-serif verde, preço `R$ 25.00`
com ponto decimal, sem barra de topo com favoritar/compartilhar e sem botão fixo
"Conversar sobre o livro".

## 2. Usuários afetados

Todas as pessoas que usam o app Android em Piripiri.

## 3. Escopo

Alinhar a apresentação visual de cada tela implementada à tela correspondente do Figma Android,
em grupos com arquivos disjuntos:

| Grupo | Telas Figma | Arquivos principais |
| --- | --- | --- |
| A · Acesso | 01.01–01.17 | `src/view/auth/{signIn,signUp,forgotPassword,resetPassword}.tsx`, `src/view/onboarding/welcome*.tsx` |
| B · Livro e comunidade | 03.01–03.06, 08.01–08.02, 09.02–09.05 | `src/view/listings/{bookDetail,photoGallery,publicProfile,reportListing*}.tsx`, `src/view/profile/blockedUsers.tsx` |
| C · Publicação | 04.01–04.21 | `src/view/listings/{createListing*,editListing*,manageListing*}.tsx` |
| D · Estante e negociação | 05.01–05.08, 06.01–06.22 | `src/view/listings/{myListings*,shelfRow}.tsx`, `src/view/requests/*` |
| E · Perfil e configurações | 07.01–07.23, 09.01, 09.06–09.07 | `src/view/profile/*` (exceto `blockedUsers`), `src/view/notifications/*`, `src/view/legal/*`, `src/view/help/*`, `src/view/auth/deleteAccount*.tsx` |
| F · Descoberta e estados | 02.01–02.16, 10.01–10.03, 11.01–11.05 | `src/view/home.tsx`, `src/view/search/*`, `src/view/favorites/*` |

Para cada tela: estrutura (barra de topo, manchete, seções, rodapé fixo), tipografia (serifa da
marca onde o Figma usa `Source Serif 4`), cores e raios via `tokens`, textos em português idênticos
ao Figma quando forem rótulos fixos, formatação monetária `R$ 25,00`, áreas de toque ≥ 48 dp.

## 4. Fora do escopo

- Telas iPhone e Web (ADR 0008).
- Novas regras de negócio, novos campos de dados ou mudanças de ViewModel/UseCase além de expor
  dados já existentes à View.
- Telas do Figma sem implementação no app (registradas como pendência na matriz do `tasks.md`).
- Tema escuro e fonte 130% (12.x): conferidos só por não quebrarem; ajuste fino fica para spec própria.

## 5. Critérios de aceite

1. Cada tela implementada dos grupos A–F tem estrutura, tipografia e textos fixos equivalentes ao
   PNG rasterizado do SVG canônico; divergências restantes ficam justificadas no `tasks.md`.
2. Nenhuma cor, fonte ou raio fora de `src/view/tokens.ts` é introduzido sem justificativa.
3. Preços aparecem no formato brasileiro (`R$ 25,00`) em todas as telas.
4. `bun run typecheck`, `bun run check:architecture`, `bun run check:numbering` e a suíte Vitest
   passam; testes só mudam quando o texto ou estrutura esperados mudaram por causa do Figma.
5. Validação visual no Galaxy A16 via ADB das telas principais de cada grupo.

## 6. Como será testado

- Testes de componente existentes (Vitest + Testing Library) por tela alterada, com novos
  testes para rótulos e formatação introduzidos.
- Typecheck, verificação de arquitetura e numeração.
- Captura `adb exec-out screencap` comparada ao PNG do Figma.

