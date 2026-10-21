# Correções da revisão integral

**Branch:** `fix/revisao-integral-20261020`  
**Estado:** Implementada e validada localmente em 2026-10-21

## Objetivo e escopo

Corrigir seis defeitos identificados na revisão da branch `develop`: histórico e ordem das migrações; autorização de avaliações; exportação de dados na Web e no aplicativo nativo; abrangência da exportação; consistência ao aceitar pedidos; e rótulo de anúncios reservados. Não inclui implantação nem alteração do banco remoto.

## Critérios de aceite e verificação

1. Cada migração tem versão única; todas são executadas em ordem por `npm run test:sql`, inclusive edição de perfil e regras de avaliação.
2. Somente participantes de pedido aceito podem avaliar a outra parte, uma vez por pedido; tentativas indevidas são recusadas por RLS em teste SQL.
3. Exportar dados gera arquivo JSON na Web e arquivo compartilhável em Android/iOS; ausência de suporte ou falha retorna erro, sem mensagem falsa de sucesso.
4. A exportação inclui cadastro, perfil, anúncios, pedidos, favoritos, alertas, notificações, denúncias e avaliações do usuário; falhas de consultas não produzem arquivo parcial anunciado como completo.
5. Aceitar pedido e rejeitar concorrentes atualiza o livro na mesma transação no banco; falhas não deixam estado intermediário. O adaptador em memória conserva o comportamento esperado.
6. A estante chama anúncios `reserved` de “Reservados”, sem afirmar que a negociação foi concluída.

Executar testes afetados, `npm run validate`, `npm run verify:release` e revisar o diff. A CLI Supabase não recebeu token nesta sessão; a compatibilidade com o histórico remoto precisará ser verificada antes de aplicar novas migrações.

## Resultado da validação

`npm run validate` e `npm run verify:release` passaram: 745 testes em 108 arquivos, 15 migrações testadas em PGlite, arquitetura sem violações e 26 rotas web geradas. Os testes SQL cobrem autorização de avaliações e reversão integral do aceite quando a reserva falha. A exportação nativa foi verificada com mocks dos módulos Expo, sem ensaio em dispositivo físico. Não houve aplicação de migrações no Supabase remoto nem publicação.

Em 2026-10-21, a consulta `npx supabase migration list --linked` foi repetida fora do sandbox e retornou `AccessTokenRequiredError`. O Android `RX8Y6018P3W` estava conectado com o aplicativo aberto na tela de redefinição de senha, sem sessão de usuário disponível para percorrer a exportação. A verificação real depende de autenticação no Supabase e de uma sessão de teste no aplicativo; não foram manipuladas credenciais nesta revisão.
