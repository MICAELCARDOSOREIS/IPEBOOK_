# 0005 — Modalidade do produto: venda, troca e doação de livros físicos

Data: 2026-10-13. Status: aceito.

## Contexto

`docs/produto.md` listava como pendente a modalidade do Ipebook (troca/doação, biblioteca
pessoal, leitura digital ou outra) — decisão que muda entidades, permissões e integrações do
modelo de `Book`. O [design system já documentado](../design-system.md) para este mesmo
projeto já descrevia badges de modalidade (Venda, Troca, Doação, Reservado, Concluído),
indicando que a decisão já tinha sido tomada na prática mas não registrada formalmente aqui.

Além disso, a equipe mantém um projeto irmão mais avançado
(`/home/usermicael/Projetos/IpeBook`) que já implementa esta mesma modalidade em produção, com
negociação completa entre usuários.

## Decisão

1. O Ipebook adota as modalidades **venda, troca e doação** de livros físicos entre pessoas da
   comunidade. Biblioteca pessoal, leitura digital e empréstimo ficam fora de escopo.
2. Os livros têm origem em **cadastro manual pelo próprio usuário** (anúncio), sem importação de
   catálogo externo nesta etapa. Como o conteúdo vem do próprio usuário anunciante, não há
   implicação de direitos autorais sobre o texto do livro em si — apenas sobre fotos/descrições
   que o usuário enviar, que são de sua responsabilidade.
3. O modelo `Book` precisará, em especificação futura, de um campo de modalidade (venda/troca/
   doação) além de `id`, `title` e `author` — a extensão exata do modelo fica para a
   especificação da primeira jornada funcional, não para este ADR.

## Alternativas consideradas

- **Biblioteca pessoal** (organizar o próprio acervo, sem interação entre usuários): rejeitada
  por não corresponder ao design system já existente nem ao produto validado no projeto irmão.
- **Leitura digital** (upload de arquivos): rejeitada pelo mesmo motivo, e por introduzir
  complexidade de direitos autorais sobre conteúdo de terceiros que o produto não precisa
  assumir.

## Consequências

- `docs/produto.md` deixa de listar modalidade como decisão pendente.
- Toda especificação futura de cadastro/anúncio de livro deve considerar o campo de modalidade.
- O design system (badges de Venda/Troca/Doação) passa a estar alinhado com a documentação de
  produto, não mais contraditório.

Vínculos: [docs/produto.md](../produto.md), [design-system.md](../design-system.md).
