# ADR 0053 — Selo de Bairro nos Cards de Livro (Home e Busca)

- **Status:** Aceito
- **Data:** 25 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Decisores:** Time de Engenharia Ipebook
- **Contexto técnico:** Spec 070 (Selo de Bairro nos Cards de Livro), Figma `02.01 · Início`, `02.02 · Explorar / Pesquisa`.
- **Relacionado a:** ADR 0016 (Restrição territorial Piripiri), ADR 0050 (Seletor de Bairro Comunitário), ADR 0051 (Seção hiperlocal na Home).

---

## Contexto

O IpêBook é voltado para a comunidade leitora de Piripiri, PI (ADR 0016). Os usuários selecionam bairros e navegam pela cidade, mas os cards individuais de livros exibiam apenas capa, título, autor, modalidade e preço, sem indicação visual direta do bairro onde o livro se encontra.

Isso exigia que o usuário entrasse no detalhe de cada livro para verificar se o exemplar estava perto (no Centro, Crioli, Petecas ou Paciência).

## Decisão

1. **Adição do Selo de Bairro nos Cards do Carrossel da Home (`home.tsx`):**
   - Exibir uma linha visual de localização compacta com o ícone `place` (14dp) e o nome do bairro do livro logo abaixo do autor.
2. **Adição do Selo de Bairro nos Cards da Busca (`search.tsx`):**
   - Exibir o selo de localização na linha de metadados de cada livro encontrado.
3. **Acessibilidade Inclusiva:**
   - Incorporar o bairro no rótulo de acessibilidade do card: *"Ver detalhe de [Título], [Autor] em [Bairro]"*.

## Consequências

- **Positivas:**
  - O leitor identifica imediatamente a proximidade do livro antes de abrir o anúncio.
  - Fortalecimento da proposta de valor hiperlocal de Piripiri.
  - Tratamento retrocompatível: livros legados sem bairro omitem o selo sem quebras.
- **Negativas / Limitações:**
  - Pequeno acréscimo de altura vertical nos cards de listagem.
