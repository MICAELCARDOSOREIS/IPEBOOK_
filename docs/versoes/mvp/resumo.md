# MVP — resumo e capturas

**Conferência:** 2026-10-14, via ADB no Samsung SM_A165M, com o aplicativo aberto no Expo Go. **Estado:** telas inspecionadas; fluxo de cadastro de anúncio ainda não validado de ponta a ponta no aparelho.

## Escopo observado

O MVP reúne catálogo público, cadastro e entrada com e-mail e senha, anúncio de livros e telas de pedidos recebidos e enviados. As modalidades disponíveis no formulário são venda, troca e doação. No aparelho, foram verificados o catálogo vazio, a criação de conta, o envio de um anúncio fictício e os estados vazios de pedidos. A entrada com uma conta existente e a negociação não foram percorridas nesta conferência. Requisitos e implementação estão em [specs/003](../../../specs/003-autenticacao-e-cadastro-de-anuncio/) e [specs/004](../../../specs/004-negociacao-simples/).

## Capturas do aparelho

As imagens são capturas integrais de 1080 × 2340 pixels. A conta e o livro usados na conferência eram fictícios e locais à implementação em memória.

| Tela ou estado | Captura | Observação |
| --- | --- | --- |
| Catálogo sem sessão | [Inicial](imagens/inicial.png) | Estado vazio e acesso a Entrar. |
| Login | [Entrar](imagens/login.png) | Campos de e-mail e senha. |
| Validação do login | [Erro de campo obrigatório](imagens/login-vazio.png) | O envio vazio mostrou “E-mail é obrigatório.” |
| Cadastro de conta | [Criar conta](imagens/cadastro.png) | Formulário com indicação de senha mínima de oito caracteres. O cadastro fictício retornou à página inicial com sessão. |
| Página inicial autenticada | [Sessão ativa](imagens/home-logado.png) | Atalhos para anunciar, sair e consultar pedidos. O e-mail e os atalhos ocupam uma linha apertada neste aparelho. |
| Cadastro de anúncio | [Anunciar](imagens/anunciar.png) | Título, autor, modalidade e preço para venda. |
| Validação do anúncio | [Erro de campo obrigatório](imagens/anunciar-vazio.png) | O envio vazio mostrou “Título do livro é obrigatório.” |
| Pedidos recebidos | [Estado vazio](imagens/recebidos.png) | Mensagem de ausência de pedidos recebidos. |
| Meus pedidos | [Estado vazio](imagens/meus-pedidos.png) | Mensagem de ausência de negociações solicitadas. |
| Após cadastrar anúncio fictício | [Catálogo ainda vazio](imagens/catalogo-com-livro.png) | O aplicativo voltou à página inicial, mas o livro não apareceu na listagem. |

## Resultado e pendências

1. **Catálogo após anúncio:** após cadastrar um livro fictício para doação, o app voltou à página inicial e continuou mostrando o estado vazio. Uma segunda conferência não mostrou atualização. O `useHomeViewModel` carrega a lista na montagem; a rota `anunciar` apenas volta à tela anterior. Essa é uma hipótese de causa baseada no código, ainda sem correção ou teste de regressão.
2. **Layout autenticado:** com o e-mail fictício usado, a saudação, “Anunciar” e “Sair” ficaram próximos na mesma linha. Verificar adaptação para e-mails mais longos e largura menor antes de considerar o layout validado.
3. **Ambiente Expo Go:** apareceu repetidamente o aviso “Cannot connect to Expo CLI”. A origem da conexão não foi investigada nesta conferência; o aviso não foi atribuído ao código do aplicativo.
4. **Negociação:** as telas vazias foram inspecionadas, mas solicitação e resposta de pedidos não foram verificadas no dispositivo.

As capturas documentam somente o estado observado nessa sessão. Não comprovam aprovação da versão, integração remota nem publicação.
