# Especificação 065 — Alinhamento Visual do Perfil ao Figma 07.01

## 1. Visão Geral

Esta especificação estabelece o alinhamento visual e estrutural da tela **Meu perfil** (`src/view/profile/profileHub.tsx`) com o design canônico do Figma:
- `07.01 · Meu perfil` (nó `25:524`)

A tela centraliza a identidade do leitor em Piripiri, métricas comunitárias (publicações, trocas concluídas e média de avaliação), botão outline de edição e lista agrupada por seções semânticas (*"Atividade"* e *"Conta"*).

---

## 2. Requisitos de Usuário e Negócio

### RN-01: Cabeçalho Editorial "Meu perfil"
- A tela deve exibir no topo a manchete editorial `"Meu perfil"` na tipografia serifada da marca (`tokens.fontFamily.brand`, 34px, cor `tokens.colors.brandBrown` `#58331F`).
- Sendo destino raiz da barra de navegação ([ADR 0011](file:///home/usermicael/Projetos/IPEBOOK_/docs/adr/0011-navegacao-por-barra-inferior.md)), não possui botão de voltar.

### RN-02: Card de Identidade e Botão Outline "Editar perfil"
- O card de identidade deve adotar container suave (`colors.m3.surfaceContainer` / `#f7f3ec`, `borderRadius: 20`):
  - Avatar do usuário (monograma ou foto).
  - Nome em destaque com serifa da marca (`fontFamily.brand`, 24px, `onSurface`).
  - Linha de apoio com localização comunitária (ex: `"Centro, Piripiri"` ou `"Piripiri, PI"`).
- Logo abaixo do card de identidade, disponibilizar o botão outline proeminente `"Editar perfil"` no padrão M3 (borda sutil, cantos arredondados e alvo de toque acessível).

### RN-03: Painel de Métricas Comunitárias (Tríade M3)
- O perfil deve exibir 3 cards lado a lado com fundo `#f7f3ec`, altura 76px e cantos arredondados (16px):
  1. **Publicações:** total de livros anunciados pelo usuário (ex: `5`).
  2. **Trocas:** total de negociações finalizadas com sucesso (ex: `8`).
  3. **Avaliação:** média das avaliações recebidas da comunidade (ex: `4,9` ou `—`).

### RN-04: Lista Agrupada por Seções ("Atividade" e "Conta")
- Organizar as opções em blocos agrupados com cabeçalhos de seção em destaque verde (`tokens.colors.primary`):
  - **Atividade:**
    - `Avaliações recebidas` (com resumo da nota e quantidade de trocas).
    - `Favoritos e alertas` (livros salvos e alertas comunitários).
  - **Conta:**
    - `Segurança e verificação` (troca de senha / verificação de e-mail).
    - `Privacidade e dados` (download de dados e exclusão de conta).
    - `Pessoas bloqueadas` (gestão de bloqueios).
    - `Convidar amigos` (compartilhamento do aplicativo).
    - `Termos e privacidade` e `Ajuda`.
    - `Sair da conta` (ação com confirmação em modal seguro).
- Substituir chevrons em caractere de texto (`›`) pelo ícone canônico `chevronRight` de [`AppIcon`](file:///home/usermicael/Projetos/IPEBOOK_/src/view/components/AppIcon.tsx).

### RN-05: Seletor de Tema
- O seletor de preferências de aparência (`ThemePreferenceSelector`) deve permanecer integrado na seção de configurações da conta com acessibilidade total (ISO/IEC 25010).

---

## 3. Critérios de Aceite

1. O cabeçalho exibe `"Meu perfil"` com serifa da marca em `brandBrown`.
2. O card de identidade traz avatar, nome em serifa e botão outline `"Editar perfil"`.
3. A tríade de métricas exibe os contadores de publicações, trocas e avaliação média.
4. As seções *"Atividade"* e *"Conta"* agrupam os itens com cabeçalhos legíveis e chevrons padronizados.
5. O botão *"Sair da conta"* abre o modal de confirmação e encerra a sessão corretamente.
6. 100% dos testes unitários, de componente e integração passam na suíte (`npm test`).
