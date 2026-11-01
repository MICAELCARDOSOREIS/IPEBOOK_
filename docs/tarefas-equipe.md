# Tarefas para a equipe — participação real

> Cada tarefa abaixo é trabalho **genuíno e verificável**. Quem a assume commita no próprio nome,
> em uma branch `feat/...` derivada de `develop`, e abre PR para `develop` seguindo o
> `CONTRIBUTING.md`. Nada aqui é "commit fantasma" — é lacuna real do projeto hoje.
>
> **Antes de começar:** sincronize com `develop` (`git checkout develop && git pull origin develop`)
> e confira o estado atual do arquivo-alvo — parte dessa migração pode estar em andamento.

## Por que essas tarefas existem

O projeto ganhou o componente `ScreenContainer`
(`src/view/components/ScreenContainer.tsx`), que centraliza o padrão `SafeAreaView` + coluna
centralizada com `maxWidth` e padding lateral `space-4` (16 px). Várias telas ainda usam o bloco
manual (`SafeAreaView` + `ScrollView` + estilos `page`/`content` com `maxWidth` solto), o que é
inconsistente e propenso a erro. A migração é mecânica, segura e bem definida — ideal para
distribuir entre a equipe.

Padrão de referência já pronto: `src/view/home.tsx` e `src/view/onboarding/welcome.tsx` (ambas
já usam `ScreenContainer`). Leia essas duas antes de começar.

---

## Maria Clara Almeida Martins — @clarinhamartins

**Tarefa:** Migrar as telas de busca e descoberta para o `ScreenContainer`.

Arquivos-alvo (verifique o estado atual antes de iniciar):

- `src/view/search/search.tsx` — `maxWidth` 720, padding 16 → `ScreenContainer maxWidth={720}`
- `src/view/search/searchAlerts.tsx` — tem duas colunas (720 e 560); a externa vira `maxWidth={720}`,
  o estado vazio interno mantém `maxWidth` 560 via `contentStyle`
- `src/view/search/manageAlert.tsx` — três retornos `SafeAreaView` (loading, vazio, edição); os
  três passam a usar `ScreenContainer maxWidth={560}` (é tela de formulário/foco)
- `src/view/search/editAlert.tsx` — mesma estrutura de três retornos; `maxWidth={560}`

Critérios de aceite:

- Nenhuma tela-alvo usa mais `SafeAreaView`/`ScrollView` importados diretamente para o container
  de página (apenas `ScreenContainer`).
- `npm run typecheck` e `npm run check:architecture` passam.
- Os testes existentes dessas telas (`tests/`) continuam passando; se algum snapshot de layout
  quebrar por conta da mudança de padding, atualize o snapshot justificando no commit.

Como verificar: `npm run validate` verde.

---

## Antonio Carlos Gomes — @gomes738

**Tarefa:** Migrar as telas de perfil, requisição e perfil público para o `ScreenContainer`.

Arquivos-alvo (verifique o estado atual — `profile.tsx` pode estar em migração):

- `src/view/profile/profile.tsx` — `maxWidth` 720, padding 24 → alinhar para `space-4` (16)
  via `ScreenContainer maxWidth={720}`
- `src/view/profile/profileHub.tsx` — conferir se tem container próprio e migrar
- `src/view/requests/requestDetail.tsx` — `maxWidth` 720 → `ScreenContainer maxWidth={720}`
- `src/view/requests/scheduleMeeting.tsx` — `maxWidth` 560 (formulário/foco) → `ScreenContainer maxWidth={560}`
- `src/view/listings/publicProfile.tsx` — `maxWidth` 720, usa `edges={["top","left","right"]}`
  → preservar as `edges` no `ScreenContainer`

Critérios de aceite:

- Mesmos do bloco da Maria Clara para os arquivos desta tarefa.
- O `paddingHorizontal` final de todas as telas migradas é `space-4` (16 px), padrão do design
  system (`design-system/03-fundamentos.md`). Se alguma tela tinha 24 px e a mudança altera o
  layout, registre a justificativa no PR.

Como verificar: `npm run validate` verde.

---

## Eric Vinícius dos Santos Oliveira — @Eric2025gh

**Tarefa 1 — Cobertura de testes do `ScreenContainer`.**

Hoje `src/view/components/ScreenContainer.tsx` não tem teste dedicado. Criar
`tests/components/screenContainer.test.tsx` cobrindo:

- Renderiza `children` dentro da coluna centralizada.
- Respeita `maxWidth` (variantes 720 e 560), `paddingHorizontal`, `paddingTop`, `paddingBottom`.
- `scroll={false}` renderiza um `View` em vez de `ScrollView`.
- `overlay` é renderizado como irmão do conteúdo (dentro do `SafeAreaView`).
- `edges` repassado ao `SafeAreaView`.
- Fundo da página é `colors.surface` do tema.

Critério de aceite: cobertura do componente ≥ 90%; `npm run test:coverage` verde.

**Tarefa 2 — Verificar acessibilidade da trava de orientação.**

Confirmar (em dispositivo/emulador Android) que o app permanece em retrato ao girar o aparelho,
e que a trava em runtime (`expo-screen-orientation` em `src/app/_layout.tsx`) não gera erro em
emuladores sem suporte (o `catch` ignora silenciosamente). Registrar o resultado (passou/falhou
+ ambiente) no PR.

---

## Notas

- A divisão acima é uma sugestão de distribuição; quem prefere trocar de bloco com um colega,
  combinem entre vocês — o que importa é cada tarefa ter um dono e ser commitada no nome de quem
  de fato a fez.
- Se surgir dúvida sobre o comportamento esperado de uma tela ao migrar, consulte a tela
  correspondente no Figma (links em `design-system/telas-android-figma.md`) e o
  `design-system/03-fundamentos.md`, seção "Orientação e layout responsivo".
- O responsável geral do design system (Micael) revisa mudanças de layout antes de integrar em
  `develop` (ver `design-system/README.md`, seção 7).
