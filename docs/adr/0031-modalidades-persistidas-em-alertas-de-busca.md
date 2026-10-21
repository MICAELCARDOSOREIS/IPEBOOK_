# 0031 — Modalidades persistidas em alertas de busca

Data: 2026-10-21. Status: aceito.

## Contexto

A [Spec 036](../../specs/036-gerenciar-e-editar-alerta/spec.md) permite escolher tipos de anúncio na edição de um alerta. Exibir os tipos sem usá-los para gerar avisos enganaria a pessoa. O aviso atual é criado pelo gatilho transacional definido no [ADR 0015](0015-alertas-de-busca-no-banco.md).

## Decisão

Guardar uma a três modalidades (`sale`, `trade`, `donation`) em `v2_search_alerts.modalities`, com as três como padrão para alertas existentes. O gatilho de publicação e o adaptador em memória só geram aviso quando a modalidade do livro pertence ao alerta. O banco rejeita arrays vazios e valores fora do vocabulário. A cidade continua fixa em Piripiri, PI.

## Alternativas consideradas

- Chips somente visuais: rejeitados porque a escolha não teria efeito nos avisos.
- Comparar modalidades apenas no cliente: rejeitado porque o gatilho do banco cria os avisos sem consultar o cliente.
- Criar uma tabela relacional de modalidades: desnecessário para o conjunto fechado de três valores.

## Consequências

- Aplicar `202610210002_modalidades_alerta_busca.sql` no Supabase antes de disponibilizar a edição de tipos no ambiente remoto.
- Alertas antigos preservam o comportamento anterior.
- A função de aviso continua transacional e com execução direta revogada para clientes.

Vínculos: [Spec 036](../../specs/036-gerenciar-e-editar-alerta/spec.md), [ADR 0015](0015-alertas-de-busca-no-banco.md).
