# Plano da leitura sem conexão

Reutilizar o armazenamento assíncrono, o detector de conexão e o componente de capa. Expor a origem dos dados e a data pelo contrato de leitura até as telas. Manter MVVM e as APIs de leitura existentes. Não adicionar dependências ou migrações.

Guardar catálogo padrão, Estante por conta sem rascunhos e um conjunto limitado de detalhes públicos. Reconciliar as cópias após alterações confirmadas e integrar a limpeza existente. Conferir paginação no contrato, pois a pesquisa atual filtra localmente. Usar Jest, exportação web com Chrome CDP e a verificação Android em modo avião quando houver ambiente disponível.

Decisão registrada no [ADR 0118](../../docs/adr/0118-leitura-sem-conexao.md).
