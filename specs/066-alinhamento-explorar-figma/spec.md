# Spec 066 — Alinhamento Visual da Tela Explorar (Pesquisa) ao Figma 02.02

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)  
**Data:** 23 de outubro de 2026  
**Issue:** #207  
**Telas no Figma:** `02.02 · Explorar / Pesquisa` (`10:2`).  
**Depende de:** Spec 006 (busca de livros), Spec 028 (filtros de categoria e preço), ADR 0004 (design system), ADR 0007 (serifa da marca), ADR 0011 (navegação), ADR 0045 (alinhamento da Home), ADR 0049 (alinhamento do Explorar).

---

## 1. Problema

A tela de exploração e busca (`src/view/search/search.tsx`) acumulou elementos provisórios e divergia do design canônico do Figma `02.02 · Explorar` (`10:2`):
- O topo não apresentava a pílula de localização do bairro (`Centro ⌄`);
- O botão de filtros avançados (`tune`) estava disputando a mesma linha com o título da tela e com o botão de limpar filtros;
- O título *"O que vamos ler hoje?"* utilizava tipografia genérica sans-serif sem a serifa editorial da marca (`Source Serif 4`);
- O campo de busca não possuía o ícone de lupa (*leading icon*);
- As categorias rápidas quebravam em linhas em vez de rolar horizontalmente de forma limpa;
- Os livros encontrados eram exibidos em linhas simples com borda inferior, em vez de cartões de superfície contidos com cantos arredondados (16px), título em serifa e coluna de ações dedicadas.

## 2. Usuários afetados

Todos os leitores de Piripiri que navegam pela aba **Explorar** para buscar livros por título, autor, modalidade ou categoria.

## 3. Escopo

1. **Barra Superior de Bairro e Filtros:**
   - Exibir a pílula de localização no canto superior esquerdo (`[ 📍 Centro ⌄ ]`), respeitando o bairro padrão/selecionado em Piripiri.
   - Posicionar o botão de filtros (`tune`) no canto superior direito com toque mínimo de 48dp e destaque visual ativo quando os filtros avançados estiverem abertos.
   - Exibir ação de "Limpar filtros" quando houver filtros aplicados.
2. **Manchete Editorial:**
   - Título serifado da marca: *"O que vamos\nler hoje?"* (`tokens.fontFamily.brand`, 34px, altura de linha 41px).
   - Subtítulo: *"Livros novos e seminovos para trocar, comprar ou receber aqui perto."*.
3. **Campo de Busca e Categorias Rápidas:**
   - `SearchField` com ícone de lupa Material 3 integrado à esquerda e botão de limpar campo.
   - Chips rápidos de categorias ("Todos", "Ficção", "Não ficção", "Infantil", "Didático") em carrossel horizontal (`ScrollView` horizontal).
4. **Cartões de Livros Confinados (`card`):**
   - Cartões com fundo de superfície (`colors.surface`), borda sutil (`colors.m3.outlineVariant`), cantos arredondados de 16px e sombra suave.
   - Capa miniatura, título em serifa (`fontFamily.brand`, 19px), autor em texto secundário, tag de modalidade, preço e coluna com botão de favoritar e chevron para detalhe.
5. **Acessibilidade:**
   - Área de toque mínima de 48dp preservada em todos os botões e chips.
   - Rótulos semânticos e compatibilidade total com leitores de tela.

## 4. Fora do escopo

- Alterações nas regras de negócio do ViewModel de busca (`useSearchViewModel`).
- Alterações nos contratos de banco ou consultas Supabase.

## 5. Regras de Negócio

- **RN-01 (Bairro):** O cabeçalho da pesquisa exibe o bairro atual selecionado (padrão `"Centro"`), mantendo harmonia com a Home.
- **RN-02 (Filtros Avançados):** Tocar no botão `tune` alterna a exibição dos filtros avançados (modalidade, categorias completas, faixa de preço e ordenação).
- **RN-03 (Consumo de Tokens):** Todas as medidas e cores derivam exclusivamente de `tokens.ts` e de `useTheme()`.

## 6. Critérios de Aceite

1. O cabeçalho exibe a pílula de localização e o botão de filtros (`tune`) no topo.
2. O título *"O que vamos ler hoje?"* utiliza a serifa da marca (`fontFamily.brand`).
3. O campo de busca exibe o ícone de lupa.
4. As categorias rápidas rolam horizontalmente.
5. Os resultados são apresentados em cartões com cantos arredondados, título em serifa e ações de favoritar/abrir.
6. 100% dos testes unitários e de componente passam na suíte.

