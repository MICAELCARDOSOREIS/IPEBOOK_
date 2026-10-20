# 0029 — Vocabulário fechado para conservação e bairro do anúncio

Data: 2026-10-20. Status: aceito.

## Contexto

A etapa de detalhes do anúncio no Figma (`04.05 · Detalhes do livro`, nó `12:360`) oferece o estado
de conservação e a categoria como chips de escolha única, e o bairro como campo de retirada. O
código não tinha conservação nem descrição, a categoria era texto livre de até 60 caracteres e o
bairro também era texto livre: `PIRIPIRI_NEIGHBORHOODS` (os 17 bairros oficiais definidos pelo
[ADR 0016](0016-beta-restrita-a-piripiri.md)) só era consultada por um teste de semente, nunca pela
tela. Na prática, dois anúncios do mesmo bairro podiam gravar "Centro", "centro" e "Centro, PI".

A Spec 017 já havia registrado que as etapas 2 e 3 do Figma usavam campos que a entidade `Book` não
tinha, e deixou a decisão em aberto.

Opções consideradas:

- **Texto livre com sugestão**: menor mudança, mas mantém a divergência de grafia e inviabiliza
  filtro por bairro e por conservação (issue #93), que é justamente o próximo passo do catálogo.
- **Vocabulário fechado no modelo**: valores validados na entidade, no validador, nos adaptadores e
  no banco, com a tela oferecendo apenas valores válidos.

## Decisão

Adotar vocabulário fechado para conservação e bairro:

- `BookCondition = "new" | "good" | "marked" | "worn"` em `src/model/entities/book.ts`, com os
  rótulos em português (`BOOK_CONDITION_LABELS`) vivendo na mesma entidade para que View e
  persistência não divirjam.
- `Book.description` opcional, limitada a 280 caracteres — o mesmo limite que o contador da tela
  mostra.
- Bairro escolhido a partir de `PIRIPIRI_NEIGHBORHOODS` nas telas de publicar e editar, em vez de
  digitado.
- A restrição é aplicada em três camadas: `bookValidator` (domínio), adaptadores (mapeamento) e a
  migração `202610200005_conservacao_descricao_anuncio.sql`, que recusa valor fora da lista e
  descrição acima de 280 caracteres no próprio banco.

Os dois campos são opcionais para não invalidar anúncios publicados antes desta decisão.

## Consequências

- Filtro e ordenação por conservação e bairro (issue #93) passam a ser possíveis sem normalizar
  dados sujos depois.
- Acrescentar um estado de conservação novo exige tocar entidade, validador e banco — é uma mudança
  deliberada, não um texto digitado em produção.
- A categoria continua sendo gravada como texto, mas as telas passam a oferecer a mesma lista de
  cinco categorias do Figma; fechar o vocabulário de categoria fica para quando houver taxonomia
  definida pelo produto.
- Anúncios antigos seguem sem conservação e sem descrição, e as telas tratam a ausência desses
  campos sem erro.
