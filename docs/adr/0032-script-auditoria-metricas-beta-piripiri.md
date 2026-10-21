# 0032 — Script de auditoria e métricas agregadas da beta em Piripiri

Data: 2026-10-21. Status: aceito.

## Contexto

A fase beta comunitária em Piripiri, PI (estabelecida a partir do [ADR 0016](0016-restricao-beta-declaracao-piripiri.md) e da [Spec 022](../../specs/022-restricao-geografica-piripiri/spec.md)) necessita de acompanhamento operacional contínuo quanto à distribuição territorial por bairros, modalidades de circulação e status dos anúncios.

Ao mesmo tempo, as diretrizes de governança de dados e a LGPD (Lei nº 13.709/2018, Art. 5º, III e Art. 12) exigem que relatórios e métricas de observabilidade nunca exponham informações pessoais identificáveis (PII) dos cidadãos leitores (como e-mails, nomes, contatos telefônicos ou identificadores de conta).

Além disso, a equipe necessita executar auditorias em dois cenários:
1. Em ambiente local de desenvolvimento/CI via banco em memória PGlite;
2. Em ambiente de homologação/produção conectando-se ao backend Supabase.

## Decisão

1. Implementar `scripts/auditoria-metricas-beta.mjs`, expondo comando `npm run stats:beta` no `package.json`.
2. Prover módulo de agregação pura e desacoplada (`agregarMetricasBeta`), calculando agregações por bairro (17 bairros oficiais), modalidade e status de anúncios, além de métricas gerais e de negociação.
3. Garantir 100% de anonimização: a contagem de anunciantes baseia-se unicamente no total de titulares distintos (`count(distinct owner_id)`), descartando imediatamente qualquer UUID ou dado sensível em memória. Nenhuma saída (terminal, Markdown ou JSON) contém PII.
4. Suportar fonte de dados local (PGlite executando migrações SQL e semente de Piripiri) e fonte remota (Supabase REST API usando variáveis de ambiente já padronizadas no projeto).
5. Suportar três formatos de relatório: terminal amigável (padrão), Markdown estruturado (`--markdown`) e JSON puro (`--json`).

## Alternativas consideradas

- Script de consulta direta sem anonimização: rejeitado por violar a LGPD e a política de privacidade do IpêBook.
- Dependência de dashboard externo pago: rejeitada por custo desnecessário e falta de suporte a execuções locais autocontidas em PGlite.
- Executar apenas no Supabase: rejeitado porque inviabilizaria testes em pipelines locais e na CI sem credenciais remotas.

## Consequências

- Equipe operacional pode auditar a evolução da beta em Piripiri com um único comando (`npm run stats:beta`).
- Relatórios podem ser versionados ou integrados a pipelines em formato Markdown ou JSON.
- A privacidade da comunidade leitora de Piripiri fica preservada por design e testes automatizados.

Vínculos: [Spec 038](../../specs/038-metricas-beta-piripiri/spec.md), [ADR 0016](0016-restricao-beta-declaracao-piripiri.md), [ADR 0021](0021-indices-busca-e-robustez-operacional.md), [ADR 0025](0025-portabilidade-e-exportacao-dados-lgpd.md).
