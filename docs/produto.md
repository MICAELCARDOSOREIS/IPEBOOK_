# Produto e requisitos do Ipebook

> Beta pública em preparação: Supabase configurado e ativo (`EXPO_PUBLIC_BACKEND=supabase`),
> restrição geográfica exclusiva para Piripiri, PI implementada (17 bairros, spec 022, ADR 0016),
> moderação comunitária ativa (spec 011, tabela `v2_reports`), primeiro acesso implementado (spec 026)
> e histórico recente no dispositivo (spec 027). A publicação Web no Cloudflare Pages está preparada
> em código e build (`dist/`, `public/_headers`, `public/_redirects`, spec 025, ADR 0020), aguardando
> comprovação no ambiente de destino externo (issue #109).

Revisão: 2026-10-20 (base: branch `develop`). Este documento consolida os requisitos implementados e o alinhamento de produto da versão beta.

## Objetivo confirmado

O objetivo autorizado até aqui é iniciar um novo Ipebook com MVVM sofisticado, numa pasta independente, e documentar seu funcionamento. A entrega permite executar e evoluir uma aplicação Expo com uma listagem de livros de exemplo.

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
| Favoritos e alertas de busca | Implementados e validados na [spec 016](../specs/016-favoritos-e-alertas-de-busca/spec.md), inclusive fluxo autenticado contra Supabase; edição de alertas integrada na issue #95 |
| Cadastrar livros | **Implementada** em [specs/003](../specs/003-autenticacao-e-cadastro-de-anuncio/): `Book` com `modality`/`price`/`ownerId`, `createListing` exigindo sessão (FR-006), rota `/anunciar` com suporte a fotos e seleção de bairro |
| Editar e pausar anúncio | **Implementada** em [specs/024](../specs/024-editar-e-pausar-anuncio/spec.md) (issue #91): rota `/editar-anuncio/[id]`, pausa e retomada de anúncios em `/meus-anuncios` |
| Conta e autenticação (criar conta, entrar, sair, redefinir senha) | **Implementada** em [specs/003](../specs/003-autenticacao-e-cadastro-de-anuncio/) e [specs/007](../specs/007-contas-persistentes/spec.md): `src/view/auth/`, rotas `/entrar`, `/criar-conta`, `/esqueci-senha` e `/redefinir-senha` |
| Solicitar e responder negociação simples | **Implementada** em [specs/004](../specs/004-negociacao-simples/) e [specs/009](../specs/009-detalhes-negociacao-encontro/): `BookRequest`, reserva atômica de concorrentes e ponto de encontro seguro em Piripiri na rota `/negociacao/[id]` |
| Busca, filtros e histórico de buscas | Implementados: busca local por título, autor e categoria opcional; histórico recente no dispositivo ([spec 027](../specs/027-historico-buscas-recentes/spec.md), issue #94), isolado por conta e limpo ao excluir a conta |
| Boas-vindas e primeiro acesso | **Implementada** em [specs/026](../specs/026-boas-vindas-primeiro-acesso/spec.md) (issue #98): rota `/bem-vindo`, escolha opcional de bairro e persistência de primeiro acesso no dispositivo (ADR 0022) |
| Denúncias e moderação comunitária | **Implementada** em [specs/011](../specs/011-denuncia-anuncio/spec.md) (issue #79): formulário `/denunciar/[id]`, tabela `v2_reports` e políticas de RLS no Supabase |
| Restrição geográfica a Piripiri, PI | **Implementada** em [specs/022](../specs/022-restricao-geografica-piripiri/spec.md) (issue #83): 17 bairros oficiais, validação de localidade e selo da beta |
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

- Backend oficial Supabase integrado (`EXPO_PUBLIC_BACKEND=supabase`) com autenticação, sessão persistente e Row Level Security (RLS) protegendo dados do usuário. Adaptadores em memória mantidos para testes unitários e de integração locais.
- `Book` contém `id`, `title`, `author`, `category` opcional, `status` (`available`/`reserved`/`paused`), `modality` (`sale`/`trade`/`donation`), `price` opcional (obrigatório e > 0 só quando `modality === "sale"`, FR-005), `ownerId`, `photoUrl`, `photos`, `city`, `state` e `neighborhood`.
- O cadastro e a edição de anúncios exigem sessão ativa (FR-006), associando o anúncio criado à conta autenticada (`ownerId`).
- A beta atende exclusivamente a cidade de **Piripiri, PI**, com catálogo delimitado a seus 17 bairros oficiais (spec 022, ADR 0016).
- Moderação comunitária ativa via denúncias de anúncio (`v2_reports`), permitindo sinalizar conteúdos impróprios (spec 011).
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
| Quais plataformas precisam ser suportadas inicialmente? | Android e Web. iOS fica fora da primeira entrega por enquanto. | 2026-10-13 |
| Em qual cidade a beta pública poderá operar? | Apenas Piripiri, PI. Implementada na Spec 022 e ADR 0016 com 17 bairros oficiais e selo da beta. | 2026-10-15 |

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

As próximas entregas da trilha incluem: comprovação da publicação Web no Cloudflare Pages (issue #109), correções de acessibilidade derivadas da auditoria (#104, #105, #106), filtros e ordenação do catálogo (#93) e perfis de usuário/anunciante (#55 e #73).
