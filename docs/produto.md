# Produto e requisitos do Ipebook

> Beta pública em preparação desde 2026-10-15: Supabase, Android por APK e Web em Cloudflare
> Pages foram escolhidos. A [spec 007](../specs/007-contas-persistentes/spec.md) iniciou a
> migração técnica, mas o app ainda usa memória por padrão e **não está pronto para público**.
> A recuperação com senha temporária foi removida; no modo local, o envio por e-mail informa
> que está indisponível. Contato só após aceite, confirmação bilateral da entrega, 18+,
> atuação apenas em Piripiri, PI, e moderação manual são requisitos futuros da beta,
> não funcionalidades prontas.

Revisão: 2026-10-14 (specs 003 e 004 completas: autenticação, cadastro de anúncio e negociação simples). Este documento descreve a base implementada e identifica decisões necessárias para especificar o produto final. Não é uma aprovação de funcionalidades futuras.

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
| Favoritos e alertas de busca | Implementados na [spec 016](../specs/016-favoritos-e-alertas-de-busca/spec.md); migração aplicada ao Supabase, com fluxo autenticado remoto ainda pendente de verificação |
| Cadastrar livros (editar fica para depois) | **Implementada** (Antonio, issues #26/#27/#28) em [specs/003](../specs/003-autenticacao-e-cadastro-de-anuncio/): `Book` estendido com `modality`/`price`/`ownerId`, `createListing` exigindo sessão (FR-006), `src/view/listings/createListing.tsx`, rota `src/app/anunciar.tsx` (protegida por sessão via `src/view/listings/createListingScreen.tsx`), botão "Anunciar" condicional em `src/view/home.tsx` |
| Conta e autenticação (criar conta, entrar, sair; perfil fica para depois) | **Implementada** (Maria Clara, Tarefa 23) em [specs/003](../specs/003-autenticacao-e-cadastro-de-anuncio/): `src/view/auth/signIn.tsx`, `src/view/auth/signUp.tsx`, rotas `src/app/entrar.tsx` e `src/app/criar-conta.tsx`, indicador de sessão em `src/view/home.tsx` |
| Solicitar e responder negociação simples | **Implementada** (Antonio, Tarefa 25 / issue #21) em [specs/004](../specs/004-negociacao-simples/): `BookRequest`, casos de uso de solicitação e resposta com recusa automática de concorrentes e reserva do anúncio (SC-002), ViewModels (`useRequestNegotiationViewModel`, `useReceivedRequestsViewModel`, `useSentRequestsViewModel`), telas [`receivedRequests.tsx`](../src/view/requests/receivedRequests.tsx) e [`sentRequests.tsx`](../src/view/requests/sentRequests.tsx), rotas `src/app/pedidos-recebidos.tsx` e `src/app/meus-pedidos.tsx` |
| Busca e detalhe do anúncio | Implementados; busca local por título, autor e categoria opcional, com tela de detalhe |
| Troca, doação, empréstimo ou venda | Decidido: venda, troca e doação. Empréstimo não entra no escopo |
| Leitura de arquivos digitais | Não implementada; fora de escopo — modalidade decidida é livro físico |
| Banco e sincronização | Adaptadores Supabase existentes; a migração da spec 016 foi testada localmente e aplicada ao projeto remoto, sem validação completa com duas contas |

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

- Há autenticação em memória (conta, sessão) e o cadastro de anúncio exige sessão ativa (FR-006), associando o anúncio criado à conta autenticada (`ownerId`).
- `Book` contém `id`, `title`, `author`, `category` opcional, `status` (`available`/`reserved`), `modality` (`sale`/`trade`/`donation`), `price` opcional (obrigatório e > 0 só quando `modality === "sale"`, FR-005) e `ownerId`.
- Há consulta (listagem) e gravação (cadastro de anúncio); os dados continuam em memória e desaparecem ao encerrar a execução — nenhum backend real foi escolhido.
- A base inicia vazia. Dados fictícios não devem ser apresentados como acervo real.
- Casos de uso dependem de contratos; detalhes da tecnologia de dados ficam na infraestrutura.

Não há regra definida para duplicidade, ISBN, limite de livros, moderação ou disponibilidade.
A beta atenderá apenas Piripiri, PI, e exigirá autodeclaração de idade mínima de 18 anos;
a forma de aplicar essas regras ainda precisa ser especificada e implementada.

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
| Em qual cidade a beta pública poderá operar? | Apenas Piripiri, PI. A restrição ainda não está implementada nem validada. | 2026-10-15 |

As seis decisões originais acima (exceto a de plataformas, que já tinha sido resolvida em conversa
direta com o usuário) foram inicialmente trazidas do trabalho já validado em produção da equipe
no projeto irmão (`/home/usermicael/Projetos/IpeBook`), não de pesquisa de usuário nova feita
nesta base pequena. **Em 2026-10-13, o usuário solicitante confirmou diretamente as três
principais (problema/público, modalidade, conta/autenticação) como corretas para este
projeto** — deixaram de ser inferência e passaram a ser decisão confirmada. A restrição a
Piripiri, PI, foi informada diretamente pelo usuário em 2026-10-15. O responsável pelo produto
é o usuário solicitante; se a equipe quiser divergir de alguma dessas decisões para este Ipebook
específico, basta atualizar esta tabela.

## Próxima especificação

A [spec 007](../specs/007-contas-persistentes/spec.md) cobre contas e anúncios persistentes. A restrição a Piripiri, PI, deve ser especificada e testada em uma entrega posterior antes da beta pública. Nenhuma publicação foi autorizada ou realizada.
