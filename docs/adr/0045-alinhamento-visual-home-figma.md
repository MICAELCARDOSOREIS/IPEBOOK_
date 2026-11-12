# ADR 0045 — Alinhamento Visual da Tela Inicial (Home) ao Figma 02.01

- **Status:** Aceito
- **Data:** 23 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Decisores:** Time de Engenharia Ipebook
- **Contexto técnico:** Spec 062 (Alinhamento Visual da Home), Figma `02.01 · Início`, `02.02 · Explorar por seção`.
- **Relacionado a:** ADR 0004 (Design System e Tokens), ADR 0007 (Serifa da Marca), ADR 0011 (Navegação 3 destinos), ADR 0019 (Componentes e MVVM), ADR 0036 (Tema Escuro).

---

## Contexto

A tela inicial do IpêBook (`src/view/home.tsx`) foi inicialmente desenvolvida como um protótipo funcional para validar o carregamento de livros, a autenticação e, posteriormente, as seções destacadas da Spec 051 e a alternância de tema da Spec 054. No entanto, ela mantinha elementos provisórios (botões utilitários de desenvolvedor no cabeçalho) e não refletia a identidade visual e o fluxo de descoberta desenhados no Figma (`02.01 · Início`), que destaca a localização comunitária em Piripiri (bairro), a busca rápida integrada e uma manchete editorial convidativa.

## Decisão

1. **Alinhamento ao Figma 02.01:**
   - Adotar o layout canônico do Figma para a Home, composto por:
     1. Cabeçalho com seletor de bairro (`[ 📍 Centro ⌄ ]`) e atalho para notificações (`🔔`).
     2. Manchete editorial em fonte serifada da marca (`fontFamily.brand`): *"Encontre sua próxima história."* e subtítulo explicativo de impacto comunitário.
     3. Campo de busca integrado com navegação fluida para a tela de Pesquisa e chips rápidos de filtro por modalidade (`Todos`, `Venda`, `Troca`, `Doação`).
     4. Vitrine horizontal de livros *"Perto de você"* com capas ilustradas (`BookCover`), preço/modalidade, título e autor.
     5. Card de destaque comunitário *"Doações da semana"*.

2. **Preservação de Decisões Prévias:**
   - Mantém-se a barra de navegação com 3 destinos (`Início`, `Pesquisa`, `Perfil`) estabelecida no ADR 0011.
   - O suporte ao tema escuro (ADR 0036) é totalmente mantido: os tokens de cores adaptam-se dinamicamente via `useTheme()` com contraste rigoroso. O grupo de alternância manual (`testID="theme-toggle-radiogroup"`) permanece acessível na área de rodapé/preferências da tela.

3. **Arquitetura MVVM e Design System:**
   - A camada de apresentação (`src/view/home.tsx`) continua estritamente desacoplada de chamadas diretas de infraestrutura, consumindo apenas `useHomeViewModel`, `useAuthViewModel`, `useTheme` e os componentes reutilizáveis de `src/view/components/`.

## Consequências

- **Positivas:**
  - Paridade visual com o design do Figma.
  - Melhoria expressiva na experiência do usuário e na sensação de proximidade comunitária em Piripiri.
  - Eliminação de ruídos visuais de depuração na tela inicial.
- **Negativas / Limitações:**
  - Testes que verificavam literais antigos do cabeçalho de depuração precisam ser atualizados para a nova semântica da tela.
