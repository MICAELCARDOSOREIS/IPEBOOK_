# Especificação 065 — Alinhamento Visual do Perfil ao Figma 07.01

## 1. Visão Geral

Esta especificação estabelece o alinhamento visual e estrutural da tela **Meu perfil** (`src/view/profile/profileHub.tsx`) com o design canônico do Figma:
- `07.01 · Meu perfil` (nó `25:524`)

A tela centraliza a identidade do leitor em Piripiri, métricas comunitárias (publicações, trocas concluídas e média de avaliação), botão outline de edição e lista agrupada por seções semânticas (*"Atividade"* e *"Conta"*).

> **Atualização visual (31 de outubro de 2026):** o topo segue o modelo de perfil social enviado pelo usuário: nome e identificação em destaque, avatar à direita e métricas em uma faixa horizontal. Os atalhos permanecem restritos às funções próprias do IpêBook.

---

## 2. Requisitos de Usuário e Negócio

### RN-01: Cabeçalho Editorial "Meu perfil"
- A tela deve exibir no topo o título `"Meu perfil"` na tipografia serifada da marca (`tokens.fontFamily.brand`, 24px, cor `tokens.colors.brandBrown` `#58331F`).
- Sendo destino raiz da barra de navegação ([ADR 0011](../../docs/adr/0011-navegacao-tres-destinos.md)), não possui botão de voltar.

### RN-02: Identidade e ação de edição
- Exibir o nome em destaque à esquerda e o avatar circular à direita.
- Abaixo do nome, exibir o Instagram quando cadastrado; quando estiver ausente, oferecer o atalho `"Adicionar Instagram"` para a edição do perfil.
- Exibir o bairro escolhido ou `"Piripiri, PI"` como localização de apoio.
- Manter `"Editar perfil"` como ação própria do IpêBook, com alvo de toque acessível.

### RN-03: Métricas Comunitárias em faixa
- Exibir três métricas lado a lado, sem cartões individuais, com números em destaque e rótulos abaixo:
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
- Substituir chevrons em caractere de texto (`›`) pelo ícone canônico `chevronRight` de [`AppIcon`](../../src/view/components/AppIcon.tsx).

### RN-05: Seletor de Tema
- O seletor de preferências de aparência (`ThemePreferenceSelector`) deve permanecer integrado na seção de configurações da conta com acessibilidade total (ISO/IEC 25010).

---

## 3. Critérios de Aceite

1. O cabeçalho exibe `"Meu perfil"` com serifa da marca em `brandBrown`, abaixo do nome do leitor em destaque.
2. O cabeçalho de identidade traz nome, avatar, identificação social ou atalho para adicioná-la e localização.
3. As métricas em faixa exibem publicações, trocas e avaliação média.
4. As seções *"Atividade"* e *"Conta"* agrupam os itens com cabeçalhos legíveis e chevrons padronizados.
5. O botão *"Sair da conta"* abre o modal de confirmação e encerra a sessão corretamente.
6. 100% dos testes unitários, de componente e integração passam na suíte (`npm test`).
