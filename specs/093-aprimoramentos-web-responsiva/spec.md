# Spec 093 — Aprimoramentos da Experiência Web Responsiva e Desktop Largo

## Objetivo
Resolver todas as pendências identificadas na experiência Web desktop do Ipebook, alinhando a interface às especificações reais do canvas `APP · 30 · Web · Responsivo` do Figma.

## Comportamento Esperado

1. **Filtro de Conservação Completo (Explorar Web & Mobile)**:
   - `SearchConditionFilter` suporta todas as 4 condições do domínio (`new`, `good`, `marked`, `worn`: "Novo", "Bom estado", "Com marcas", "Desgastado") além de `"all"`.
   - `WebFilterSidebar` exibe as 4 opções de conservação com seleção direta (`CheckRow` ou chips contornados).
   - `FilterSheet` mobile passa a oferecer os 4 chips de condição.
   - `describeResults` e `activeFilters` refletem o nome da condição selecionada em vez de fixar em "Bom estado".

2. **Refinamento do Topo e Hero da Início Web Larga (`Home`)**:
   - Quando `wideWeb` for ativo (`width >= 960px`):
     - Os botões duplicados da barra de topo ("Entrar" e "Notificações") são suprimidos da página de conteúdo, pois o cabeçalho superior persistente (`WebHeader`) já contém a autenticação, perfil e central de notificações/conversas.
     - O hero ganha o bloco de destaque com números da comunidade de Piripiri (total de livros disponíveis no catálogo, contagem de bairros ativos e volume de doações).
     - Seletor de bairro permanece acessível e claro na interface.

3. **Banner de Incentivo na Estante Web (`MyListings`)**:
   - Na visualização larga (`05.01`), a Estante exibe um banner acolhedor de desapego e troca ("Tem livros parados na estante? Desapegue ou troque com outros leitores de Piripiri.") com chamada direta para "Anunciar livro".

4. **Redefinição de Senha e Telas de Acesso (`ResetPassword`)**:
   - A tela de nova senha (`/redefinir-senha`), link expirado e sucesso passa a ser renderizada dentro de `AuthShell`, garantindo que no desktop largo ela adote o painel da marca em duas colunas, exatamente como Entrar, Criar Conta e Esqueci a Senha.

## Validação
- `npm run check:numbering` e `npm run check:architecture` aprovados sem colisões ou violações.
- Testes unitários de filtros (`tests/unit/viewmodel/searchFilters.test.ts`), `WebFilterSidebar.test.tsx` e componentes atualizados.
- Verificação de renderização e rotas web com `npm run build:web`.
