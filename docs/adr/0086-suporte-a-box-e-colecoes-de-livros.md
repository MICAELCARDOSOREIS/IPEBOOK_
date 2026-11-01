# 0086 — Suporte a box e coleções de livros no catálogo e no anúncio

Data: 2026-10-31. Status: aceito. Especificação: [112](../../specs/112-anuncio-box-de-livros/spec.md).

## Contexto
Na comunidade leitora de Piripiri, muitos usuários possuem coleções completas, trilogias ou caixas de livros ("boxes") que desejam trocar, vender ou doar como uma unidade indivisível (ex: sagas de fantasia, séries literárias infanto-juvenis ou coleções didáticas).

Até então, o modelo de dados e a interface tratavam todo anúncio como um exemplar unitário, sem sinalização explícita de que se tratava de um conjunto de múltiplos volumes. Isso causava dúvidas sobre se o valor/proposta se referia a um único volume ou ao box completo, além de dificultar que interessados filtrassem especificamente por coleções completas.

## Decisão
1. **Modelagem de Dados**:
   - Adicionar colunas `is_box` (booleano, padrão `false`, não nulo) e `box_volumes_count` (inteiro opcional) na tabela `public.v2_books`.
   - Adicionar restrição de integridade no banco: `box_volumes_count` deve ser entre 2 e 100, e não pode ser preenchido caso `is_box` seja falso.
   - Criar índice parcial no PostgreSQL: `idx_v2_books_is_box on public.v2_books(is_box) where is_box = true` para garantir performance nas consultas que filtram coleções.
2. **Interface e Usabilidade**:
   - No assistente de anúncio (`createListing`) e edição (`editListing`), disponibilizar opção clara para assinalar se é um box/coleção, permitindo opcionalmente especificar a contagem de volumes.
   - Nos cartões do catálogo (`ReaderCard`), exibir selo visual "Box" para identificação rápida.
   - No detalhe do livro (`bookDetail`), exibir tag destacada na ficha técnica informando que se trata de um box e o número de volumes.
   - No painel de filtros da pesquisa, incluir filtro para listar apenas boxes/coleções.

## Consequências
- **Positivas**:
  - Clareza imediata sobre a natureza da negociação (evita mal-entendidos sobre o preço ou troca ser pelo conjunto ou por volume avulso).
  - Melhora na experiência de busca para leitores que procuram coleções completas.
  - Baixo impacto arquitetural, mantendo compatibilidade retroativa total com anúncios individuais preexistentes (`is_box` padrão `false`).
- **Alternativas consideradas**:
  - *Criar tabela separada de volumes de box*: Rejeitada por adicionar complexidade relacional excessiva e desnecessária para o escopo comunitário local, onde o box é transacionado integralmente em uma única negociação.
