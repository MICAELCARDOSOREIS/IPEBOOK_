# Spec 062 — Alinhamento Visual da Tela Inicial (Home) ao Figma 02.01

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)  
**Data:** 23 de outubro de 2026  
**Issue:** #205  
**Telas no Figma:** `02.01 · Início` (`9:525`), `02.02 · Explorar por seção` (`10:2`), `01.17 · Seu bairro` (`424:25143`).  
**Depende de:** Spec 030, Spec 051 (seções destacadas), Spec 054 (tema escuro), ADR 0004 (design system), ADR 0007 (serifa da marca), ADR 0011 (3 destinos da barra), ADR 0036 (tema escuro).

---

## 1. Problema

A tela inicial atual (`src/view/home.tsx`) foi construída em estágios incrementais anteriores e acumulou elementos provisórios de desenvolvimento (como botões soltos de desenvolvedor e seletores brutos no topo). Ela divergia da experiência visual canônica documentada no Figma (`02.01 · Início`), que apresenta:
- Um cabeçalho limpo com seletor de bairro em Piripiri e atalho para notificações;
- Manchete editorial serifada de boas-vindas ("Encontre sua próxima história.");
- Campo de pesquisa e chips rápidos de filtro por modalidade integrados na Home;
- Vitrine destacada "Perto de você" com cartões ilustrativos e banner comunitário de "Doações da semana".

## 2. Usuários afetados

Todos os leitores e membros da comunidade de Piripiri que abrem o IpêBook para descobrir livros, explorar doações e buscar títulos perto de sua vizinhança.

## 3. Escopo

1. **Cabeçalho Superior Integrado:**
   - Seletor de localização no canto esquerdo em formato de pílula (`[ 📍 Centro ⌄ ]`), exibindo o bairro ativo ou padrão e acionando a escolha de bairro.
   - Botão de notificações (`🔔`) no canto direito com navegação para a tela de notificações (`/notificacoes`).
2. **Manchete Editorial de Descoberta (Hero):**
   - Título principal em fonte serifada da marca (`fontFamily.brand`): `"Encontre sua próxima história."`.
   - Subtítulo convidativo: `"Compre, troque ou receba livros de quem mora perto de você."`.
3. **Barra de Pesquisa e Chips de Filtro:**
   - Campo de busca com ícone de lupa (`🔍`) e placeholder `"Buscar título, autor ou categoria"`. Ao submeter ou pressionar, navega para a Pesquisa.
   - Filtros rápidos em chips horizontais: `Todos` (marcado por padrão com check), `Venda`, `Troca` e `Doação`.
4. **Vitrine "Perto de você" e Carrossel:**
   - Seção intitulada `"Perto de você"` com atalho `"Ver todos"` que navega para o catálogo completo.
   - Carrossel horizontal de cartões com capas ilustradas via `BookCover`, identificação de modalidade e valor (`Venda · R$ 25,00`, `Troca`, `Doação`), título e autor.
5. **Destaque Comunitário ("Doações da semana"):**
   - Card de destaque com ícone de fita/marcador (`🔖`), título `"Doações da semana"`, subtítulo contextualizado para Piripiri e seta de navegação (`>`).
6. **Preservação de Acessibilidade e Controles de Tema:**
   - Manter compatibilidade com `testID="theme-toggle-radiogroup"` e leitores de tela em área dedicada/rodapé, garantindo que os testes existentes da Spec 054 e ISO/IEC 25010 continuem 100% íntegros.

## 4. Fora do escopo

- Alterar a barra de navegação inferior global (mantém-se 3 destinos conforme ADR 0011).
- Integração com GPS em tempo real (o bairro é selecionado entre os bairros oficiais de Piripiri, conforme Spec 044).

## 5. Regras de Negócio

- **RN-01 (Bairro Padrão / Ativo):** O cabeçalho exibe o bairro selecionado nas preferências do usuário ou o padrão da comunidade (`Centro`), permitindo troca rápida.
- **RN-02 (Chips de Filtro):** Tocar em um chip filtra localmente a lista da Home e, ao navegar para a Pesquisa via campo de busca ou "Ver todos", repassa a modalidade selecionada como parâmetro.
- **RN-03 (Consumo Estrito de Tokens):** Nenhuma cor, margem ou raio literal — todos os estilos devem derivar de `tokens.ts` e adaptar-se ao tema claro/escuro via `useTheme()`.
- **RN-04 (Compatibilidade com Catálogo Vazio):** Se não houver livros cadastrados, exibe o estado vazio amigável com orientação para a comunidade.

## 6. Critérios de Aceite

1. O cabeçalho exibe o seletor de bairro e o sino de notificações.
2. A manchete principal exibe "Encontre sua próxima história." com a tipografia serifada da marca.
3. O campo de busca e os chips de modalidade estão presentes e funcionais.
4. O carrossel "Perto de você" e o card "Doações da semana" são renderizados.
5. Acessibilidade preservada para leitores de tela (`accessibilityRole="header"`, `accessibilityRole="button"`, labels semânticos).
6. 100% dos testes da suíte passam (`npm test`, `check:architecture`, `check:numbering`).
