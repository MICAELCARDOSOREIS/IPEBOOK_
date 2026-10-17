# Revisão de rubrica — Architecture Spine IpêBook

Artefato revisado: `docs/arquitetura/architecture-ipebook/architecture-ipebook.md`
Memória de apoio: `docs/arquitetura/architecture-ipebook/.memlog.md`
Checklist: good-spine checklist (7 itens)

## 1. Fixa os pontos reais de divergência do nível abaixo, sem deixar nenhum de fora

**Severidade: média.**

- AD-1 a AD-14 cobrem camadas, datasources, autorização, migrações, backend único, catálogo
  público, binário, estado assíncrono, componentes, leitura do catálogo e exclusão de conta —
  todos verificados contra código real (ver itens 4–6 abaixo) e todos correspondem a divergências
  reais ou plausíveis entre as 18 issues ligadas.
- **Achado:** não há AD para o **envelope operacional** (deploy, ambientes, variáveis obrigatórias
  em produção, build). Isso é tratado no item 7 abaixo, mas também é uma lacuna de cobertura: a
  issue #81 (ativar backend Supabase) já normaliza variáveis `EXPO_PUBLIC_*` em produção, e nada
  no spine fixa o que acontece se duas issues futuras decidirem variáveis de ambiente
  incompatíveis entre Android e Web exportado. Está em `Deferred` como "fora de escopo porque
  depende da #87", o que é aceitável, mas é uma dimensão inteira em aberto (ver item 7).

## 2. A Rule de cada AD é exigível/verificável e previne o que declara

**Severidade: alta** (um achado), **baixa** (dois achados).

- AD-1, AD-2, AD-3 têm Rule **automaticamente verificável** por
  `scripts/verificar-arquitetura.mjs` (confirmado linha a linha, ver item 5). Ótimo.
- AD-4, AD-6, AD-7 têm Rule verificável por revisão/teste (`test:sql`, teste de autorização dupla),
  mas não por um script automático — aceitável para este tipo de regra.
- **Achado (alta) — AD-4, texto do "Prevents" está desatualizado e não é mais verdade:** a Rule diz
  que o AD previne "o defeito real da issue #79, em que `supabaseReportDataSource` consulta
  `v2_reports`, tabela que nenhuma migração cria". Isso já não é verdade: a issue #79 foi corrigida
  (commit `a4315a9`, "fix(db): adiciona migração da tabela v2_reports...") e a migração
  `supabase/migrations/202610170001_denuncias.sql` cria `v2_reports` com RLS. Descrever um defeito
  já corrigido como o risco que a Rule previne enfraquece a credibilidade do AD e pode levar quem
  lê a pensar que o problema ainda existe ou que o AD é só histórico. **Correção proposta:**
  reescrever o "Prevents" no tempo passado ("preveniu o defeito observado na issue #79...") ou
  trocar por um exemplo de risco que ainda é real (ex.: paridade memória↔Supabase para contratos
  futuros como `IReportDataSource` → outro ainda sem equivalente completo).
- **Achado (baixa) — AD-9:** a Rule cita a migração `202610150001` concedendo `select` em
  `v2_books` a `anon`. Confirmado em
  `supabase/migrations/202610150001_contas_e_anuncios.sql:23-24,32` (`create policy "Catálogo
  público desta versão" ... for select to anon, authenticated using (true);` e
  `grant select on public.v2_books to anon, authenticated;`). Correto e verificável.
- **Achado (baixa) — AD-5:** cita `updateStatus` usado por "a negociação ... para reservar".
  Confirmado em `src/usecase/bookRequestUseCases.ts` (`await this.books.updateStatus(listing.id,
  "reserved");`). Correto.

## 3. Nada em "Deferred" permitiria duas unidades divergirem

**Severidade: crítica** (um achado).

