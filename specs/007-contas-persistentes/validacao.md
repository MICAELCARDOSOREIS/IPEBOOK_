# Validação da spec 007

Estado: **parcial**, em 2026-10-15. A migração não foi aplicada nem testada em um projeto
Supabase real. Não há evidência de sincronização entre contas, envio de e-mail ou recuperação
concluída no Android/Web.

A CLI autenticada encontrou quatro migrações remotas de outra versão do IpeBook no projeto
configurado no `.env`. A simulação de `db push` recusou a aplicação porque esses arquivos não
estão no histórico local. O esquema existente usa `listings` e já possui `book_requests`, com
contrato diferente do planejado na spec 007. Nenhum comando de escrita foi executado no banco.
A validação remota aguarda a escolha de um projeto isolado ou a decisão de adaptar esta spec
ao banco existente; não reparar o histórico apenas para forçar o push.

| Verificação | Resultado |
| --- | --- |
| `npm run validate` | Passou: 190 testes em 30 arquivos; tipos e 57 arquivos de arquitetura sem violações; cobertura de ramificações 81,35%. Inclui `test:sql`. |
| `npm run test:sql` | Passou em PostgreSQL local via PGlite: migrações, leitura pública, publicação negada a visitante, proprietário falsificado, pedido do próprio livro, visibilidade/resposta de terceiros e transição inválida. O Supabase hospedado ainda precisa ser testado. |
| `npm run build:web` | Passou: 10 rotas exportadas, inclusive `/redefinir-senha`. |
| Testes unitários dos adaptadores | Passaram para respostas de sucesso, erro, RLS negada simulada e link inválido. Não substituem testes em PostgreSQL. |
| Duas contas e RLS real | Pendente. |
| E-mail transacional e retorno do link | Pendente: SMTP e URL de retorno ainda não configurados. |
| Android físico | Pendente: não houve conferência visual desta versão. |
| Aparência Web em 390 × 844 | Conferida no Chromium sem Playwright pela rota de desenvolvimento `/esqueci-senha`: título, instrução, campo, botão e retorno ao login legíveis. A rota `/redefinir-senha` foi inspecionada em exportação estática antes da hidratação; falta conferir o fluxo interativo completo. |

Antes de marcar T001–T006 como concluídas, configurar projeto de desenvolvimento isolado,
aplicar migrações, executar cenários permitidos e negados com duas contas, testar link de
recuperação no Android e Web e registrar o resultado. O aceite de negociação permanece não
atômico; não habilitar esta integração em beta pública antes da especificação correspondente.
