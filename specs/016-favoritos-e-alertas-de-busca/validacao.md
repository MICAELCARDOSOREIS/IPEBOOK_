# Validação da spec 016 — Favoritos e alertas de busca

Data: 2026-10-15. Branch: `feature/favoritos-alertas-busca`.

## Resultado local

- `npm run validate`: aprovado. TypeScript sem erros; arquitetura com 129 arquivos e nenhuma violação; cenários SQL e RLS aprovados; 358 testes em 64 arquivos.
- Cobertura global: 89,32% de instruções, 80,22% de ramificações, 86,34% de funções e 90,88% de linhas.
- `npm run build:web`: aprovado; 21 rotas estáticas, incluindo `/favoritos` e `/alertas`.
- `npm run test:sql` após incluir o caso de alteração indevida de notificação: aprovado.

## Critérios exercitados

- Testes de casos de uso verificam sessão obrigatória, isolamento entre contas, alternância de favorito, alerta ativo/pausado, ausência de aviso para quem anunciou e correspondência por título e categoria.
- Testes de componentes verificam estado vazio, criação, pausa, retomada, exclusão com confirmação, orientação para entrar e atualização da lista ao voltar do detalhe após desfavoritar.
- SQL local verifica RLS de favoritos e alertas, geração de notificação na publicação e impossibilidade de alterar seu conteúdo pelo cliente.

## Limites

- A migração `202610150003_favoritos_alertas.sql` foi testada em PGlite local e aplicada ao Supabase vinculado via `supabase db query --linked --file`; a versão foi registrada com `supabase migration repair --linked --status applied 202610150003`. Consulta posterior confirmou uma coluna `category`, três tabelas, nove políticas e um gatilho. O comando `db push --dry-run` ainda falha porque oito versões antigas do histórico remoto não estão no diretório local; elas foram preservadas para reconciliação futura.
- Um bloco SQL remoto com duas contas existentes verificou que uma conta não lê o alerta da outra, que o novo anúncio gera a notificação para o leitor e que o anunciante não recebe autoaviso. O teste reverteu os próprios dados e uma consulta posterior confirmou zero livros, alertas e notificações temporários.
- A migração acrescenta uma coluna opcional sem reescrever anúncios. Depois que houver dados em favoritos, alertas ou notificações, descartar as novas tabelas deixa de ser uma reversão segura; qualquer recuperação deve preservar esses dados antes de alterar o esquema.
- O Chromium headless abriu `/favoritos` e `/alertas` em servidor local com reescrita de rotas; os estados sem sessão apareceram no DOM e uma captura móvel de Alertas foi conferida. Em sessão autenticada temporária com backend em memória, foram exercitados cadastro, criação/pausa/retomada/exclusão de alerta, criação de anúncio, favoritar na Home, listagem de favoritos e desfavoritar no detalhe.
- Um build web configurado localmente para Supabase foi testado no Chromium com duas contas descartáveis criadas sem envio de e-mail. O leitor criou o alerta; o anunciante publicou `Dom Casmurro` e não recebeu autoaviso; o leitor recebeu a notificação, favoritou, viu o livro na lista e desfavoritou no detalhe. A primeira execução revelou lista desatualizada ao voltar; após correção, o mesmo caminho exibiu o estado vazio. As duas contas foram removidas e consulta posterior confirmou zero registros nas quatro tabelas envolvidas. A configuração local e os arquivos temporários de credenciais foram removidos.
- A publicação do aplicativo e o teste em dispositivo físico permanecem fora desta validação.
- Não houve publicação nem push de código.
