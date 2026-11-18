# Status Report — Ipebook

**Data:** 17 de novembro de 2026 | **Versão:** `0.2.0` | **Branch:** `develop`  
**Contexto:** Plataforma comunitária de circulação de livros em Piripiri, PI — IFPI Campus Piripiri (TADS, 2026)

---

## 1. Resumo Executivo (3P)

- **Progresso:** Versão `0.2.0` concluída e **publicada na Google Play Store** (`com.ipebook.app`), com validação ponta a ponta em aparelho real usando duas contas (pedido, chat em tempo real, agendamento de encontro, QR Code de entrega, avaliação, notificações push, moderação, login com Google, Sentry e `expo-updates`). Suíte migrada de Vitest para **Jest** com provedor de cobertura V8 ([ADR 0113](adr/0113-migracao-vitest-para-jest.md)), reforçada com **suíte E2E Web automatizada via Chrome CDP** ([Spec 138](../specs/138-e2e-web-cdp/spec.md), [ADR 0112](adr/0112-e2e-web-cdp.md)), suíte E2E nativa Android em **Maestro** (`.maestro/*.yaml`, **4/4 fluxos aprovados no Waydroid** em sessão autenticada) e elevação da cobertura de *functions* para **85,19%** — somando **2.317 testes em 313 arquivos**, **7/7 cenários E2E Web verdes**, **46 arquivos de rota/layout** (`44` rotas navegáveis) e **43/43 migrações SQL** validadas — além de hooks Git locais (`ci:rapido` no `pre-commit` e `ci:local` espelhando o CI/CD no `pre-push`).
- **Planos:** Integrar na branch `develop` os ajustes de Jest, E2E Web CDP, fluxos `.maestro/`, cobertura ampliada e documentação sincronizada (`npm run validate`), atualizar a publicação Web/PWA em `https://ipebook.app` (Cloudflare Pages), executar os cenários condicionais de `.maestro/` que exigem conta secundária / encontro confirmado em aparelho físico, executar o plano de **iOS Nativo (Apple HIG / Liquid Glass)** especificado na [Spec 137](../specs/137-ios-nativo-apple-hig/spec.md) e concluir os itens pós-lançamento do beta.
- **Riscos e Atenção:**
  - A versão Web em produção (`https://ipebook.app`) ainda precisa ser republicada para refletir as correções recentes de PWA, SEO (`<title>` estático), remoção do Mapbox e layout desktop.
  - Nos fluxos Maestro (`.maestro/*.yaml`), os ramos condicionais que dependem de aparelho sem sessão (`E2E_CLEAR_STATE=true` e `Continuar com Google`) ou de conversa com encontro confirmado (`Entrega do livro` para câmera QR) foram pulados na sessão autenticada do Waydroid e seguem dependentes de conta de teste ou aparelho secundário.
  - Termos de Uso e Política de Privacidade em link público ainda aguardam revisão jurídica, ainda não há um segundo projeto Supabase em nuvem dedicado exclusivamente a testes/staging (E2E Web roda contra modo memória isolado e SQL valida localmente em PGlite), e não há ferramenta de analytics de produto (ex.: PostHog) ativa em produção.

---

## 2. Status por Plataforma e Canal

| Plataforma / Canal | Situação Atual | Observação |
| :--- | :--- | :--- |
| **Android** (`com.ipebook.app`) | **Publicado na Play Store (`0.2.0`)** | Validado ponta a ponta em aparelho real |
| **Web / PWA** (`https://ipebook.app`) | **No ar — republicação pendente** | Build local validado com 7/7 cenários E2E CDP; falta novo deploy no Cloudflare Pages |
| **iOS** | **PWA entregue · Nativo em implementação** | PWA adequado ao Apple HIG (Spec 136); no app nativo ([Spec 137](../specs/137-ios-nativo-apple-hig/spec.md)), base Liquid Glass ([ADR 0114](adr/0114-base-liquid-glass-apple-hig.md), T002) e Descoberta/Busca ([ADR 0115](adr/0115-padronizacao-apple-hig-descoberta-busca-ios.md), T004) já entregues por Maria Clara |

