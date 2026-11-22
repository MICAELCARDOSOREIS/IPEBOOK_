# Validação em 22/11/2026

| Critério | Evidência |
| --- | --- |
| CA1 | Jest reproduziu a oferta de confirmar um horário expirado e passou após a correção. Os casos de uso impedem a confirmação vencida e preservam a proposta para reagendamento. O CDP confirmou um encontro válido pelo chat. |
| CA2 | Jest verificou o menu e o aviso de exclusão. A inspeção no Chrome conferiu a lista compacta e a seleção. O fluxo CDP exigiu foco visível e abriu a conversa com Enter. |
| CA3 | O CDP abriu o chat em tela própria a 390 px, verificou o campo de mensagem e confirmou a ausência de transbordamento horizontal. Jest verificou o acesso à negociação pelo livro no cabeçalho. |
| CA4 e CA5 | Jest verificou que uma notificação nova no histórico permanece acessível no filtro de não lidas. O CDP abriu uma proposta da central, confirmou o encontro no chat e encontrou o estado atualizado ao voltar. |
| CA6 | Jest verificou a marcação como lida, os rótulos acessíveis e as confirmações distintas para exclusão de lidas ou de todas. |

`npm run validate` passou com 2.337 testes em 317 arquivos. A exportação web em modo memória foi conferida com `npm run test:e2e`, com 7 de 7 cenários aprovados. A inspeção visual usou Chrome em desktop e emulação de celular. A execução ponta a ponta usou dados locais de teste.
