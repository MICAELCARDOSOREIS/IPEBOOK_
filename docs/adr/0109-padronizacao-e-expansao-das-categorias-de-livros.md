# 0109. Padronização e Expansão das Categorias de Livros no IpêBook

- **Status:** Aceito
- **Data:** 2026-11-12
- **Contexto:** IHC / Catálogo / Publicação / Busca / Perfil Comunitário de Piripiri
- **Decisores:** Equipe IpêBook

## Contexto

O IpêBook é a plataforma comunitária de circulação, compra, venda e doação de livros de Piripiri, PI. O público leitor da cidade é fortemente composto por estudantes da rede de ensino fundamental e médio, alunos de cursos preparatórios para o ENEM e vestibulares, concurseiros e acadêmicos de instituições de ensino superior e técnico presentes no município (IFPI Piripiri, UESPI - Campus Prof. Antônio Giovanne Alves de Sousa, Faculdade Chrisfapi, polos EAD e escolas estaduais/municipais).

Anteriormente:
1. As categorias de livros estavam limitadas a apenas 5 opções genéricas: `["Literatura", "Infantil", "Didático", "Romance", "Outros"]`.
2. A lista estava duplicada no código de interface (`createListingStep3.tsx` e `editListing.tsx`), sem uma fonte canônica no domínio de entidades (`src/model/entities/book.ts`).
3. Materiais de altíssima rotatividade em Piripiri — como apostilas do ENEM, livros de concurso, manuais universitários de Direito/Saúde/Tecnologia, mangás e desenvolvimento pessoal — não tinham categoria própria e acabavam relegados a "Outros" ou "Didático", prejudicando a busca e a descoberta de exemplares.

## Decisão

1. **Centralização Canônica no Domínio:**
   - Criada a constante canônica `BOOK_CATEGORIES` e o tipo `BookCategory` em `src/model/entities/book.ts`, eliminando listas literais espalhadas pelas telas.
   - Sincronizadas as telas de publicação (`createListingStep3.tsx`), edição (`editListing.tsx`) e modelo de busca (`useSearchViewModel.ts`) para consumir essa fonte única de verdade.

2. **Conjunto Canônico de 6 Macro-Categorias (IHC e Usabilidade):**

A divisão inicial em mais de 10 categorias gerou sobrecarga cognitiva no seletor de filtros móvel (paralisia de escolha / Lei de Hick), empurrando os controles inferiores para fora da primeira dobra de visualização. Optou-se por consolidar em **6 macro-categorias coesas e compactas**:

| Macro-Categoria | Abrangência e Adequação Comunitária |
| :--- | :--- |
| **Didáticos & Concursos** | Livros didáticos escolares do fundamental/médio, gramáticas, apostilas de cursinho, materiais do ENEM e preparatórios para concursos públicos. Altíssima rotação e desapego rápido em Piripiri. |
| **Universitário & Técnico** | Obras acadêmicas e técnicas (Direito, Enfermagem, Pedagogia, T.I./Computação, Administração, Ciências Exatas e Saúde), atendendo a comunidade do IFPI, UESPI e Chrisfapi. |
| **Literatura & Romance** | Clássicos universais, literatura brasileira, poesia, romances contemporâneos, de época e ficção em geral. |
| **Infantil & Quadrinhos** | Livros ilustrados para primeiras leituras, literatura infantojuvenil, contos de fadas, gibis, graphic novels e mangás. |
| **Desenvolvimento & Espiritualidade** | Livros de autoajuda, finanças práticas, produtividade, inteligência emocional, bíblias de estudo, teologia e reflexões devocionais. |
| **Outros** | Biografias, história, memórias, manuais e obras multidisciplinares que fujam aos gêneros anteriores. |

3. **Mapeamento Inteligente e Compatibilidade (`matchesCategory`):**
   - Na busca, a função pura `matchesCategory` mapeia termos legados e subgêneros cadastrados no banco para a sua respectiva macro-categoria (ex.: filtrar por *"Literatura & Romance"* localiza livros cadastrados com *"Literatura"*, *"Literatura Brasileira"*, *"Romance"* ou *"Ficção"*).
   - Se um anúncio recuperado possuir uma categoria customizada ou legada, as telas de cadastro e edição preservam o valor existente adicionando-o dinamicamente aos chips visíveis (`displayedCategories`), evitando que o autor perca a categoria ao salvar.
   - O gerador de paletas `categoryTone()` atribui deterministicamente tons pastel contrastantes tanto no tema claro quanto no escuro para cada categoria.

## Consequências

### Positivas
- Filtros de pesquisa muito mais precisos para os estudantes e concurseiros de Piripiri.
- Eliminação de código duplicado e prevenção de inconsistências entre criação e edição.
- Compatibilidade total com o esquema de banco Supabase (`category text check (char_length <= 60)`), sem demandar migrações estruturais ou risco de regressão.

### Mitigações
- A lista de 12 categorias foi balanceada para não gerar sobrecarga de opções. Na interface, os chips utilizam disposição em grade flexível com `gap: 8`, permitindo seleção ágil sem exigir rolagem excessiva.
