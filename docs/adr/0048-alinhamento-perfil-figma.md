# ADR 0048 — Alinhamento Visual da Tela Meu Perfil ao Figma 07.01

- **Status:** Aceito
- **Data:** 23 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Decisores:** Time de Engenharia Ipebook
- **Contexto técnico:** Spec 065 (Alinhamento Visual do Perfil), Figma `07.01 · Meu perfil` (`25:524`).
- **Relacionado a:** ADR 0004 (Design System e Tokens), ADR 0007 (Serifa da Marca), ADR 0011 (Navegação por Barra Inferior), ADR 0019 (Componentes e MVVM), ADR 0036 (Tema Escuro), ADR 0047 (Alinhamento da Estante).

---

## Contexto

A tela de perfil (`src/view/profile/profileHub.tsx`) funciona como o centro de identidade e preferências do usuário no IpêBook. Na implementação anterior, os itens do menu eram apresentados em uma única lista vertical contínua, com o título em verde escuro em vez da cor marrom canônica da marca, o botão de edição como mero item de menu, e a ausência do painel de métricas de atividade comunitária destacado no Figma (`07.01 · Meu perfil`).

## Decisão

1. **Tipografia e Cabeçalho Canônico:**
   - Adotar o título editorial *"Meu perfil"* na fonte serifada da marca (`tokens.fontFamily.brand`, 34px) com a cor da marca `tokens.colors.brandBrown` (`#58331F`).

2. **Identidade e Ação de Edição M3:**
   - Utilizar container suave (`#f7f3ec` / `surfaceContainer`) com cantos arredondados (20px), avatar de destaque e serifa no nome do usuário.
   - Posicionar um botão outline proeminente *"Editar perfil"* logo abaixo do card de identidade, facilitando a atualização de foto, telefone e bairro em Piripiri.

3. **Painel de Métricas Comunitárias (Tríade M3):**
   - Disponibilizar três cartões horizontais de resumo:
     1. `publicações`: contagem de livros anunciados pelo usuário na comunidade.
     2. `trocas`: número de negociações finalizadas.
     3. `avaliação`: média das estrelas recebidas (ex: `4,9` ou `—`).

4. **Agrupamento Semântico em Seções ("Atividade" e "Conta"):**
   - Agrupar os itens da tela em duas seções com cabeçalhos distintos em `colors.primary`:
     - **Atividade:** Avaliações recebidas, Favoritos e alertas.
     - **Conta:** Segurança e verificação, Privacidade e dados, Pessoas bloqueadas, Convidar amigos, Ajuda e Termos.
   - Substituir chevrons de caracteres textuais por ícones semânticos vetoriais (`AppIcon name="chevronRight"`).
   - Manter a ação de logout destacada com diálogo de confirmação.

5. **Compatibilidade com Tema Escuro:**
   - Todas as cores utilizam os tokens dinâmicos via `useTheme()`, garantindo contraste AA no modo escuro.

## Consequências

- **Positivas:**
  - Paridade visual com a especificação de design `07.01` do Figma.
  - Reconhecimento imediato do leitor por suas contribuições comunitárias em Piripiri.
  - Navegação mais intuitiva e organizada entre atividades e preferências da conta.
- **Negativas / Limitações:**
  - Pequenos ajustes em testes de componente para refletir a nova estrutura de seções.
