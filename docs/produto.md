# Produto e requisitos do Ipebook

> Beta pública em fase de lançamento: build Android `0.2.0` (`com.ipebook.app`) publicada na Play Store e validada ponta a ponta em aparelho real (2026-11-16), backend Supabase ativo (`EXPO_PUBLIC_BACKEND=supabase`), atuação exclusiva em Piripiri, PI (4 Pontos Seguros de encontro e compatibilidade com os 17 bairros oficiais, Specs 022 e 114, ADRs 0016 e 0111), moderação comunitária ativa (`v2_reports`, `v2_moderators`), primeiro acesso implementado (Spec 026), histórico recente no dispositivo (Spec 027) e publicação Web/PWA em `https://ipebook.app` (Spec 025, ADR 0020; republicação pendente para incorporar últimas evoluções).

Revisão: 2026-11-17 (base: branch `develop`). Este documento consolida os requisitos implementados e o alinhamento de produto da versão beta `0.2.0`.

## Objetivo confirmado

O objetivo do **IpêBook** é viabilizar a circulação comunitária de livros físicos em **Piripiri, PI** (venda, troca e doação) em uma plataforma multiplataforma construída em Expo / React Native / TypeScript / Supabase com arquitetura MVVM em sete camadas. A aplicação opera hoje em produção Android (`0.2.0` na Google Play Store) e Web/PWA (`https://ipebook.app`), mantendo separação estrita de domínio, contratos testáveis e privacidade dos leitores.

A frase da interface “Um lugar para descobrir sua próxima leitura” sugere descoberta de livros. Com a decisão de modalidade abaixo, ela passa a significar especificamente compra, venda, troca e doação de livros entre pessoas da comunidade.

## Público e problema

**Decidido em 2026-10-13**: o Ipebook conecta pessoas que têm livros parados com pessoas da comunidade que querem ler, viabilizando compra, venda, troca e doação de forma simples e sustentável — o mesmo problema e proposta de valor já validados no projeto irmão da equipe (`/home/usermicael/Projetos/IpeBook`). O público prioritário é a comunidade local de leitores que já possuem livros físicos parados em casa e querem tanto se desfazer deles quanto encontrar novos títulos sem depender de livraria.

Esta decisão foi trazida do trabalho já em produção da equipe no projeto irmão, não de pesquisa de usuário nova feita nesta base pequena — não há métricas de uso próprias registradas aqui. Se a equipe quiser divergir do produto irmão para este Ipebook específico, revisar esta seção.

## Escopo e situação

