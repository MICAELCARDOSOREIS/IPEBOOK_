# Spec 070 — Selo de Bairro nos Cards de Livro (Home e Busca)

**Responsável:** Micael Cardoso Reis (`pessoa:micael`)  
**Data:** 25 de outubro de 2026  
**Telas no Figma:** `02.01 · Início`, `02.02 · Explorar / Pesquisa`.  
**Depende de:** Spec 022 (restrição territorial Piripiri), Spec 067 (seletor de bairro), Spec 068 (seção hiperlocal), ADR 0016 (restrição territorial Piripiri), ADR 0053 (selo de bairro nos cards de livro).

---

## 1. Problema

Embora o Ipebook restrinja a circulação de livros físicos à comunidade de Piripiri, PI (ADR 0016) e agora possua o seletor de localidade e o carrossel hiperlocal (Specs 067 e 068), os cards individuais de livros na Home (`src/view/home.tsx`) e na Pesquisa (`src/view/search/search.tsx`) exibiam apenas modalidade, preço, categoria e status, sem explicitar em qual bairro de Piripiri aquele livro está localizado.

Para um leitor navegando pela vitrine ou pesquisando um título, era necessário abrir o detalhe do livro para saber se o exemplar estava no Centro, Crioli, Petecas ou Paciência.

## 2. Usuários Afetados

Todos os leitores da comunidade de Piripiri que buscam livros e desejam saber imediatamente em qual bairro o anúncio está disponível antes de clicar no detalhe.

## 3. Escopo

1. **Card de Livro no Carrossel da Home (`src/view/home.tsx`):**
   - Quando `book.neighborhood` estiver preenchido, exibir uma linha visual de localização com ícone de marcador (`place`, tamanho 14) e o nome do bairro (ex.: "Centro", "Crioli").
   - Tipografia `fontFamily.regular`, cor `colors.m3.onSurfaceVariant`, limite de 1 linha com reticências.
2. **Card de Livro na Lista de Pesquisa (`src/view/search/search.tsx`):**
   - Exibir o selo de bairro junto à linha de metadados do card, com ícone `place` e nome do bairro de Piripiri.
3. **Acessibilidade:**
   - Adicionar o bairro ao rótulo de acessibilidade do card quando presente: *"Ver detalhe de [Título], [Autor] em [Bairro]"*.
4. **Testes:**
   - Testes de renderização comprovando a presença do bairro nos cards da Home e da Pesquisa.

## 4. Fora do Escopo

- Alteração na estrutura de dados de `Book` (o campo `neighborhood?: string` já existe).
- Alteração no detalhe do livro (já exibe o bairro do livro).

## 5. Critérios de Aceite

1. O card de livro no carrossel da Home exibe o nome do bairro e ícone quando `book.neighborhood` estiver definido.
2. O card de livro na lista da Pesquisa exibe o nome do bairro e ícone quando `book.neighborhood` estiver definido.
3. Se o livro for legado ou não possuir bairro definido, o selo é omitido graciosamente sem quebra de layout.
4. O leitor de tela anuncia o bairro ao focar no card.
5. Todos os testes unitários e de componentes passam com 100% de sucesso.
