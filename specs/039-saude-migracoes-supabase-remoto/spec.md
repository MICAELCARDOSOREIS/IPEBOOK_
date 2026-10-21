# Spec 039 — Automação e Verificação de Saúde e Migrações do Supabase Remoto

**Responsável:** Micael (`pessoa:micael`)
**Data:** 21 de outubro de 2026
**Issue:** #177
**Tipo:** Backend, Operação e Observabilidade

## Problema

O IpêBook conta com um conjunto crescente de migrações SQL versionadas em `supabase/migrations/` que estruturam tabelas, colunas, índices, funções RPC transacionais e políticas de Row Level Security (RLS) para o catálogo, negociações, denúncias, fotos, perfil público, preferências de privacidade e alertas de busca.

Embora o ambiente local de desenvolvimento e integração contínua (CI) valide a sintaxe e a semântica das migrações via PostgreSQL em memória (PGlite com `npm run test:sql`), a evolução contínua da aplicação exige garantias estritas sobre o estado do backend remoto de homologação/produção (Supabase):
1. Verificar conectividade segura com o Supabase remoto sem vazar credenciais ou segredos em logs ou relatórios.
2. Conferir se todas as tabelas críticas e novas colunas esperadas pela aplicação existem e estão acessíveis via API REST PostgREST.
3. Conferir a disponibilidade e configuração pública do bucket de armazenamento `book-photos` no Supabase Storage.
4. Identificar e relatar de forma automatizada quais migrações SQL locais já foram aplicadas no banco remoto e quais ainda estão pendentes de execução.
5. Fornecer um script de diagnóstico reproduzível e automatizado (`scripts/verificar-migracoes-remotas.mjs` acionado via `npm run health:supabase:remote`) com códigos de saída padronizados e suporte a saída estruturada (JSON).

## Escopo

- Implementação do módulo e script `scripts/verificar-migracoes-remotas.mjs`.
- Registro do comando `npm run health:supabase:remote` no `package.json`.
- Diagnóstico automatizado abrangendo:
  - **Segurança de credenciais:** sanitização e mascaramento de URLs, sem exposição de tokens JWT ou API keys em logs ou saídas JSON.
  - **Conectividade e latência:** teste de ping e tempo de resposta da API REST.
  - **Inspeção de tabelas e colunas críticas:**
    - `v2_books` (dados básicos, conservação, descrição, fotos, cidade, estado, bairro);
    - `v2_profiles` (dados públicos, foto e identificador de rede social);
    - `v2_book_requests` (pedidos e negociações);
    - `v2_favorites` (favoritos);
    - `v2_search_alerts` (alertas de busca incluindo array de modalidades);
    - `v2_reports` (denúncias de anúncios);
    - `v2_ratings` (avaliações entre partes da negociação);
    - `v2_notifications` (notificações do usuário);
    - `v2_user_preferences` (preferências privadas de notificação e contato).
  - **Inspeção de Storage:**
    - Bucket `book-photos`: acessibilidade pública e listagem de objetos.
  - **Inspeção de Funções RPC:**
    - `delete_user_account(target_user_id)` (LGPD);
    - `accept_book_request(target_request_id)` (aceite atômico).
  - **Mapeamento e reconciliação de migrações:**
    - Comparação das migrações locais existentes em `supabase/migrations/` contra os artefatos encontrados no banco remoto, classificando cada migração como aplicada ou pendente.
- Suporte a múltiplos formatos de emissão:
  - Terminal com formatação visual e sumário operacional (padrão);
  - JSON puro (`--json`) para integração em pipelines e ferramentas de monitoramento.
- Código de saída previsível:
  - `0`: Backend remoto totalmente íntegro e todas as migrações locais aplicadas (ou quando invocada a flag `--allow-pending` com conectividade saudável);
  - `1`: Falha de conectividade, ausência de credenciais obrigatórias ou detecção de migrações/artefatos pendentes.
- Testes unitários abrangentes em `tests/unit/supabaseRemoteHealth.test.ts` com mocks de chamadas HTTP e simulação de cenários íntegros e com falhas/pendências.

## Regras de Negócio e Comportamento Esperado

- **RN-01 (Segurança de Segredos):** o script nunca imprime chaves de API (`apikey`), tokens JWT de autorização ou segredos em stdout, stderr ou JSON. Apenas a URL base sanitizada é exibida.
- **RN-02 (Resiliência de Configuração):** as variáveis `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` são carregadas a partir de `process.env` ou do arquivo `.env` local. Na ausência de qualquer uma delas, o script emite mensagem clara de orientação sem gerar stack trace desnecessário e retorna código 1.
- **RN-03 (Detecção Granular de Esquema):** a ausência de uma tabela ou de colunas específicas em tabelas existentes é diagnosticada individualmente com mensagens informativas (ex: tabela inexistente vs. coluna pendente de migração).
- **RN-04 (Conferência de Storage):** o bucket `book-photos` é verificado quanto à sua existência e capacidade de atendimento a requisições públicas.
- **RN-05 (Reconciliação de Migrações):** cada arquivo SQL versionado em `supabase/migrations/` é mapeado aos seus objetos correspondentes de esquema. O script informa explicitamente quais versões estão aplicadas e quais requerem aplicação pela equipe de banco de dados.
- **RN-06 (Formatos de Saída e Automação):** quando acionado com `--json`, todo output do console é suprimido em favor de um objeto JSON válido emitido em stdout, permitindo redirecionamento para arquivos ou ferramentas como `jq`.

## Critérios de Aceite

1. O script `scripts/verificar-migracoes-remotas.mjs` é executável via Node.js e está mapeado para `npm run health:supabase:remote` no `package.json`.
2. Execução sem credenciais emite erro amigável orientando a configuração de `.env` e encerra com código 1.
3. Nenhuma chave secreta ou token JWT é impresso no terminal ou nas estruturas de saída.
4. O script valida conectividade, tabelas, colunas críticas, bucket de storage e RPCs.
5. O script compara a lista de migrações locais de `supabase/migrations/` contra o ambiente remoto e relata as pendências identificadas.
6. A flag `--json` produz JSON válido contendo o diagnóstico detalhado e as migrações classificadas.
7. Testes unitários em `tests/unit/supabaseRemoteHealth.test.ts` cobrem conectividade, diagnóstico de tabelas/colunas, storage, RPCs, reconciliação de migrações e formatação, passando com 100% de sucesso.
8. O comando `npm run validate` executa sem erros em todas as suas fases.

## Validação

- Testes unitários com simulação de cenários de sucesso, erro de rede, colunas ausentes e migrações pendentes.
- Execução do script localmente com argumentos padrão e `--json`.
- Verificação geral via `npm run validate`.
