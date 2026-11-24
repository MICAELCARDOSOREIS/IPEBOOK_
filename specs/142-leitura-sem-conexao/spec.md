# Leitura sem conexão

## História e critérios de aceite

Quem já consultou o catálogo ou a Estante pode reabrir o app sem rede e ler a última cópia, mesmo após cinco minutos. A interface identifica a cópia e mostra a hora e a data da consulta que a gerou. A busca filtra os dados salvos localmente. Ao reconectar, a tela atualiza a leitura.

- Consultas paginadas ou com filtros no servidor devem devolver seus próprios resultados ou sinalizar a falha. A abertura do catálogo e da busca continua usando a lista local. O app informa que novas consultas precisam de conexão.
- O detalhe público já visitado pode abrir sem rede, mesmo fora da lista do catálogo. Se a foto falhar, a capa ilustrada deve aparecer. Rascunhos privados ficam excluídos das cópias offline de leitura.
- Publicar, favoritar, enviar propostas e mensagens requer conexão. Se ela cair com um formulário aberto, os dados digitados continuam no formulário.
- Confirmar em testes o armazenamento após reinicialização e tempo transcorrido, isolamento da Estante, reconexão, paginação e fallback visual. Validar, quando houver aparelho disponível, o fluxo completo em modo avião.
