# Validação — Spec 078

## Automatizada (2026-10-26)

`npm run validate` aprovado: 179 arquivos / 1.299 testes, 78 specs e 64 ADRs sem colisão.
Novos: `tests/components/readerCard.test.tsx` (CA1, CA2) e o caso de pré-visualização em
`tests/components-mocked/profileView.test.tsx` (CA4), ambos falhando antes da implementação. Os testes
existentes de Meu perfil seguiram passando (CA3). Tokens `ipe-*` registrados em `design-system/tokens.json`
(ADR 0010) e espelhados em `src/view/tokens.ts`.

## Aparelho Android (Galaxy A16, ADB, tema claro)

- Meu perfil: cartão de leitor âmbar com lombada marrom, avatar com anel de flor, nome em serifa e ipê no
  canto; números em serifa marrom; flor laranja antes de "Atividade". **Aprovado.**
- Editar perfil: "Assim seu cartão aparece" com o cartão ao vivo. **Aprovado.**
- Tema escuro: **não conferido no aparelho** (tokens escuros definidos, contraste a conferir).

## Contraste

`on-ipe-container` sobre `ipe-container`: #4a2b16 sobre #fcefcb e #fbe6b4 sobre #3b2c12, ambos bem acima
de 4,5:1. O ipê e o anel são decorativos e não carregam informação.
