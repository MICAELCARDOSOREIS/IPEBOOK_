# Especificação: Editar e Pausar Anúncio (Spec 024)

## 1. Contexto e Problema

Anteriormente, o ciclo de vida de um anúncio no Ipebook permitia apenas as ações de criar e remover. Quando um leitor errava a digitação de um título, alterava o valor de um livro à venda, mudava de ideia quanto à modalidade (ex: de venda para doação) ou precisava suspender temporariamente a disponibilidade do livro enquanto viaja, era forçado a excluir o anúncio e recadastrá-lo do zero.

Esta especificação define o modelo, casos de uso e interfaces para edição de dados do anúncio e controle de disponibilidade via pausa temporária.

## 2. Regras de Negócio e Invariantes

- **RN-01 (Proteção de Posse)**: Apenas o criador do anúncio (`ownerId === sessionUserId`) pode editar seus dados ou alternar seu estado de pausa.
- **RN-02 (Transição de Status e Pausa)**:
  - Um anúncio com status `available` pode ser alternado para `paused`.
  - Um anúncio com status `paused` pode ser reativado para `available`.
  - Um anúncio com status `reserved` (que possui negociação aceita e encontro em andamento) **não** pode ser pausado nem ter seus dados principais editados, preservando o acordo entre as partes.
- **RN-03 (Visibilidade no Catálogo e Busca)**:
  - Anúncios com status `paused` não são exibidos no catálogo público (Home) nem nos resultados de pesquisa.
  - Tentativas de solicitar negociação para um livro pausado são rejeitadas.
  - Na tela "Meus anúncios", o proprietário visualiza seus anúncios pausados com a tag visual "Pausado" e a opção de "Retomar anúncio".
- **RN-04 (Edição de Dados)**:
  - O proprietário pode atualizar: título, autor, modalidade (venda, troca, doação), preço (se modalidade for venda), categoria, fotos e bairro em Piripiri, PI.
  - As validações de negócio vigentes em `bookValidator` (como restrição a Piripiri, preço positivo para venda e limites de caracteres) são estritamente aplicadas na edição.

## 3. Critérios de Aceite

1. `Book.status` suporta o valor `"paused"` além de `"available"` e `"reserved"`.
2. Migração SQL no Supabase atualizando a constraint de verificação de `status` na tabela `public.v2_books`.
3. Casos de uso `updateListing` e `togglePauseListing` implementados com proteção de posse e impedimento para livros reservados.
4. Adaptadores de dados em memória e Supabase atualizados com suporte a atualização de dados e status.
5. Tela "Meus anúncios" exibe botão para pausar/retomar e atalho para editar anúncio.
6. Tela de edição com campos do design system permitindo salvar alterações e exibir feedback de sucesso.
7. Testes automatizados cobrindo posse, validações, casos de erro e fluxo de UI; `npm run validate` e `npm run build:web` 100% aprovados.
