# Validação da spec 007

Estado: **parcial**, em 2026-10-15. As migrações foram aplicadas no único projeto Supabase
disponível (`xiuuiggpccpgrwkzeloc`), com autorização explícita do usuário. Ainda não há
evidência de sincronização entre contas reais, envio de e-mail ou recuperação concluída no
Android/Web.

## Decisão sobre o projeto Supabase compartilhado

A CLI autenticada encontrou, nesse mesmo projeto, um esquema de outra versão/equipe do IpeBook
(`listings`, `profiles`, `book_requests`, `notifications`, `favorites`, `ratings`, `reports`,
`request_messages`, `user_blocks`, com dados reais: 9 anúncios, 6 perfis, 4 pedidos etc.). A
primeira tentativa de solução (preservada no histórico de migrações) isolou as tabelas novas
sob o prefixo `v2_` para não tocar nesse esquema legado.

O usuário, informado de que havia dados reais de outra versão sob esse prefixo, **confirmou
explicitamente apagar todo o esquema legado** (tabelas e funções `SECURITY DEFINER` órfãs) e
recriar do zero apenas as tabelas da spec 007. Isso foi executado em 2026-10-15 via MCP do
Supabase (`apply_migration`/`execute_sql`), sem usar a CLI local. Não havia ferramenta disponível
para apagar o projeto inteiro; a alternativa adotada foi resetar o esquema `public` dentro do
mesmo projeto, preservando URL e chaves já configuradas no `.env`.

Resultado: `public.v2_books` e `public.v2_book_requests` existem no projeto real, com RLS
habilitado e sem dados. As quatro migrações locais que apenas espelhavam o esquema legado
(`notificacoes`, `favoritos`, `conversar_antes_do_encontro`, `mapa_pontos_encontro`) foram
removidas do repositório por não corresponderem mais a nada no projeto. O advisor de segurança
do Supabase não reporta mais as 15 funções `SECURITY DEFINER` legadas; resta apenas o aviso
padrão de "Leaked Password Protection Disabled" (configuração de Auth, não tratada aqui).

| Verificação | Resultado |
| --- | --- |
| `npm run validate` | Passou: 190 testes em 30 arquivos; tipos e 57 arquivos de arquitetura sem violações; cobertura de ramificações 81,35%. Inclui `test:sql`. |
| `npm run test:sql` | Passou em PostgreSQL local via PGlite: migrações, leitura pública, publicação negada a visitante, proprietário falsificado, pedido do próprio livro, visibilidade/resposta de terceiros e transição inválida. |
| Migrações no Supabase real | Aplicadas via MCP em 2026-10-15 no projeto `xiuuiggpccpgrwkzeloc`: `v2_books` e `v2_book_requests` criadas com RLS; esquema legado removido com autorização do usuário. Advisor de segurança sem pendências novas. |
| `npm run build:web` | Passou: 10 rotas exportadas, inclusive `/redefinir-senha`. |
| Testes unitários dos adaptadores | Passaram para respostas de sucesso, erro, RLS negada simulada e link inválido. Não substituem teste ponta a ponta contra o projeto real. |
| Duas contas e RLS real | Pendente: esquema real existe, mas nenhum cenário com duas contas autenticadas foi executado contra ele. |
| E-mail transacional e retorno do link | Pendente: SMTP e URL de retorno ainda não configurados. |
| Android físico | Pendente: não houve conferência visual desta versão. |
| Aparência Web em 390 × 844 | Conferida no Chromium sem Playwright pela rota de desenvolvimento `/esqueci-senha`: título, instrução, campo, botão e retorno ao login legíveis. A rota `/redefinir-senha` foi inspecionada em exportação estática antes da hidratação; falta conferir o fluxo interativo completo. |

Antes de marcar T005–T006 como concluídas, executar cenários permitidos e negados com duas
contas reais contra `v2_books`/`v2_book_requests`, testar o link de recuperação no Android e na
Web, habilitar a proteção contra senhas vazadas no painel de Auth e registrar o resultado. O
aceite de negociação permanece não atômico; não habilitar esta integração em beta pública antes
da especificação correspondente.