---

## 3. Linha do Tempo e Marcos

| Período | Marco |
| :--- | :--- |
| **13/10/2026** | Início do projeto com arquitetura MVVM, estratégia de testes e fundação do catálogo. |
| **Out – Início Nov/2026** | Integração Supabase (Auth, Postgres/RLS, Realtime, Storage), negociação com QR Code, moderação, ISBN, busca/alertas e Design System Ipê (tema escuro e acessibilidade WCAG 2.1 AA). |
| **12/11/2026** | Consolidação da versão `0.2.0` e publicação Web inicial em `https://ipebook.app`. |
| **16/11/2026** | Publicação da build Android `0.2.0` na Google Play Store e validação ponta a ponta em aparelho real. |
| **17/11/2026** | Suíte E2E Web via Chrome CDP (Spec 138 / ADR 0112), migração da suíte unitária/integração para Jest (ADR 0113) e especificação do iOS Nativo (Spec 137). |

---

## 4. Principais Entregas do Ciclo (01/11 – 17/11/2026)

- **Lançamento Beta Android (`0.2.0`):** Geração da build de produção, envio à Play Store e validação completa dos fluxos principais em dispositivos reais.
- **Experiência Web, PWA e E2E CDP:** Adequação ao Apple HIG no iPhone/Safari (Spec 136), redesenho de Notificações e Conversas em 3 colunas no desktop, `<title>` estático para SEO, correção de vazamento de memória no SSR em desenvolvimento e suíte E2E Web automatizada com Chrome CDP (Spec 138).
- **Migração para Jest e Qualidade Contínua:** Migração integral dos 312 arquivos de teste para Jest com `coverageProvider: "v8"` (ADR 0113), padronização visual dos estados de erro (Spec 131), quitação de dívidas de arquitetura/DI (Spec 126) e cadastro dos moderadores no Supabase.
- **Encontros e Compartilhamento:** Remoção definitiva do Mapbox mantendo a lista acessível dos 4 Pontos Seguros de Piripiri (ADR 0111), e abertura direta do WhatsApp ao compartilhar anúncios (ADR 0110).

---

## 5. Escopo do Produto e Capacidades Atuais

### Regras da Beta (Piripiri, PI)
- **Atuação hiperlocal:** Exclusivo para **Piripiri, PI**, cobrindo **17 bairros oficiais** e **4 Pontos Seguros** para entrega presencial.
- **Modalidades:** Apenas **livros físicos** nas modalidades **Venda, Troca e Doação** (empréstimo e arquivos digitais estão fora de escopo).

### Capacidades Implementadas
- **Acesso e Onboarding:** Cadastro, login por e-mail/senha ou Google, recuperação e exclusão de conta (com limpeza de mídia), seleção inicial de bairro/ponto e página de convite ao beta.
- **Catálogo e Descoberta:** Tela inicial hiperlocal, busca com filtros por modalidade e *Boxes e coleções*, ordenação, histórico local, favoritos e alertas de busca.
- **Publicação e Estante:** Fluxo guiado em 3 passos com até 3 fotos otimizadas, scanner/consulta por ISBN, suporte a boxes (2 a 100 volumes), rascunhos locais, edição, pausa/retomada e gestão de anúncios.
- **Negociação, Encontro e Entrega:** Proposta com livro para troca e reserva atômica, chat em tempo real com linha do tempo, agendamento em Pontos Seguros com horários de expediente, confirmação presencial via **QR Code** (ou código de 8 caracteres), avaliação mútua (1–5★) e convite para avaliação na loja.
- **Notificações, Compartilhamento e PWA:** Push local e remoto com preferências por categoria, pré-visualização Open Graph em links compartilhados, compartilhamento rápido no WhatsApp e PWA responsivo com tema claro/escuro.
- **Segurança, Design e Acessibilidade:** Políticas RLS no Supabase, limites anti-abuso, bloqueio mútuo de usuários, denúncia de anúncios e pessoas, fila de moderação e Design System Ipê (Material 3 Expressive) com tema claro/escuro e suporte a acessibilidade (WCAG 2.1 AA e TalkBack).

---

## 6. Infraestrutura e Integrações

| Serviço | Papel no Produto |
| :--- | :--- |
| **Supabase** | Autenticação, banco Postgres com RLS, Realtime (chat) e Storage (fotos) |
| **Cloudflare Pages** | Hospedagem Web/PWA (`https://ipebook.app`) e previews Open Graph |
| **Google Play & Google Sign-In** | Distribuição Android (`com.ipebook.app`) e login nativo |
| **Expo / EAS (`expo-updates`)** | Builds e atualizações OTA sem nova submissão na loja |
| **Sentry** | Monitoramento de erros em produção sem exposição de dados pessoais |
| **BrasilAPI** | Consulta automática de dados de livros por código ISBN |

---

## 7. Arquitetura, Governança e Indicadores Técnicos

- **Stack e Arquitetura:** React Native, Expo / Expo Router, TypeScript, Supabase, Jest, PGlite e Biome, em arquitetura **MVVM** desacoplada por contratos e injeção de dependências.
- **Portões de Qualidade (`npm run validate` e `npm run test:e2e`):** Checagem automática de tipos, lint, grafo de imports, design system, numeração de specs/ADRs, configuração de build, migrações SQL em PGlite, cobertura V8 no Jest, sincronia da documentação e E2E Web via Chrome CDP.

| Indicador | Valor Atual |
| :--- | :--- |
| **Testes automatizados** | **2.317 testes** em **313 arquivos** + **7/7 cenários E2E Web (CDP)** + **4 fluxos Maestro Android** (`.maestro/`, sintaxe validada) |
| **Cobertura (Statements / Lines)** | **95,26%** / **95,26%** |
| **Cobertura (Functions / Branches)** | **85,19%** / **86,05%** |
| **Saúde arquitetural** | **496 arquivos** sem violações de imports |
| **Rotas estáticas** | **46 arquivos** em `src/app/` (`44` rotas navegáveis) |
| **Documentação técnica** | **137 specs** e **115 ADRs** |
| **Migrações Supabase** | **43/43** aplicadas e validadas com PGlite |

---

## 8. Equipe e Frentes de Trabalho

| Integrante | Frentes Principais |
| :--- | :--- |
| **Micael Cardoso Reis** | Arquitetura MVVM, governança/CI, Design System M3, validações automatizadas e recursos hiperlocais (bairros, QR Code, busca) |
| **Maria Clara Almeida Martins** | Identidade Visual e IHC (Design System Ipê), tema escuro, acessibilidade (WCAG 2.1 AA / TalkBack), onboarding, catálogo, perfil, estados de UI e iOS Nativo Apple HIG / Liquid Glass (ADRs 0114 e 0115) |
| **Antonio Carlos Gomes** | Ciclo de negociação, cadastro/gestão de anúncios, integração ISBN (BrasilAPI), boxes/coleções e moderação comunitária |
| **Eric Vinícius dos Santos Oliveira** | Definição de escopo de produto e plataformas (Android/Web) e consolidação documental de conformidade e rastreabilidade |

---

## 9. Próximos Passos

1. **Fechamento da branch `develop`:** Revisar alterações locais (Jest, E2E Web CDP e documentação sincronizada), executar `npm run validate` e `npm run test:e2e` e registrar commit.
2. **Atualização Web (`https://ipebook.app`):** Gerar build Web (`npm run build:web`) e republicar no Cloudflare Pages.
3. **Evolução iOS Nativo (`Spec 137`):** Executar incrementalmente a adequação nativa de iPhone ao Apple HIG e Liquid Glass em feature branches derivadas de `develop`.
4. **Governança e Pós-lançamento Beta:** Concluir revisão jurídica dos Termos de Uso e Política de Privacidade em link público; avaliar adoção de analytics de uso (PostHog) e ambiente Supabase dedicado para testes.
