# Status Report — Ipebook

**Data:** 16 de novembro de 2026 | **Versão:** `0.2.0` | **Branch:** `develop`  
**Contexto:** Plataforma comunitária de circulação de livros em Piripiri, PI — IFPI Campus Piripiri (TADS, 2026)

---

## 1. Resumo Executivo (3P)

- **Progresso:** Versão `0.2.0` concluída e **publicada na Google Play Store** (`com.ipebook.app`), com validação ponta a ponta em aparelho real usando duas contas (pedido, chat em tempo real, agendamento de encontro, QR Code de entrega, avaliação, notificações push, moderação, login com Google, Sentry e `expo-updates`). Base estabilizada com **2.300 testes**, **46 rotas** e **43/43 migrações SQL** aplicadas no Supabase.
- **Planos:** Consolidar os ajustes finais da branch `develop` (`npm run validate`), atualizar a publicação Web/PWA em `https://ipebook.app` (Cloudflare Pages) e fechar os itens pós-lançamento do beta.
- **Riscos e Atenção:**
  - A versão Web em produção (`https://ipebook.app`) ainda precisa ser republicada para refletir as correções recentes de PWA, SEO e layout desktop.
  - A cobertura de *branches* está em **80,51%** (margem curta acima do piso de 80%).
  - Termos de Uso e Política de Privacidade em link público ainda aguardam revisão jurídica, e ainda não há ferramenta de analytics de produto (ex.: PostHog) ativa em produção.

---

## 2. Status por Plataforma e Canal

| Plataforma / Canal | Situação Atual | Observação |
| :--- | :--- | :--- |
| **Android** (`com.ipebook.app`) | **Publicado na Play Store (`0.2.0`)** | Validado ponta a ponta em aparelho real |
| **Web / PWA** (`https://ipebook.app`) | **No ar — republicação pendente** | Falta subir build com melhorias de PWA, SEO e 3 colunas desktop |
| **iOS** | **Via PWA (Safari)** | Adequado ao Apple HIG; app nativo fora do escopo inicial |

---

## 3. Linha do Tempo e Marcos

| Período | Marco |
| :--- | :--- |
| **13/10/2026** | Início do projeto com arquitetura MVVM, estratégia de testes e fundação do catálogo. |
| **Out – Início Nov/2026** | Integração Supabase (Auth, Postgres/RLS, Realtime, Storage), negociação com QR Code, moderação, ISBN, busca/alertas e Design System Ipê (tema escuro e acessibilidade WCAG 2.1 AA). |
| **12/11/2026** | Consolidação da versão `0.2.0` e publicação Web inicial em `https://ipebook.app`. |
| **16/11/2026** | Publicação da build Android `0.2.0` na Google Play Store e validação ponta a ponta em aparelho real. |

---

## 4. Principais Entregas do Ciclo (01/11 – 16/11/2026)

- **Lançamento Beta Android (`0.2.0`):** Geração da build de produção, envio à Play Store e validação completa dos fluxos principais em dispositivos reais.
- **Experiência Web e PWA:** Adequação ao Apple HIG no iPhone/Safari, redesenho de Notificações e Conversas em 3 colunas no desktop, padronização de superfícies em telas largas, `<title>` estático para SEO e correção de vazamento de memória no SSR em desenvolvimento.
- **Encontros e Compartilhamento:** Remoção definitiva do Mapbox mantendo a lista acessível dos 4 Pontos Seguros de Piripiri com rotas diretas, e abertura direta do WhatsApp ao compartilhar anúncios.
- **Qualidade e Operação:** Padronização visual dos estados de erro, quitação de dívidas de arquitetura/injeção de dependências e cadastro dos moderadores no Supabase.

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

- **Stack e Arquitetura:** React Native, Expo / Expo Router, TypeScript, Supabase, Vitest, PGlite e Biome, em arquitetura **MVVM** desacoplada por contratos e injeção de dependências.
- **Portões de Qualidade (`npm run validate`):** Checagem automática de tipos, lint, grafo de imports, design system, numeração de specs/ADRs, configuração de build, migrações SQL em PGlite e cobertura de testes.

| Indicador | Valor Atual |
| :--- | :--- |
| **Testes automatizados** | **2.300 testes** em **312 arquivos** |
| **Cobertura (Statements / Lines)** | **90,94%** / **92,31%** |
| **Cobertura (Functions / Branches)** | **87,63%** / **80,51%** |
| **Saúde arquitetural** | **496 arquivos** sem violações de imports |
| **Rotas estáticas** | **46 rotas** |
| **Documentação técnica** | **135 specs** e **111 ADRs** |
| **Migrações Supabase** | **43/43** aplicadas e validadas com PGlite |

---

## 8. Equipe e Frentes de Trabalho

| Integrante | Frentes Principais |
| :--- | :--- |
| **Micael Cardoso Reis** | Arquitetura MVVM, governança/CI, Design System M3, validações automatizadas e recursos hiperlocais (bairros, QR Code, busca) |
| **Maria Clara Almeida Martins** | Identidade Visual e IHC (Design System Ipê), tema escuro, acessibilidade (WCAG 2.1 AA / TalkBack), onboarding, catálogo, perfil e estados de UI |
| **Antonio Carlos Gomes** | Ciclo de negociação, cadastro/gestão de anúncios, integração ISBN (BrasilAPI), boxes/coleções e moderação comunitária |
| **Eric Vinícius dos Santos Oliveira** | Definição de escopo de produto e plataformas (Android/Web) e consolidação documental de conformidade e rastreabilidade |

---

## 9. Próximos Passos

1. **Fechamento da branch `develop`:** Revisar alterações locais, executar `npm run validate` e registrar commit.
2. **Atualização Web (`https://ipebook.app`):** Gerar build Web (`npm run build:web`) e publicar no Cloudflare Pages.
3. **Governança e Pós-lançamento Beta:** Concluir revisão jurídica dos Termos de Uso e Política de Privacidade em link público; avaliar adoção de analytics de uso (PostHog) e ambiente Supabase dedicado para testes.
