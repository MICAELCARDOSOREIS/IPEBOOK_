# Tarefa 26 (Maria Clara) — Modelo: Book com modalidade/preço, bookValidator

> **Destacada em 2026-10-14** da Tarefa 24 (antes do Eric, redistribuída para o Antonio — ver
> [24-implementar-cadastro-anuncio-spec-003.md](../antonio-carlos-gomes/24-implementar-cadastro-anuncio-spec-003.md)).
> Corresponde à issue [#26](https://github.com/Ghostyxseven/IPEBOOK_/issues/26).

Responsável: Maria Clara Almeida Martins
Depende de: — (pode começar já)
Bloqueia: Tarefa 24 (Antonio) — Caso de uso + infra e ViewModel + tela de cadastro de anúncio
Domínio: Gestão de Inventário/Anúncios (parte de Modelo da spec 003)

## Contexto

[specs/003-autenticacao-e-cadastro-de-anuncio/](../../specs/003-autenticacao-e-cadastro-de-anuncio/)
já está especificada. Esta é a base de Modelo que o resto do cadastro de anúncio (Antonio)
depende.

## O que fazer

- T001 (parte): estender `src/model/entities/book.ts` com
  `modality: 'sale' | 'trade' | 'donation'`, `price?: number`, `ownerId: string`.
- T002 (parte): estender `src/model/validators/bookValidator.ts` com a regra condicional de
  preço (obrigatório e > 0 só quando modalidade é venda), com testes em `tests/unit/`.

## O que não fazer

- Não implementar o caso de uso `createListing` nem a tela de cadastro — é do Antonio (Tarefa
  24, issues [#27](https://github.com/Ghostyxseven/IPEBOOK_/issues/27) e
  [#28](https://github.com/Ghostyxseven/IPEBOOK_/issues/28)).

## Entregável

`Book` e `bookValidator` estendidos conforme acima, com testes passando (`npm test`).

---

## Registro de execução

_(preencher ao concluir: o que foi decidido, por quê, data, e o que ficou pendente)_

- Data:
- O que foi implementado:
- Testes executados e resultado:
- Pendências:
