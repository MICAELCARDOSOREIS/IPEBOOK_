# Spec 038 — Script de Auditoria e Métricas Agregadas da Beta em Piripiri

**Responsável:** Micael (`pessoa:micael`)
**Data:** 21 de outubro de 2026
**Issue:** #179
**Tipo:** Operação e Observabilidade Comunitária

## Problema

Durante a fase beta comunitária do IpêBook em Piripiri, PI, a coordenação da plataforma e a equipe de operação necessitam acompanhar periodicamente a circulação de livros físicos na cidade:
1. Distribuição geográfica dos anúncios pelos 17 bairros oficiais de Piripiri.
2. Volume e proporção das três modalidades de circulação (Troca, Doação e Venda).
3. Ciclo de vida dos anúncios (disponíveis, reservados, pausados).
4. Volume de negociações/pedidos comunitários entre leitores.

Esse acompanhamento precisa ser realizado em estrita conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018), em particular os princípios de finalidade, necessidade e anonimização (Art. 5º, III e Art. 12). Não é admissível expor dados pessoais, e-mails, nomes, contatos ou UUIDs dos usuários da comunidade em relatórios ou exportações de métricas.

Além disso, a ferramenta precisa operar tanto em ambiente de desenvolvimento e testes locais (alimentando uma instância PGlite em memória a partir das migrações e sementes oficiais) quanto contra o banco remoto de produção/staging (Supabase REST API).

## Escopo

- Criação do script de linha de comando `scripts/auditoria-metricas-beta.mjs`.
- Registro do comando de conveniência `npm run stats:beta` no `package.json`.
- Módulo de agregação estatística desacoplado e testável (`agregarMetricasBeta`), calculando:
  - Totais gerais: livros cadastrados, contagem anônima de anunciantes únicos e média de livros por anunciante.
  - Distribuição geográfica por bairro oficial de Piripiri (com cobertura, percentual e quebra por modalidade).
  - Distribuição por modalidade (Troca, Doação, Venda) com cálculo de preço médio, mínimo e máximo para livros vendidos.
  - Distribuição por status do anúncio (Disponível, Reservado, Pausado).
  - Métricas agregadas de pedidos e negociações (se presentes na base).
- Suporte a dois modos de execução:
  - Modo Local (`--local` ou padrão): inicializa PGlite com migrações e semente de Piripiri.
  - Modo Remoto (`--remote`): consulta endpoints REST do Supabase utilizando credenciais seguras do ambiente/arquivo `.env`.
- Formatação de saída com múltiplas opções:
  - Terminal (padrão): relatório formatado em texto com caracteres de tabela e sumários.
  - Markdown (`--markdown` ou `-m`): documentação legível e versionável em Markdown.
  - JSON (`--json` ou `-j`): carga de dados estruturada para automações ou dashboards.
- Garantia de Privacidade e LGPD:
  - Nenhuma informação de identificação pessoal (PII) é exposta nas saídas.
  - Verificação automatizada de ausência de identificadores pessoais (UUIDs, e-mails, nomes).
- Testes unitários cobrindo agregação, formatação e verificação LGPD.

## Regras de Negócio e Comportamento Esperado

- **RN-01 (Vocabulário Territorial Piripiriense):** a agregação geográfica utiliza como referência os 17 bairros oficiais de Piripiri (`PIRIPIRI_NEIGHBORHOODS`), permitindo avaliar a taxa de cobertura territorial da beta na cidade.
- **RN-02 (Modalidades de Circulação):** o cálculo de modalidades agrupa livros em Troca (`trade`), Doação (`donation`) e Venda (`sale`), calculando estatísticas de preço exclusivamente para os itens à venda.
- **RN-03 (Status dos Anúncios):** anúncios são contabilizados por status (`available`, `reserved`, `paused`).
- **RN-04 (Anonimização Estrita LGPD):** métricas de anunciantes reportam apenas o número cardinal de anunciantes distintos (`count(distinct owner_id)`). Nenhum UUID, e-mail, nome, telefone ou fotografia pessoal é exposto nas estruturas finais de métricas.
- **RN-05 (Resiliência de Origem):** em modo local, o script opera de maneira autocontida via PGlite. Em modo remoto, havendo indisponibilidade de rede ou ausência de variáveis de ambiente, o script emite mensagem clara de diagnóstico sem mascarar falhas.
- **RN-06 (Formatos de Saída):** as flags `--json` e `--markdown` geram saída pura para stdout, permitindo redirecionamento para arquivos ou pipes em scripts de automação.

## Critérios de Aceite

1. O comando `npm run stats:beta` executa sem erros e emite relatório legível no terminal com as agregações de bairros, modalidades e status.
2. O comando `npm run stats:beta -- --json` produz JSON válido contendo exclusivamente dados estatísticos agregados.
3. O comando `npm run stats:beta -- --markdown` produz documento Markdown estruturado contendo tabelas e resumo operacional.
4. O script suporta execução local via PGlite e remota via Supabase REST API (`--remote`).
5. A saída gerada em qualquer formato não contém e-mails, nomes de usuários ou identificadores pessoais (verificação LGPD 100% aprovada).
6. Testes unitários em `tests/unit/betaMetricsAggregator.test.ts` cobrem os cálculos de agregação, cenários com dados vazios e conformidade LGPD.
7. O comando `npm run validate` passa com sucesso em todas as verificações do projeto.

## Validação

- Testes unitários cobrindo o agregador, as saídas formatadas e a garantia LGPD.
- Execução direta dos três modos de saída (`terminal`, `--json`, `--markdown`) e do comando `npm run stats:beta`.
- Verificação completa via `npm run validate`.
