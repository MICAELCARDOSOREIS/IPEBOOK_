# 0073 — BrasilAPI como terceira fonte de ISBN e dados da edição no anúncio

Data: 2026-10-28. Status: aceito. Especificação: [097](../../specs/097-sinopse-e-edicao-pelo-isbn/spec.md). Complementa a Spec 092 (fontes compostas de ISBN).

## Contexto
O ISBN trazia só título, autor e capa, de duas fontes (Open Library e Google Books). Edições nacionais, como mangás da Panini, nem sempre existem nelas, e o anúncio não tinha sinopse nem dados da edição. A BrasilAPI expõe a base da Câmara Brasileira do Livro e devolveu título, editora e sinopse onde a Open Library respondia vazio.

## Decisão
- Acrescentar o `BrasilApiBookMetadataService` como terceira fonte do `CompositeBookMetadataService`, sem trocar as outras: as três são consultadas juntas, e a que falhar é ignorada.
- Gravar sinopse, editora, páginas e ano no próprio anúncio (colunas opcionais em `v2_books`, migração `202610280004`), porque o anúncio não guarda o ISBN e não dá para buscar depois.
- Limpar e limitar os textos antes de gravar (`normalizeEdition`) e reforçar os limites no banco com `check`.
- Liberar `brasilapi.com.br` em `connect-src` da política de segurança do site.

## Alternativas consideradas
- Trocar as fontes atuais pela BrasilAPI: perderia a capa, que ela não traz, e dependeria de um único serviço.
- Guardar o ISBN no anúncio e buscar a sinopse na hora de abrir o detalhe: uma chamada de rede a cada visita, com cota e disponibilidade de terceiros, e a sinopse sumiria se a fonte saísse do ar.
- Deixar a sinopse dentro de `description` (limite de 280): estouraria o limite e misturaria o que a pessoa escreve com o que vem da base.

## Consequências
- Exige aplicar a migração em cada ambiente e atualizar o site (CSP) para a web.
- Os campos novos aumentam um pouco cada linha de `v2_books`; o limite de 2000 caracteres da sinopse mantém o crescimento previsível.
- Dependência de uma API pública sem SLA: se cair, o ISBN segue funcionando pelas outras duas fontes, só sem sinopse.
