# Revisão de realidade — Architecture Spine IpêBook

Data: 2026-10-17
Artefato revisado: `docs/arquitetura/architecture-ipebook/architecture-ipebook.md`
Repositório verificado: worktree `arquitetura-spine` (local)

## 1. Tabela Stack vs `package.json`

| Linha do spine | package.json | Veredito |
| --- | --- | --- |
| Expo 57.0.23 | `"expo": "57.0.23"` | Confirmado (valor exato, fixado sem `^`/`~`) |
| Expo Router ~57.0.21 | `"expo-router": "~57.0.21"` | Confirmado o valor; **não fixada** (`~` permite patches automáticos) |
| React Native 0.86.3 | `"react-native": "0.86.3"` | Confirmado, fixado |
| React 19.2.3 | `"react": "19.2.3"` | Confirmado, fixado |
| react-native-web ~0.21.0 | `"react-native-web": "~0.21.0"` | Confirmado o valor; não fixada |
| TypeScript ~6.0.3 | `"typescript": "~6.0.3"` | Confirmado o valor; não fixada |
| @supabase/supabase-js ^2.117.3 | `"@supabase/supabase-js": "^2.117.3"` | Confirmado o valor; não fixada (`^` permite minor) |
| Supabase CLI ^2.120.0 | `"supabase": "^2.120.0"` | Confirmado o valor; não fixada |
| @react-native-async-storage/async-storage 2.2.0 | `"@react-native-async-storage/async-storage": "2.2.0"` | Confirmado, fixado |
| Vitest ^5.0.1 | `"vitest": "^5.0.1"` | Confirmado o valor; não fixada |
| @electric-sql/pglite ^0.5.8 | `"@electric-sql/pglite": "^0.5.8"` | Confirmado o valor; não fixada |

**Achado:** Todos os valores de versão batem com `package.json` — nenhum número inventado. Mas o próprio spine apresenta os números do `package.json` (que usa `^`/`~` para a maioria das libs) sem avisar que isso é um intervalo, não uma versão fixa. A nota de rodapé do spine ("Versões lidas de `package.json`... o repositório é o dono delas") cobre a proveniência, mas não deixa explícito que 8 das 11 linhas são faixas, não valores travados — um leitor rápido pode tratá-las como pinadas. **Correção proposta:** marcar na tabela (ex. coluna extra ou nota) quais entradas são fixas vs. faixa, já que o próprio documento valoriza precisão.

## 2. Tecnologias nomeadas — existem e servem ao caso

### AD-1 — Expo Router
**Verificado:** busca na web (resultados de outubro/2026) confirma Expo Router ativo, versão mais recente da série 57.0.x publicada há poucos dias, alinhado ao Expo SDK 57 (57.0.29 mais recente). SDK tem ciclo de suporte de ~1 ano.
**Fonte:** busca web (npm, expo.dev/changelog/sdk-57, docs.expo.dev) em 2026-10-17.
**Veredito:** Confirmado — Expo Router é atual e mantido, compatível com a versão de Expo travada no projeto.

### AD-10 — Bucket público do Supabase Storage + RLS de escrita por dono
**Verificado via `context7` (`/websites/supabase_guides`, docs oficiais Supabase):**
- Bucket público é servido por URL direta (`.../storage/v1/object/public/[bucket]/[asset]`) **sem exigir política de SELECT em `storage.objects`** — a doc de "Rationale" dos advisors do Supabase diz textualmente: *"Supabase public buckets are already readable by URL. They do not need a SELECT policy on storage.objects for clients to fetch known object paths."*
- O mesmo advisor alerta que combinar bucket público **com** uma política SELECT ampla (`bucket_id = 'x'` ou `true`) é o "footgun": isso torna o bucket listável via API de Storage, uma exposição maior que o pretendido.
- Padrão de restrição de escrita por pasta existe e é documentado oficialmente: `(storage.foldername(name))[1] = '<valor>'` em política `for insert`/`for delete` — o mesmo mecanismo que AD-10 descreve ao propor caminho `ownerId/listingId/`.
- Política de DELETE por dono documentada oficialmente usa `owner = (select auth.uid()::text)`.

**Veredito sobre o ponto central da revisão (visitante anônimo lendo a foto sem servidor para URL assinada):** Confirmado como abordagem corrente e correta. Bucket público dispensa `createSignedUrl` e dispensa até política de SELECT — a leitura é por URL pública direta, sem backend. AD-10 está alinhado com a documentação oficial atual.
**Ressalva não coberta pelo spine:** AD-10 fixa "escrita e remoção restritas ao dono por política em `storage.objects`" mas não diz explicitamente que **não deve existir política de SELECT ampla** nesse bucket (o footgun que a própria Supabase documenta). Como o bucket é público, a ausência de SELECT policy é o comportamento correto (leitura por URL, não por listagem autorizada) — mas isso não está escrito no spine, e uma implementação futura poderia adicionar sem querer uma política SELECT para "autenticated" ou "anon" pensando que é necessária, criando o problema de enumeração que a documentação do Supabase alerta.
**Correção proposta:** adicionar a AD-10 uma frase proibindo política de `select`/`all` em `storage.objects` para esse bucket, citando que a leitura pública já ocorre por URL.

