# Documentação do Ipebook

Este índice organiza os guias, relatórios e registros arquiteturais do **IpêBook**, plataforma comunitária de venda, troca e doação de livros físicos em Piripiri, PI.

| Preciso entender… | Documento |
| --- | --- |
| Objetivo, público, escopo e decisões de produto | [Produto e requisitos](produto.md) |
| Estado atual verificado, rotas e histórico de entregas | [Estado e continuidade](estado.md) |
| Resumo executivo para acompanhamento (3P, marcos e riscos) | [Status Report](status-report.md) |
| Camadas MVVM, dependências, entidades e erros | [Arquitetura MVVM](arquitetura.md) |
| Invariantes arquiteturais do código (*Architecture Spine*) | [Architecture Spine](arquitetura/architecture-ipebook/architecture-ipebook.md) |
| Instalação, configuração, scripts, APK/AAB e problemas comuns | [Guia de desenvolvimento](desenvolvimento.md) |
| Testes (Jest/RNTL/E2E CDP), cobertura, ISO/IEC 25010 e CI | [Qualidade e validação](qualidade.md) |
| Como usar a versão atual e fluxos disponíveis | [Guia de uso](uso.md) |
| Decisões arquiteturais registradas (113 ADRs) | [Índice de ADRs](adr/README.md) |
| Identidade visual, tipografia, tokens e diretrizes de IHC | [Design System (visão geral)](design-system.md) |
| Catálogo completo do Design System (tokens, 28 componentes, acessibilidade) | [Design System (`design-system/`)](../design-system/README.md) |
| Auditoria inicial de acessibilidade (Issue #96) | [Auditoria de acessibilidade](auditoria-acessibilidade.md) |
| Sincronização e divergências entre código e Figma | [Alinhamento Figma e Evolução UX](relatorio-alinhamento-figma-e-evolucao-ux.md) |
| Implantação Web no Cloudflare Pages, headers e domínio | [Implantação Cloudflare Pages](implantacao-cloudflare.md) |
| Publicação Android na Google Play Store e ficha da loja | [Beta Play Store](loja/beta-play-store.md) · [Ficha Play Store](loja/play-store.md) · [Envio pelo terminal](loja/publicacao-terminal.md) |
| Integrantes e contexto acadêmico (IFPI Campus Piripiri) | [Equipe do projeto](equipe.md) |
| Consolidação acadêmica de entregas por integrante | [Relatório final da equipe](relatorio-final-equipe.md) |
| Padrões de desenvolvimento, Git Flow e commits | [Guia de contribuição](../CONTRIBUTING.md) |

## Fontes de verdade

A [constituição](../.specify/memory/constitution.md) estabelece os princípios do repositório. Cada funcionalidade é especificada no Spec Kit em `specs/`, com especificação, plano, tarefas e validação. As decisões técnicas relevantes ficam registradas nos [ADRs](adr/README.md); os guias desta pasta explicam e consolidam o resultado sem substituir esses registros.

A [especificação 001](../specs/001-estrutura-mvvm/spec.md) cobre a fundação MVVM em sete camadas, enquanto a [especificação 007](../specs/007-contas-persistentes/spec.md) marca a adoção do Supabase com RLS. A documentação de produto diferencia sempre o que está implementado e validado do que permanece em planejamento (como a [especificação 137](../specs/137-ios-nativo-apple-hig/spec.md) para iOS Nativo).

## Manutenção

Ao mudar um fluxo, arquitetura ou contagem verificável, atualize na mesma entrega a especificação correspondente, `docs/estado.md` (`Conferência atual` e `Seção 1`), o `README.md` e os guias afetados — preservando registros históricos datados sem reescrevê-los. Rode `npm run check:docs`, `npm run check:numbering` e `npm run validate` antes de integrar em `develop`. Escrever sempre em português e nunca incluir credenciais.