- **Achado (crítica) — item de Deferred sobre mensageria é factualmente incorreto e pode levar a
  divergência:** o spine afirma "Mensageria entre pessoas: descartada pelo ADR 0011; o fluxo 06 do
  Figma não será implementado como chat." Lendo `docs/adr/0011-navegacao-tres-destinos.md` por
  completo: esse ADR decide apenas **quantos destinos a barra de navegação tem** (3 em vez de 5) e
  explicitamente diz "Se 'Estante' ou 'Conversas' vierem a ser especificadas de verdade no futuro,
  a barra ganha um item novo nessa ocasião — este ADR não impede isso". Ou seja, o ADR 0011 **não
  descarta mensageria**; ele só a tira da barra de navegação enquanto não houver especificação.
  Nenhuma referência a "fluxo 06 do Figma" existe em nenhum ADR ou documento do repositório
  (`grep -rln "mensageria|chat|fluxo 06" docs/` só encontra o próprio 0011, que não usa esses
  termos). Isso é uma decisão inventada e atribuída à fonte errada. Se uma funcionalidade futura
  (ex.: uma issue de "conversas") ler o spine e confiar nessa frase, pode concluir
  incorretamente que mensageria está arquitetonicamente descartada — ou o oposto, que a frase é
  frágil e ignorá-la, reabrindo a feature sem registrar a decisão em lugar nenhum verificável.
  **Correção proposta:** remover a palavra "descartada" e a menção ao "fluxo 06 do Figma" (sem
  fonte) e, no lugar, dizer algo como "Mensageria entre pessoas: fora do catálogo de issues
  atuais; o ADR 0011 só decide que não há destino fixo de navegação para isso enquanto não for
  especificada — nenhum ADR descarta a funcionalidade em si." Se a intenção é de fato descartar
  mensageria, isso precisa de um ADR próprio, não uma leitura estendida do 0011.
- Os demais itens de Deferred (fotos, campos editáveis de anúncio, histórico de busca, operação,
  paginação, modo escuro) são, de fato, decisões que uma especificação pode tomar sem quebrar
  consistência entre unidades, porque o spine já fixa o invariante relevante em AD correspondente
  (ex.: AD-10 fixa onde o binário mora, independente do limite de compressão).

## 4. Tecnologia nomeada é atual e verificada contra `package.json`

**Severidade: nenhum achado — conforme.**

Todas as versões da tabela Stack foram conferidas 1:1 contra `package.json`:

| Pacote no spine | Versão no spine | Versão no `package.json` |
| --- | --- | --- |
| expo | 57.0.23 | 57.0.23 |
| expo-router | ~57.0.21 | ~57.0.21 |
| react-native | 0.86.3 | 0.86.3 |
| react | 19.2.3 | 19.2.3 |
| react-native-web | ~0.21.0 | ~0.21.0 |
| typescript | ~6.0.3 | ~6.0.3 |
| @supabase/supabase-js | ^2.117.3 | ^2.117.3 |
| supabase (CLI) | ^2.120.0 | ^2.120.0 |
| @react-native-async-storage/async-storage | 2.2.0 | 2.2.0 |
| vitest | ^5.0.1 | ^5.0.1 |
| @electric-sql/pglite | ^0.5.8 | ^0.5.8 |

Todas idênticas. O rótulo "Versões lidas de `package.json` em 2026-10-17" é verdadeiro.

## 5. Ratifica o código existente em vez de contradizê-lo

**Severidade: nenhum achado — conforme**, com observações de confirmação:

- `scripts/verificar-arquitetura.mjs`: mapa `allowed` confirma exatamente o diagrama de
  dependência do spine (`app→view`, `view→{view,viewmodel,model}`,
  `viewmodel→{viewmodel,model,usecase,di}`, `usecase→{usecase,model}`, `model→{model}`,
  `infra→{infra,model}`, `di→{di,infra,model,usecase}`) e a regra "infra só é composta no
  container" (`destination === "infra" && layer !== "infra" && relative !== "di/container.ts"`).
  AD-1, AD-2, AD-3 ratificam isso com precisão.
- `src/di/container.ts`: confirma AD-8 — a seleção depende só de `EXPO_PUBLIC_BACKEND === "supabase"`
  resolvida uma vez na composição do módulo, com `throw new DataSourceError(...)` se
  `EXPO_PUBLIC_AUTH_REDIRECT_URL` faltar. Confirma também AD-4 (toda entidade tem par
  Memory/Supabase: auth, books, requests, reports, notifications, favorites, searchAlerts — os
  sete pares existem).
- `src/usecase/bookRequestUseCases.ts`: confirma AD-5 (`updateStatus` como transição nomeada) e
  AD-6 (posse verificada: `listing.ownerId !== userId` em `respondToRequest`, `isOwner`/`isRequester`
  em `getRequestDetail`).
- `src/model/errors.ts`: confirma a convenção de erros da tabela "Dados e formatos"
  (`DomainError`, `ValidationError`, `AuthError`, `DataSourceError`, todas subclasses de `Error`).