**Não verificado neste repositório:** nenhuma migração ou arquivo de infra ainda implementa o bucket ou as políticas de Storage descritas em AD-10 (busquei por `bucket`/`storage.objects` em `supabase/migrations/*.sql` e `src/infra/` e não encontrei nada além de `src/infra/supabaseClient.ts`, que só instancia o cliente). Isso é esperado — a seção "Deferred" do próprio spine marca isso como trabalho futuro da issue #82 — mas reforça que AD-10 é uma decisão ainda não materializada em código, não uma prática já rodando.

## 3. Afirmações sobre o próprio projeto (grep)

| Afirmação do spine | Comando/verificação | Resultado |
| --- | --- | --- |
| "a migração `202610150001` já concede `select` em `v2_books` a `anon`" (AD-9) | `grep -n "anon" supabase/migrations/202610150001_contas_e_anuncios.sql` | **Confirmado**: linha 24 `for select to anon, authenticated using (true)` e linha 32 `grant select on public.v2_books to anon, authenticated;` |
| "`v2_reports`, tabela que nenhuma migração cria" (AD-4) / "REPORT consta no modelo e no adaptador Supabase, mas ainda não existe como tabela — é a issue #79" (seção ER) | `grep -rn "v2_reports" supabase/migrations/ src/` | **DIVERGENTE.** A migração `supabase/migrations/202610170001_denuncias.sql` **já cria** `public.v2_reports` (linha 4), com índices, RLS habilitado (linha 16) e grants para `authenticated` (linha 33). A tabela existe desde 2026-10-17 — mesma data do próprio spine. O texto "ainda não existe como tabela" e o enquadramento de AD-4 como "o defeito real da issue #79" (presente, não passado) estão desatualizados em relação ao estado real do repositório no momento da revisão. |
| `updateStatus` existe no contrato de dados (AD-5) | `grep -rn "updateStatus" src/model/datasources/` | **Confirmado**: `src/model/datasources/iBookDataSource.ts:7` — `updateStatus(id: string, status: Book["status"]): Promise<Book>;` |
| Mapa `allowed` de `scripts/verificar-arquitetura.mjs` corresponde ao diagrama de dependência do spine | Leitura do arquivo e comparação com o `graph TD` do spine | **Confirmado.** `allowed = { app:[view], view:[view,viewmodel,model], viewmodel:[viewmodel,model,usecase,di], usecase:[usecase,model], model:[model], infra:[infra,model], di:[di,infra,model,usecase] }` reproduz exatamente as setas do diagrama (app→view; view→view/viewmodel/model; viewmodel→viewmodel/model/usecase/di; usecase→usecase/model; infra→infra/model; di→di/infra/model/usecase). |
| `pglite` é usado por `npm run test:sql` | `package.json` linha 15 (`"test:sql": "node scripts/verificar-migracoes.mjs"`) + `scripts/verificar-migracoes.mjs` linha 2 (`import { PGlite } from '@electric-sql/pglite'`) | **Confirmado.** |

## Achado mais grave

A seção "Capability → Architecture Map" e a entrada "Deferred" **não** listam mais a #79 como pendente de criação de tabela (o deferred list realmente não cita #79), mas o corpo do documento (AD-4 e o diagrama ER) ainda descreve `v2_reports` como inexistente — e isso é falso: a tabela já foi criada por migração datada do mesmo dia da redação do spine. Isso é exatamente o tipo de afirmação "de memória" que não foi conferida contra o estado real do repositório antes de fechar o documento.

## Resumo de veredictos

- Confirmado: tabela Stack (todos os valores), AD-9 (grant anon), `updateStatus`, mapa `allowed`, uso de `pglite`, AD-1 (Expo Router atual e mantido), abordagem de bucket público para leitura anônima sem servidor (AD-10, mecanismo central).
- Divergente: afirmação de que `v2_reports` "ainda não existe como tabela" (ER diagram) e framing de AD-4 no presente — a tabela já existe no repositório.
- Lacuna/risco não coberto: AD-10 não proíbe explicitamente política de SELECT ampla em `storage.objects` para o bucket público, que a própria documentação do Supabase assinala como footgun de enumeração.
- Não materializado ainda (esperado, consta em "Deferred"): nenhuma migração ou código de infra implementa de fato o bucket/políticas de Storage de AD-10.
- Observação secundária: 8 das 11 linhas da tabela Stack usam faixas (`^`/`~`), não versões fixas — os valores estão corretos, mas o documento não sinaliza essa diferença.