| Capacidade | Situação |
| --- | --- |
| Abrir a tela inicial | Implementada |
| Mostrar ausência de livros | Implementada e configuração padrão |
| Renderizar títulos e autores fornecidos pelo caso de uso | Implementada; dados de exemplo exercitados em testes |
| Tratar carregamento, erro e nova tentativa | Implementada |
| Favoritos e alertas de busca | **Implementada** na [spec 016](../specs/016-favoritos-e-alertas-de-busca/spec.md) e [spec 036](../specs/036-gerenciar-e-editar-alerta/spec.md): gerenciamento e edição próprios de alertas, modalidades persistidas e avisos automáticos |
| Cadastrar livros e boxes | **Implementada** em [specs/003](../specs/003-autenticacao-e-cadastro-de-anuncio/), [specs/017](../specs/017-rascunhos-de-anuncio/spec.md) e [specs/112](../specs/112-anuncio-box-de-livros/spec.md): `Book` com `modality`/`price`/`ownerId`, fluxo em 3 etapas, até 3 fotos com [guia de enquadramento](../specs/140-enquadramento-fotos-livro/spec.md), rascunhos locais/remotos e suporte a boxes (2 a 100 volumes) |
| Editar e pausar anúncio | **Implementada** em [specs/024](../specs/024-editar-e-pausar-anuncio/spec.md) (issue #91): rota `/editar-anuncio/[id]`, pausa e retomada de anúncios em `/meus-anuncios` |
| Conta e autenticação (criar conta, entrar, sair, redefinir senha) | **Implementada** em [specs/003](../specs/003-autenticacao-e-cadastro-de-anuncio/), [specs/007](../specs/007-contas-persistentes/spec.md) e [specs/106](../specs/106-login-google-nativo/spec.md): e-mail/senha, login Google nativo e recuperação de acesso |
| Solicitar e responder negociação simples | **Implementada** em [specs/004](../specs/004-negociacao-simples/), [specs/009](../specs/009-detalhes-negociacao-encontro/) e [specs/113](../specs/113-melhorias-na-negociacao/spec.md): `BookRequest` com mensagem inicial e livro de troca opcional, reserva atômica e cancelamento (`cancelled`) |
| Combinar encontro (local, dia e horário) | **Implementada** em [specs/052](../specs/052-combinar-encontro/spec.md) e [specs/114](../specs/114-melhorias-combinar-encontro/spec.md) (ADR 0111): escolha entre os 4 Pontos Seguros de Piripiri (sem Mapbox), confirmação, reagendamento, cancelamento e histórico (`/perfil/encontros`) |
| Entrega presencial por QR Code | **Implementada** em [specs/095](../specs/095-conclusao-por-qr-code/spec.md) e [specs/115](../specs/115-melhorias-entrega-livro/spec.md) (ADR 0070): código QR e código legível de 8 caracteres em `/negociacao/[id]/entrega` |
| Busca, filtros e histórico de buscas | **Implementada** em [specs/027](../specs/027-historico-buscas-recentes/spec.md), [specs/028](../specs/028-filtrar-e-ordenar-catalogo/spec.md) e [specs/121](../specs/121-ordenacao-avancada-catalogo/spec.md): 6 categorias canônicas (ADR 0109), boxes, faixa de preço, ordenação e histórico no dispositivo |
| Boas-vindas e primeiro acesso | **Implementada** em [specs/026](../specs/026-boas-vindas-primeiro-acesso/spec.md) (issue #98): rota `/bem-vindo`, escolha opcional de bairro e persistência de primeiro acesso no dispositivo (ADR 0022) |
| Denúncias e moderação comunitária | **Implementada** em [specs/011](../specs/011-denuncia-anuncio/spec.md) (issue #79): formulário `/denunciar/[id]`, tabela `v2_reports` e políticas de RLS no Supabase |
| Restrição geográfica a Piripiri, PI | **Implementada** em [specs/022](../specs/022-restricao-geografica-piripiri/spec.md) e [specs/114](../specs/114-melhorias-combinar-encontro/spec.md): 4 Pontos Seguros oficiais e compatibilidade com os 17 bairros históricos de Piripiri (ADR 0016) |
| Tema claro editorial e acessibilidade de contraste | **Implementada** em [specs/139](../specs/139-remocao-tema-escuro/spec.md) ([ADR 0114](adr/0114-remocao-do-tema-escuro.md), substituindo ADR 0036): operação exclusiva no tema claro editorial com tokens semânticos WCAG AA/AAA |
| Bloqueio e desbloqueio de usuários | **Implementada** em [specs/056](../specs/056-bloqueio-de-usuarios/spec.md) (ADR 0039): rota `/perfil/bloqueados` e bloqueio mútuo |
| Convidar amigos e compartilhar no WhatsApp | **Implementada** em [specs/057](../specs/057-convidar-amigos/spec.md), [specs/118](../specs/118-compartilhamento-rapido-whatsapp/spec.md) e [specs/119](../specs/119-open-graph-cards-compartilhamento/spec.md): atalho direto no WhatsApp (ADR 0110) e cards Open Graph dinâmicos em `functions/livro/[id].ts` |
| Consulta e leitura de ISBN por câmera | **Implementada** em [specs/058](../specs/058-busca-livro-isbn/spec.md), [specs/059](../specs/059-scanner-codigo-barras-isbn/spec.md) e [specs/097](../specs/097-sinopse-e-edicao-pelo-isbn/spec.md): Open Library, Google Books, BrasilAPI (ADR 0073) e Crossref (ADR 0105) |
| Notificações push locais e lembretes de encontro | **Implementada** em [specs/060](../specs/060-notificacoes-push-e-lembretes/spec.md) (ADR 0043): agendamento 60 min antes do encontro |
| Push profissional, canais por tipo e preferências de aviso | **Implementada** em [specs/099](../specs/099-preferencias-e-canais-de-notificacao/spec.md) (ADR 0075): canais Android por categoria, agrupamento por negociação, ícone monocromático, selo de não lidas e switches em Configurações (`muted_types`) |
| Avisos de mensagem nova, pedido recusado e avaliação recebida | **Implementada** em [specs/100](../specs/100-avisos-restantes/spec.md) (ADR 0076): gatilhos no banco, central e push |
| Cancelar pedido e avisos de livros favoritados | **Implementada** em [specs/101](../specs/101-cancelar-pedido-e-avisos-de-favoritos/spec.md) (ADR 0077): status `cancelled`, botão em Conversas e avisos de preço e disponibilidade |
| Moderação de denúncias | **Implementada** em [specs/102](../specs/102-moderacao/spec.md) (ADR 0078): fila para moderadores, pausa automática, remoção de anúncio e suspensão de conta |
| Limites contra abuso | **Implementada** em [specs/103](../specs/103-limites-anti-abuso/spec.md) (ADR 0079): limites diários e por minuto no banco, com mensagem no app |
| Acompanhamento de erros | **Implementada** em [specs/104](../specs/104-acompanhamento-de-erros/spec.md) (ADR 0080): Sentry sem dados pessoais e tela de erro amigável; liga com `EXPO_PUBLIC_SENTRY_DSN` |
| Avaliação na loja e atualizações sem loja | **Implementada** em [specs/105](../specs/105-avaliacao-na-loja-e-atualizacoes/spec.md), [specs/128](../specs/128-aviso-atualizacao-app/spec.md) e [specs/129](../specs/129-in-app-updates-google-play/spec.md): pedido de nota, verificação remota, Play In-App Updates e EAS Update |
| Chat interno na negociação | **Implementada** em [specs/061](../specs/061-chat-mensagens-negociacao/spec.md) (ADR 0044): troca de mensagens transacionais em tempo real via Supabase Realtime |
| Conversas e central de notificações | **Implementada** na [spec 141](../specs/141-melhorar-conversas-notificacoes/spec.md). O chat reúne as ações do encontro e orienta sobre propostas expiradas. A central apresenta o estado atual da negociação, o histórico de avisos e controles separados para leitura e exclusão. |
| Conclusão de negociação e avaliação mútua | **Implementada** em [specs/063](../specs/063-concluir-negociacao-avaliacoes/spec.md) (ADR 0046): avaliação mútua de 1 a 5 estrelas |
| Alinhamento visual total com Figma | **Implementada** em [specs/062](../specs/062-alinhamento-home-figma/spec.md), [064](../specs/064-alinhamento-estante-figma/spec.md), [065](../specs/065-alinhamento-perfil-figma/spec.md) e [066](../specs/066-alinhamento-explorar-figma/spec.md); guia de retorno ao Figma na [spec 135](../specs/135-alinhamento-figma-com-codigo/issue.md) |
| Seletor de localidade e filtro territorial | **Implementada** em [specs/067](../specs/067-seletor-bairro-piripiri/spec.md) e [specs/068](../specs/068-secao-hiperlocal-home-e-filtro-supabase/spec.md) (ADR 0050/0051): seletor de localidades de Piripiri e filtro remoto no Supabase |
| Consulta sem conexão | **Implementada** na [spec 142](../specs/142-leitura-sem-conexao/spec.md). O catálogo e a Estante mantêm a última consulta, e até 30 detalhes públicos visitados podem ser reabertos. A Estante depende de uma sessão disponível. O app indica a data da cópia e atualiza os dados quando a rede volta. Publicação, favoritos, pedidos e envio de mensagens exigem internet. |
| Resiliência offline, esqueletos e PWA Apple HIG | **Implementada** em [specs/130](../specs/130-resiliencia-offline-e-banner-conexao/spec.md), [specs/131](../specs/131-design-de-erros-e-auto-recuperacao-offline/spec.md), [specs/132](../specs/132-esqueletos-de-carregamento-e-cache-instantaneo/spec.md) e [specs/136](../specs/136-pwa-iphone-apple-hig/spec.md) (ADR 0108) |
| Suíte E2E Web automatizada (CDP) | **Implementada** em [specs/138](../specs/138-e2e-web-cdp/spec.md) (ADR 0112), com 8 cenários no Chrome headless, incluindo leitura de Termos e privacidade por teclado |
| App iOS Nativo (Apple HIG / Liquid Glass) | Abas e material Liquid Glass nativos implementados na [Spec 137](../specs/137-ios-nativo-apple-hig/spec.md). A homologação visual no iPhone e a distribuição via TestFlight estão pendentes. |
| Troca, doação, empréstimo ou venda | Decidido: venda, troca e doação. Empréstimo não entra no escopo |
| Leitura de arquivos digitais | Não implementada; fora de escopo — modalidade decidida é livro físico |
| Banco e sincronização | Backend Supabase oficial configurado e ativo (`EXPO_PUBLIC_BACKEND=supabase`), com RLS, migrações SQL validadas via PGlite e adaptadores de memória para testes rápidos |

## Requisitos funcionais atuais

Os identificadores abaixo ajudam a navegar o comportamento existente; os critérios formais da fundação permanecem na [especificação 001](../specs/001-estrutura-mvvm/spec.md).

| ID | Requisito observável | Aceite |
| --- | --- | --- |
| RF01 | Abrir a listagem inicial sem exigir conta | A rota inicial renderiza Ipebook e a seção Livros |
| RF02 | Informar carregamento durante a consulta | `loading` começa verdadeiro e encerra em sucesso ou erro |
| RF03 | Representar catálogo vazio sem inventar conteúdo | A lista padrão tem zero livros e a View mostra a mensagem de ausência |
| RF04 | Mostrar título e autor dos livros recebidos | Cada item fornecido aparece com esses dois campos |
| RF05 | Exibir falha de forma compreensível | Erro de domínio usa mensagem segura; erro inesperado não expõe detalhes internos |
| RF06 | Permitir nova tentativa após falha | O botão dispara nova consulta e o sucesso limpa a mensagem de erro |
| RF07 | Manter o resultado da consulta mais recente | Uma resposta antiga não substitui os livros de consulta posterior |

Testes e limitações de cobertura estão em [qualidade.md](qualidade.md). Existir um requisito documentado não equivale a afirmar cobertura visual ou automatizada de todos os seus aspectos.

## Regras atuais e limites do domínio

- Backend oficial Supabase integrado (`EXPO_PUBLIC_BACKEND=supabase`) com autenticação, sessão persistente e Row Level Security (RLS) protegendo dados do usuário. Adaptadores em memória mantidos para testes automatizados locais e para a suíte E2E Web em memória (`dist-e2e/`).
- `Book` contém `id`, `title`, `author`, `category` opcional (6 macro-áreas canônicas, ADR 0109), `status` (`available`/`reserved`/`paused`/`draft`/`delivered`), `modality` (`sale`/`trade`/`donation`), `price` opcional (obrigatório e > 0 só quando `modality === "sale"`, FR-005), `ownerId`, `condition`, `description`, metadados opcionais de edição (`synopsis`, `publisher`, `pageCount`, `publicationYear`), `isBox`/`boxVolumesCount`, `draftStep`, `photoUrl`, `photos`, `city`, `state` e `neighborhood`.
- O cadastro e a edição de anúncios exigem sessão ativa (FR-006), associando o anúncio criado à conta autenticada (`ownerId`).
- A beta atende exclusivamente a cidade de **Piripiri, PI**, operando com os **4 Pontos Seguros** oficiais para entrega presencial (`Campus IFPI Piripiri`, `Praça da Bandeira`, `Museu de Piripiri`, `Praça de Eventos`) e mantendo compatibilidade com os **17 bairros** oficiais (Specs 022 e 114; ADRs 0016 e 0111).
- Moderação comunitária ativa via denúncias de anúncio e pessoas (`v2_reports`) e fila de moderadores (`v2_moderators`, Specs 011 e 102).
- Casos de uso dependem de contratos desacoplados; detalhes de persistência e rede ficam na infraestrutura.

## Requisitos de qualidade

| Área | Compromisso atual | Verificação |
| --- | --- | --- |
| Manutenibilidade | Sete camadas, contratos injetáveis e TypeScript estrito | Checagem de imports, tipos e revisão |
| Confiabilidade | Erros e concorrência tratados na ViewModel | Testes de estado e resposta antiga |
| Interface | Textos em português; estados vazio, carregamento e erro explícitos | Revisão e inspeção dos estados afetados |
| Acessibilidade | Cabeçalhos e controles identificáveis; layout legível | Há propriedades de acessibilidade no código, sem certificação ou auditoria completa |
| Segurança | Não expor segredos e detalhes internos em mensagens inesperadas | Revisão e teste da mensagem genérica |
| Reprodutibilidade | Dependências registradas em lockfile e comandos locais definidos | Instalação e verificações conforme ambiente |

Não existem metas aprovadas de latência, disponibilidade, escala ou retenção. Evitar números arbitrários antes de definir o produto e o ambiente operacional.

## Decisões de produto pendentes

Nenhuma questão de produto segue pendente no momento — todas as 6 originais foram respondidas
(ver tabela "Decisões já tomadas" abaixo). O que resta é refinamento: versão mínima de SO
Android, regras de aplicação do limite a Piripiri, PI, e detalhes de duplicidade, ISBN e
moderação à medida que forem especificadas.

### Decisões já tomadas

| Questão | Decisão | Data |
| --- | --- | --- |
| Qual problema o Ipebook resolve e para quem? | Conectar pessoas com livros parados a pessoas da comunidade que querem ler, via compra/venda/troca/doação. Público: comunidade local de leitores. Trazido do projeto irmão já em produção. | 2026-10-13 |
| Qual modalidade: troca/doação, biblioteca pessoal, leitura digital ou outra? | Venda, troca e doação de livros físicos. Mesma modalidade do projeto irmão. | 2026-10-13 |
| De onde vêm os livros e como são disponibilizados? | Cadastro manual pelo próprio usuário (anúncio com título, autor, modalidade e, opcionalmente, foto). Sem importação de catálogo externo nesta etapa. | 2026-10-13 |
| Haverá conta? Quais dados serão necessários? | Sim — conta com e-mail/senha (ou código por e-mail) e login com Google, dados mínimos nome e e-mail, mesma estratégia do projeto irmão (ADR 0006/0028 lá). | 2026-10-13 |
| Quais ações compõem a primeira entrega útil? | Nesta ordem: (1) autenticação de conta, (2) cadastrar anúncio de livro, (3) catálogo/listagem (já implementado), (4) solicitar e responder negociação simples. Busca/filtros avançados e segurança/moderação ficam para depois. | 2026-10-13 |
| Quais plataformas precisam ser suportadas inicialmente? | Android e Web na primeira entrega (2026-10-13), evoluindo para adequação PWA no iPhone/Safari (Spec 136 / ADR 0108 em 2026-11-11) e planejamento estruturado de app iOS Nativo na Spec 137 (2026-11-17). | 2026-10-13 / 2026-11-17 |
| Em qual cidade a beta pública poderá operar? | Apenas Piripiri, PI. Implementada na Spec 022 e ADR 0016 com 17 bairros oficiais e consolidada nos 4 Pontos Seguros (Spec 114, ADR 0111). | 2026-10-15 |

As seis decisões originais acima (exceto a de plataformas, que já tinha sido resolvida em conversa
direta com o usuário) foram inicialmente trazidas do trabalho já validado em produção da equipe
no projeto irmão (`/home/usermicael/Projetos/IpeBook`), não de pesquisa de usuário nova feita
nesta base pequena. **Em 2026-10-13, o usuário solicitante confirmou diretamente as três
principais (problema/público, modalidade, conta/autenticação) como corretas para este
projeto** — deixaram de ser inferência e passaram a ser decisão confirmada. A restrição a
Piripiri, PI, foi informada diretamente pelo usuário em 2026-10-15 e consolidada na Spec 022. O responsável pelo produto
é o usuário solicitante; se a equipe quiser divergir de alguma dessas decisões para este Ipebook
específico, basta atualizar esta tabela.

## Próximos passos e pendências

A build Android `0.2.0` (`com.ipebook.app`) foi publicada na Play Store e validada ponta a ponta em aparelho real com duas contas em 2026-11-16 (`docs/estado.md`). As 43 migrações SQL estão aplicadas e verificadas no Supabase remoto, o Sentry está configurado e o cadastro dos moderadores (Spec 102) cobre os quatro integrantes de [docs/equipe.md](equipe.md). Pendências atuais:

- **Republicação Web no Cloudflare Pages (`https://ipebook.app`):** subir o build atualizado com ajustes de PWA, `<title>` estático para SEO, remoção do Mapbox e layout desktop em 3 colunas.
- **Revisão jurídica dos Termos e Política de Privacidade:** validar a versão final publicada em `https://ipebook.app/termos?aba=privacidade`.
- **iOS Nativo (`Spec 137`):** executar incrementalmente as 8 sub-issues de adequação nativa de iPhone ao Apple HIG e Liquid Glass (ver [`specs/137-ios-nativo-apple-hig/`](../specs/137-ios-nativo-apple-hig/spec.md)).
- **Analytics e ambiente de testes dedicado:** avaliar métricas de uso (ex.: PostHog) e um projeto Supabase separado para testes; ambos dependem de conta e decisão de custo.