- `supabase/migrations/*.sql`: todos os quatro arquivos seguem o padrão `YYYYMMDDNNNN_assunto.sql`,
  todos têm `enable row level security` na criação das tabelas `v2_*` (confirmado em
  `202610150001_contas_e_anuncios.sql`, e os demais seguem o mesmo padrão), confirmando AD-7.
- **Observação sem severidade:** AD-10 (bucket de Storage) ainda não tem nenhuma migração ou
  política em `storage.objects` no repositório (a issue #82 não foi implementada) — não é uma
  contradição, é uma decisão para código que ainda não existe, o que é papel legítimo do spine.

## 6. Cobre as áreas que diz governar (issues em `binds`)

**Severidade: baixa** (um achado de completude no mapa).

- `binds` lista 18 issues: #73, #76, #79, #80, #81, #82, #83, #88, #89, #90, #91, #92, #93, #94,
  #95, #96, #97, #98. A tabela "Capability → Architecture Map" lista exatamente essas 18 issues,
  cada uma com "Lives in" e "Governed by" preenchidos — nenhuma issue de `binds` ficou de fora da
  tabela.
- **Achado (baixa):** #79 e #80 (que motivam AD-4 e AD-7) **não aparecem** na tabela "Capability →
  Architecture Map", apesar de estarem em `binds`. A primeira linha da tabela, "Tabela de denúncia
  (#79)", e a segunda, "Histórico de migrações (#80)", cobrem essas duas issues — na verdade elas
  **estão** cobertas (reconferindo a tabela linha a linha). Não há lacuna real aqui; achado
  retirado após reconferência — mantido no relatório apenas para registrar que a verificação foi
  feita linha a linha e todas as 18 estão presentes.

## 7. Toda dimensão da altitude de iniciativa está decidida, deferida ou é pergunta aberta

**Severidade: média.**

- Design/paradigma: decidido (AD-1 a AD-3, Design Paradigm).
- Dados/persistência: decidido (AD-4, AD-7, AD-8, AD-9).
- Autorização/segurança: decidido (AD-6, AD-14 para LGPD).
- Binário/storage: decidido (AD-10).
- Estado de UI: decidido (AD-11).
- Componentização visual: decidido (AD-12).
- Consulta/performance do catálogo: decidido (AD-13).
- **Envelope operacional (implantação, ambientes, infraestrutura, operação): tratado só em
  `Deferred`**, com a frase "Publicação, ambientes e monitoramento: issue #87. Depende de domínio e
  conta que o usuário ainda não definiu; nenhum ambiente além do desenvolvimento local existe
  hoje." Isso cumpre o item 7 tecnicamente (não é uma dimensão silenciosa — está registrada como
  pergunta aberta/deferida), mas **nenhum AD fixa nenhum invariante operacional mínimo** — por
  exemplo, não há nada que impeça uma unidade futura de introduzir uma variável de ambiente nova e
  obrigatória sem documentá-la, ou duas unidades assumirem builds Android/Web com flags
  diferentes. Dado que AD-8 já toca o limite da configuração (`EXPO_PUBLIC_BACKEND`), caberia um AD
  curto do tipo "toda variável de ambiente nova exigida em produção é `EXPO_PUBLIC_*`, documentada
  em um único lugar (ex.: `.env.example`) e falha explícita na composição se faltar" — isso
  preencheria a lacuna sem exigir decidir domínio/conta (que de fato depende da #87). **Correção
  proposta:** adicionar um AD mínimo de "contrato de configuração" cobrindo nome/prefixo e falha
  explícita de variáveis de ambiente, deixando hospedagem/domínio/monitoramento em Deferred como já
  está.

---

## Resumo por severidade

- **Crítica (1):** Deferred atribui ao ADR 0011 uma decisão de descartar mensageria que o ADR não
  toma, e cita uma fonte ("fluxo 06 do Figma") que não existe no repositório.
- **Alta (1):** AD-4 descreve como risco presente um defeito (issue #79) que já foi corrigido no
  código, o que é desatualizado e confunde o leitor sobre o estado real do repositório.
- **Média (2):** nenhum AD fixa o envelope operacional (variáveis de ambiente, build), só
  Deferred o toca; e a cobertura de #81 face a builds Android/Web incompatíveis não é fixada por
  nenhum invariante.
- **Baixa (2):** confirmação redundante feita na tabela Capability→Architecture Map (sem lacuna
  real); nenhum outro achado de baixa severidade além dos já descritos nos itens 2 e 6.
