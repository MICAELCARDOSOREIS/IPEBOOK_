# 0007 — Serifa da marca: Source Serif 4 Bold

Data: 2026-10-13. Status: aceito.

## Contexto

`docs/design-system.md` (linha 81) referenciava um "ADR 0019" para justificar o uso da fonte
Source Serif 4 Bold na marca, mas esse arquivo nunca existiu neste repositório — só há ADRs
0001 a 0006. A referência foi copiada do projeto irmão da equipe
(`/home/usermicael/Projetos/IpeBook`), que tem seu próprio
[ADR 0019](../../docs/adr/0019-serifa-da-marca-e-superficies-do-figma.md) — mas aquele ADR
decide um escopo bem mais amplo (papéis de superfície do Figma, capa ilustrativa, navegação com
5 destinos) que não se aplica a este projeto pequeno, ainda na fundação MVVM.

## Decisão

Registrar aqui, isoladamente, apenas o recorte que interessa a este projeto: a identidade e os
títulos de destaque (marca) usam **Source Serif 4 Bold**, conforme já documentado em
`docs/design-system.md` seção 3.1. A interface e os controles continuam em Roboto. As demais
decisões do ADR 0019 do projeto irmão (superfícies Figma, capa ilustrativa, navegação de 5
destinos) não se aplicam aqui — este projeto não tem essas telas implementadas.

## Alternativas consideradas

- Manter o link apontando para o ADR 0019 do projeto irmão: rejeitada, pois mistura decisões de
  escopos diferentes e cria uma dependência de documentação entre repositórios independentes.
- Criar um ADR 0019 aqui também, replicando o número: rejeitada, pois quebraria a numeração
  sequencial local (que já está em 0006).

## Consequências

- `docs/design-system.md` passa a referenciar este ADR local em vez de um arquivo inexistente.
- Fica registrado que esta decisão é um subconjunto deliberado do ADR 0019 do projeto irmão, não
  uma decisão nova e independente.

Vínculos: [docs/design-system.md](../design-system.md).
