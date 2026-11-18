# Relatório Final Consolidado da Equipe — Ipebook

**Projeto:** Ipebook — Aplicativo Comunitário de Circulação e Troca de Livros  
**Instituição:** Instituto Federal de Educação, Ciência e Tecnologia do Piauí (IFPI) — Campus Piripiri  
**Curso:** Tecnologia em Análise e Desenvolvimento de Sistemas (TADS)  
**Disciplinas:** Engenharia de Software III / Programação para Dispositivos Móveis  
**Responsável pela Consolidação:** Eric Vinícius dos Santos Oliveira  
**Data:** Outubro de 2026 *(atualizado em novembro de 2026 com a consolidação da entrega beta `0.2.0`)*  

---

## 1. Visão Geral e Contexto do Projeto

O **Ipebook** nasceu com o propósito de suprir a carência de uma plataforma hiperlocal dedicada à circulação, doação, venda acessível e troca de livros físicos no município de Piripiri - PI. 

Ao longo do semestre, o projeto evoluiu de uma ideia exploratória para uma plataforma robusta multiplataforma (Android publicado na Play Store e Web/PWA em [`https://ipebook.app`](https://ipebook.app)), alinhando padrões rigorosos de Engenharia de Software com as práticas recomendadas de Programação Móvel e IHC.

---

## 2. Consolidação das Entregas por Integrante

### 2.1 Micael Cardoso Reis
- **Arquitetura e Governança:** Concepção da estrutura MVVM sofisticada em 7 camadas (`app`, `view`, `viewmodel`, `usecase`, `model`, `infra`, `di`), automação do validador de fronteiras arquiteturais (`check:architecture`) e injeção de dependência explícita em 100% dos ViewModels (Spec 126 / ADR 0098).
- **Core de UI e Design System:** Implementação dos tokens visuais, componentes fundamentais, migração integral para o Material 3 Expressive (ADR 0084) e adoção tipográfica da Plus Jakarta Sans (ADR 0107).
- **Testes e Infraestrutura:** Pipeline de Integração Contínua (CI) com GitHub Actions, migração da suíte automatizada para Jest com cobertura V8 acima de 80% (ADR 0113), suíte E2E Web via Chrome CDP (Spec 138 / ADR 0112), publicação Android `0.2.0` na Play Store e deploy Web no Cloudflare Pages.
- **Funcionalidades Críticas:** Mecanismo hiperlocal por localidades/bairros de Piripiri, sistema de busca textual com trigramas PostgreSQL (`pg_trgm`), histórico de encontros em Pontos Seguros (ADR 0111) e confirmação por QR Code (ADR 0070).

### 2.2 Maria Clara Almeida Martins
- **Identidade e Interação Humano-Computador (IHC):** Estruturação do Design System formal, contratos de tokens semânticos, paleta inspirada no Ipê e tipografia serifada da marca.
- **Tema Escuro Integral (Dark Mode):** Arquitetura e infraestrutura de tokens dinâmicos para alternância entre tema claro e escuro (ADR 0036, Spec 044, Issue #144), além da migração integral de todos os componentes do Design System e das 28 telas restantes do aplicativo para suporte nativo ao tema escuro sem quebra de contraste (Spec 045, Issue #189, PR #195).
- **Acessibilidade Digital (WCAG 2.1 AA e TalkBack):** Execução e formalização da auditoria técnica de acessibilidade em 20 telas (`docs/auditoria-acessibilidade.md`, Issue #96), anúncio sonoro e gerenciamento de foco em mensagens de erro de formulário (Spec 042, Issue #147), navegabilidade completa por teclado e controle de foco em diálogos/modais na Web (Issue #105), agrupamento semântico de abas `tablist` (Issue #106) e associação acessível de erros a inputs de texto (Issue #104).
- **Trilha de Autenticação, Onboarding e Acesso:** Implementação dos fluxos de login por e-mail e Magic Link, tratamento resiliente de links expirados e e-mails duplicados (Spec 003 e Spec 033, Issue #97), telas de boas-vindas, fluxo de onboarding do primeiro acesso (Issue #98) e redefinição de senha.
- **Descoberta, Pesquisa e Catálogo Comunitário:** Construção das interfaces da Home, Pesquisa e Detalhe do Livro no Redesign V1 (Spec 006, Issue #56); criação de seções dinâmicas na Home com carrosséis de "Recém-adicionados" e "Livros para Doação" (Spec 041, Issue #146); persistência local de buscas recentes no dispositivo (Issue #94); fluxo de gerenciamento e edição de alertas de busca (Issue #95); e migração das telas de busca para o padrão `ScreenContainer` (Issue #215).
- **Perfil do Usuário, Hub de Navegação e Galeria Interativa:** Reestruturação do perfil de usuário como hub central de navegação (Spec 039, Fluxo 07, PR #182); gestão de preferências privadas com bairro padrão de Piripiri e telefone (Spec 034, Issue #141); perfil público de anunciantes e galeria interativa de fotos com suporte a gestos de swipe horizontal por toque e atalhos de teclado (Spec 038, Issue #143, Issue #73, PR #155, PR #180).
- **Pontos de Encontro Hiperlocais e Rotas em Mapas:** Mapeamento e especificação dos pontos físicos de encontro comunitário em Piripiri, detalhando endereço, horários de funcionamento e rotas integradas em aplicativos de mapa (Google Maps e OSM) para viabilizar as trocas presenciais com segurança (Spec 037, Issue #142, PR #175).
- **Compartilhamento Comunitário e WhatsApp:** Mecanismo nativo de compartilhamento de anúncios e livros no WhatsApp, com formatação rica de mensagens, links diretos e identidade da comunidade (Spec 019, Spec 040, Issue #74, Issue #145, PR #183).
- **Estados Globais de UI e Resiliência Operacional:** Padronização visual dos estados globais da aplicação: carregamento esqueleto (`Skeleton`), indicação de perda de conexão com reintento (`OfflineState`) e telas de erro amigáveis com auto-recuperação (Spec 021, Issue #76, ADR 0028).
- **iOS Nativo Apple HIG e Liquid Glass:** Concepção da base visual Liquid Glass para iOS (ADR 0115, Spec 137 T002), componente unificado `BottomSheet` com drag handle e cantos contínuos de 28 pt, adaptação de `ScreenContainer`, `ConnectedNavigationBar` e `TopAppBar` ao Apple HIG, suporte nativo a Reduzir Transparência (`useReduceTransparency`), utilitário de feedback tátil (`haptics.ts`), e refinamento completo das 22 telas de Descoberta, Busca, Favoritos, Alertas, Detalhe do Livro e Perfil Público para a experiência nativa iPhone/Apple HIG (ADR 0116, Spec 137 T004, Issue #229).
- **Modelagem de Domínio e Moderação:** Entidades centrais do núcleo de negócios (`Book`, `User`, `Rating`), contratos de casos de uso e integração com fluxos comunitários de avaliação, denúncias e segurança.

### 2.3 Antonio Carlos Gomes
- **Negociação e Ciclo de Vida do Livro:** Implementação dos casos de uso e infraestrutura da negociação simples (Spec 004), incluindo estados de pedido (pendente, aceito, concluído e cancelado).
- **Cadastro e Gestão de Anúncios:** Fluxo completo de anúncio de livros (Spec 003), validação de ISBN com integração à BrasilAPI e suporte a coleções/box de livros.
- **Segurança e Moderação:** Validação de regras de negócio, limites anti-abuso e painel de moderação para conformidade com termos da comunidade.

### 2.4 Eric Vinícius dos Santos Oliveira
- **Definição de Produto e Plataformas:** Condução e formalização da decisão estratégica inicial de plataformas (Android e Web prioritárias, evoluindo posteriormente para PWA Apple HIG na Spec 136 e planejamento de iOS Nativo na Spec 137).
- **Consolidação Técnica e Documental:** Elaboração deste relatório consolidado de entregas, guia de sincronização do Figma (`docs/relatorio-alinhamento-figma-e-evolucao-ux.md`) e rastreabilidade para a banca avaliadora.

---

## 3. Arquitetura e Decisões Técnicas (ADRs)

O projeto adotou o padrão de **Architecture Decision Records (ADRs)** desde a sua concepção, totalizando **113 decisões** registradas em [`docs/adr/README.md`](adr/README.md). Destacam-se:

| ADR | Decisão | Impacto |
| --- | --- | --- |
| **0002** | Expo + MVVM Sofisticado | Separação estrita em 7 camadas com injeção de dependências (`di/`) |
| **0003** | Estratégia ISO/IEC 25010 | Qualidade balizada em Adequação Funcional, Confiabilidade e Usabilidade |
| **0005** | Modalidades (Venda, Troca, Doação) | Flexibilidade no modelo comunitário sem transação monetária interna |
| **0012** | Supabase com Row Level Security (RLS) | Segurança e isolamento de dados no nível do banco |
| **0050** | Seletor de Bairro Comunitário | Enfoque hiperlocal específico para a realidade de Piripiri |
| **0070** | Conclusão de Troca via QR Code | Verificação presencial segura entre os moradores |
| **0084** | Adoção do Material 3 Expressive | Modernização visual com suporte a temas, feedback tátil e ergonomia |
| **0098** | Injeção de Dependência nos ViewModels | 100% dos ViewModels desacoplados do container (`make*ViewModel`) |
| **0107** | Tipografia Plus Jakarta Sans | Harmonização tipográfica da interface com a serifa da marca (`Source Serif 4`) |
| **0111** | Encontro sem Mapa (Pontos Seguros) | Escolha acessível entre os 4 pontos públicos sem dependência do Mapbox |
| **0112** | E2E Web via Chrome CDP | Validação ponta a ponta na Web em navegador real sem Playwright |
| **0113** | Migração de Vitest para Jest | Alinhamento ao executor padrão do ecossistema React Native/Expo |

---

## 4. Garantia da Qualidade e Cobertura de Testes

O projeto segue rigorosamente o modelo de qualidade da **ISO/IEC 25010**:

- **Verificação Automatizada:** `npm test` e `npm run test:coverage` com **Jest** (`coverageProvider: "v8"`, ADR 0113), cobrindo **2.300 testes em 312 arquivos** (unitários, hooks, componentes com RNTL, mocks isolados e integração), além de **7/7 cenários E2E Web via Chrome CDP** (`npm run test:e2e:build`, ADR 0112), checagem SQL/RLS via PGlite (`npm run test:sql`) e simulação automática local do CI/CD antes do push (`npm run ci:local` via `.githooks/pre-push`).
- **Métricas Atingidas (2026-11-17):**
  - Statements: **95%** (limiar mínimo: 80%)
  - Branches: **85,54%** (limiar mínimo: 80%)
  - Functions: **81,02%** (limiar mínimo: 80%)
  - Lines: **95%** (limiar mínimo: 80%)
- **Verificação Estática e Linting:** Biome configurado para análise estática sem reformatar em massa, acompanhado de validadores automáticos de camadas MVVM (`check:architecture`), design system (`check:design-system`), numeração (`check:numbering`), configuração de build (`check:build-config`) e sincronia documental (`check:docs`).

---

## 5. Conclusão e Estado Atual da Entrega

O Ipebook atinge com sucesso o marco de versão estável para o ciclo avaliativo, dispondo de:
1. Catálogo comunitário com paginação e filtros hiperlocais;
2. Autenticação (e-mail/senha e Google nativo) e perfil de usuário completos;
3. Fluxo de ponta a ponta de negociação, chat em tempo real, agendamento de encontro e conclusão por QR Code;
4. Leitor de código de barras para ISBN integrado à câmera (Open Library, Google Books, BrasilAPI e Crossref);
5. Suporte a anúncios individuais e box de livros;
6. Aplicativo Android `0.2.0` publicado na Google Play Store e aplicação Web/PWA responsiva publicada em `https://ipebook.app`.
