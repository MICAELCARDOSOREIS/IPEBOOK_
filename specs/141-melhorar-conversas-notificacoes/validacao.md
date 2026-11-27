# Validação em 22/11/2026

| Critério | Evidência |
| --- | --- |
| CA1 | Jest reproduziu a oferta de confirmar um horário expirado e passou após a correção. Os casos de uso impedem a confirmação vencida e preservam a proposta para reagendamento. O CDP confirmou um encontro válido pelo chat. |
| CA2 | Jest verificou o menu e o aviso de exclusão. A inspeção no Chrome conferiu a lista compacta e a seleção. O fluxo CDP exigiu foco visível e abriu a conversa com Enter. |
| CA3 | O CDP abriu o chat em tela própria a 390 px, verificou o campo de mensagem e confirmou a ausência de transbordamento horizontal. Jest verificou o acesso à negociação pelo livro no cabeçalho. |
| CA4 e CA5 | Jest verificou que uma notificação nova no histórico permanece acessível no filtro de não lidas. O CDP abriu uma proposta da central, confirmou o encontro no chat e encontrou o estado atualizado ao voltar. |
| CA6 | Jest verificou a marcação como lida, os rótulos acessíveis e as confirmações distintas para exclusão de lidas ou de todas. |

`npm run validate` passou com 2.337 testes em 317 arquivos. A exportação web em modo memória foi conferida com `npm run test:e2e`, com 7 de 7 cenários aprovados. A inspeção visual usou Chrome em desktop e emulação de celular. A execução ponta a ponta usou dados locais de teste.

## Revisão web em 27/11/2026

| Critério | Evidência |
| --- | --- |
| CA7 | Jest verificou os detalhes sob demanda e as ações de abrir e denunciar anúncio. No Chrome, Enter abriu o painel encostado à direita, o foco entrou no painel e Escape o devolveu ao título do livro. |
| CA8 | No Chrome, as opções de rota, agenda e reagendamento apareceram ao expandir as ações do encontro. Em 1440 × 600, o histórico precisou rolar e exibiu o aviso mais recente inteiro com o campo de mensagem visível. Em 1024 × 768, o botão de entrega coube no chat sem transbordamento horizontal. |

Passaram o typecheck, o lint direcionado, 57 testes Jest e os oito cenários de `npm run test:e2e`. A exportação em modo memória usou temporariamente a configuração padrão do Expo porque o Metro local ainda referenciava o Sentry, removido das dependências na árvore de trabalho.

### Ajuste da área de leitura e dos menus

CA9 passou no Chrome CDP. O teste conferiu a largura do campo e do botão de envio, o clique nas opções acima do histórico, a posição estável do histórico nos dois menus, a devolução de foco com Escape e o fechamento por clique fora. A inspeção da captura em 1440 × 600 confirmou o alinhamento das mensagens, das respostas rápidas e do campo de escrita.

Passaram o typecheck, o lint direcionado, 38 testes Jest e os oito cenários de navegador. A nova exportação em modo memória usou a configuração do Metro do projeto.
