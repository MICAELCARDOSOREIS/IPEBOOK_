# Relatório executivo — Ipebook

**Data:** 27 de novembro de 2026 | **Versão do repositório:** `0.2.5` | **Branch:** `develop`

**Contexto:** Plataforma comunitária de circulação de livros em Piripiri, PI — IFPI Campus Piripiri (TADS, 2026)

---

## 1. Resumo executivo

- **Progresso.** A atualização Android `0.2.5` foi enviada à faixa fechada Alpha em 26/11. O iOS nativo recebeu login Apple, abas nativas e Liquid Glass. O app passou a tratar erros localmente após a remoção do Sentry. [Estado e continuidade](estado.md) · [ADR 0124](adr/0124-remocao-do-sentry.md)
- **Próximas verificações.** Confirmar acesso à build Alpha e o fluxo Android em aparelho físico. Homologar a interface iOS e o Web Push em iPhone. [Guia de homologação](desenvolvimento.md#homologar-ios)
- **Riscos.** No Waydroid, o cenário autenticado do Maestro deixou condicionais de onboarding, Google e entrega por QR Code para validação posterior. A revisão jurídica dos Termos e da Política de Privacidade segue pendente. [Suíte Android](../.maestro/README.md)

---

## 2. Situação por plataforma

| Plataforma | Último registro | Verificação pendente |
| --- | --- | --- |
| Android | `0.2.0` validada em aparelho físico. `0.2.5` submetida à faixa fechada Alpha | Confirmar a disponibilidade e validar a `0.2.5` em aparelho |
| Web / PWA | Domínio `ipebook.app`. Web Push configurado na prévia de iPhone em 26/11 | Confirmar a versão servida pelo domínio e o recebimento de avisos em iPhone |
| iOS nativo | Login Apple, abas nativas e Liquid Glass implementados | Homologação em iPhone e distribuição pelo TestFlight |

---

## 3. Linha do Tempo e Marcos

| Período | Marco |
| :--- | :--- |
| **13/10/2026** | Início do projeto com arquitetura MVVM, estratégia de testes e fundação do catálogo. |
| **Out – Início Nov/2026** | Integração Supabase (Auth, Postgres/RLS, Realtime, Storage), negociação com QR Code, moderação, ISBN, busca/alertas e Design System Ipê (tema escuro e acessibilidade WCAG 2.1 AA). |
| **12/11/2026** | Consolidação da versão `0.2.0` e publicação Web inicial em `https://ipebook.app`. |
| **16/11/2026** | Publicação da build Android `0.2.0` na Google Play Store e validação ponta a ponta em aparelho real. |
| **17/11/2026** | Suíte E2E Web via Chrome CDP (Spec 138 / ADR 0112), migração da suíte unitária/integração para Jest (ADR 0113) e especificação do iOS Nativo (Spec 137). |
| **18/11/2026** | Adoção do tema claro editorial em todas as plataformas (ADR 0114). |
| **24 a 26/11/2026** | Leitura sem conexão, endurecimento de RLS e LGPD, Web Push na prévia para iPhone e submissão Android `0.2.5` à Alpha. |
| **27/11/2026** | Remoção do Sentry e documentação da publicação iOS. |

---

## 4. Principais entregas do ciclo

- **Android.** Submissão do AAB da `0.2.5` para teste fechado. [Roteiro de publicação](loja/publicacao-terminal.md)
- **iOS.** Login Apple e retorno da recuperação de senha ao app, abas nativas e tratamento de Reduzir Transparência. [Spec 137](../specs/137-ios-nativo-apple-hig/spec.md) · [ADR 0123](adr/0123-liquid-glass-nativo-ios.md)
- **Web e PWA.** Web Push no app instalado no iPhone, com configuração na prévia de homologação. [ADR 0122](adr/0122-web-push-no-ipebook-instalado.md)
- **Consulta offline.** A última cópia do catálogo, da Estante e de detalhes visitados pode ser consultada ao perder a conexão. [Spec 142](../specs/142-leitura-sem-conexao/spec.md)
- **Conversas e Notificações.** Melhorias de navegação entre abas e filtros, apresentação do encontro confirmado e acessibilidade no chat. [Spec 141](../specs/141-melhorar-conversas-notificacoes/spec.md)

---

## 5. Escopo do Produto e Capacidades Atuais

### Regras da Beta (Piripiri, PI)
- **Atuação hiperlocal:** Exclusivo para **Piripiri, PI**, cobrindo **17 bairros oficiais** e **4 Pontos Seguros** para entrega presencial.
- **Modalidades:** Apenas **livros físicos** nas modalidades **Venda, Troca e Doação** (empréstimo e arquivos digitais estão fora de escopo).

### Capacidades Implementadas
- **Acesso e Onboarding:** Cadastro, login por e-mail e senha ou Google e login Apple no app iOS, recuperação e exclusão de conta (com limpeza de mídia), seleção inicial de bairro/ponto e página de convite ao beta.
- **Catálogo e Descoberta:** Tela inicial hiperlocal, busca com filtros por modalidade e *Boxes e coleções*, ordenação, histórico local, favoritos e alertas de busca.
- **Publicação e Estante:** Fluxo guiado em 3 passos com até 3 fotos otimizadas, scanner/consulta por ISBN, suporte a boxes (2 a 100 volumes), rascunhos locais, edição, pausa/retomada e gestão de anúncios.
- **Negociação, Encontro e Entrega:** Proposta com livro para troca e reserva atômica, chat em tempo real com linha do tempo, agendamento em Pontos Seguros com horários de expediente, confirmação presencial via **QR Code** (ou código de 8 caracteres), avaliação mútua (1–5★) e convite para avaliação na loja.
- **Notificações, Compartilhamento e PWA:** Push local e remoto com preferências por categoria, pré-visualização Open Graph em links compartilhados, compartilhamento rápido no WhatsApp e PWA responsivo e avisos Web Push no iPhone com o app instalado.
- **Segurança, Design e Acessibilidade:** Políticas RLS no Supabase, limites anti-abuso, bloqueio mútuo de usuários, denúncia de anúncios e pessoas, fila de moderação e Design System Ipê (Material 3 Expressive) com tema claro editorial e suporte a acessibilidade (WCAG 2.1 AA e TalkBack).

---

## 6. Infraestrutura e Integrações

| Serviço | Papel no Produto |
| :--- | :--- |
| **Supabase** | Autenticação, banco Postgres com RLS, Realtime (chat) e Storage (fotos) |
| **Cloudflare Pages** | Hospedagem Web/PWA (`https://ipebook.app`) e previews Open Graph |
| **Google Play & Google Sign-In** | Distribuição Android (`com.ipebook.app`) e login nativo |
| **Expo / EAS (`expo-updates`)** | Builds e atualizações OTA sem nova submissão na loja |
| **Relato local de erros** | `MemoryErrorReporter`, `SafeLogger` e interface de recuperação `AppErrorFallback` |
| **BrasilAPI, Open Library, Google Books e Crossref** | Consulta de metadados por ISBN |

---

## 7. Arquitetura, Governança e Indicadores Técnicos

- **Stack e Arquitetura:** React Native, Expo / Expo Router, TypeScript, Supabase, Jest, PGlite e Biome, em arquitetura **MVVM** desacoplada por contratos e injeção de dependências.
- **Portões de Qualidade (`npm run validate` e `npm run test:e2e`):** Checagem automática de tipos, lint, grafo de imports, design system, numeração de specs/ADRs, configuração de build, migrações SQL em PGlite, cobertura V8 no Jest, sincronia da documentação e E2E Web via Chrome CDP.

As medições atuais de testes, cobertura, migrações, rotas e documentação estão no [estado verificado](estado.md#1-estado-verificado-em-execução).

---

## 8. Equipe e Frentes de Trabalho

| Integrante | Frentes Principais |
| :--- | :--- |
| **Micael Cardoso Reis** | Arquitetura MVVM, governança/CI, Design System M3, validações automatizadas e recursos hiperlocais (bairros, QR Code, busca) |
| **Maria Clara Almeida Martins** | Identidade Visual e IHC (Design System Ipê), tema escuro, acessibilidade (WCAG 2.1 AA / TalkBack), onboarding, catálogo, perfil, estados de UI e iOS Nativo Apple HIG / Liquid Glass (ADRs 0115 e 0116) |
| **Antonio Carlos Gomes** | Ciclo de negociação, cadastro/gestão de anúncios, integração ISBN (BrasilAPI), boxes/coleções e moderação comunitária |

---
