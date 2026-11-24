# 0118. Última cópia para leitura sem conexão

- **Status:** Aceito
- **Data:** 2026-11-24
- **Especificação:** [142](../../specs/142-leitura-sem-conexao/spec.md)
- **Decisões relacionadas:** ADRs 0035, 0101 e 0117

## Contexto

O prazo de cinco minutos descartava o catálogo e a Estante quando ainda eram necessários. A primeira página também podia ser usada como resposta offline a uma consulta paginada.

## Decisão

Conservar a última cópia consultada com sucesso, incluindo a data da consulta. Usar a cópia completa somente para a leitura padrão. Manter a Estante por conta sem rascunhos e limitar os detalhes persistidos a anúncios que circulam no catálogo público. As consultas de livros do cliente web usam requisições sem cache HTTP para que uma resposta do service worker não seja confundida com dados novos. As ações de escrita continuam dependentes da rede. Preservar a limpeza manual e refletir na cópia as alterações já confirmadas pelo servidor.

## Consequências

A leitura continua após fechar o aplicativo. O rótulo de data indica quando a cópia foi obtida. A disponibilidade de um exemplar e a publicação de uma ação são confirmadas ao reconectar. A cópia pode ser removida em Configurações.
