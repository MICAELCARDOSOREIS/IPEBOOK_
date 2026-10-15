# 008 — Gestão de Anúncios do Usuário (Meus Anúncios)

Status: especificada. Data: 2026-10-15.

## Objetivo

Permitir que a pessoa usuária autenticada visualize todos os anúncios de livros que ela mesma cadastrou, acompanhe o status de cada livro (disponível ou reservado), acesse os detalhes do livro e tenha um ponto central para gerenciar suas publicações no Ipebook.

## Escopo

- Adicionar método `listByOwner(ownerId)` no contrato `IBookDataSource` e suas implementações (`MemoryBookDataSource` e `SupabaseBookDataSource`).
- Adicionar caso de uso `listMyListings(sessionUserId)` em `IBookUseCases` / `BookUseCases`, exigindo sessão autenticada.
- Criar a ViewModel `useMyListingsViewModel`.
- Criar a tela pura `MyListings` e o container de proteção de sessão `MyListingsScreen` em `src/view/listings/myListings.tsx`.
- Criar a rota protegida `src/app/meus-anuncios.tsx`.
- Adicionar o botão "Meus anúncios" na área de sessão da Home (`src/view/home.tsx`).
- Não tocar em dados de Perfil (preservando o escopo atribuído à Maria Clara).
- Cobertura de testes em todas as camadas (unitários, hook, componentes e integração).

Ficam para próximas entregas: edição de dados do anúncio cadastrado e exclusão/pausa de anúncio.

## Critérios de aceite

1. Usuário autenticado visualiza apenas os livros cujo `ownerId` coincide com o seu identificador de usuário (`sessionUserId`).
2. Livros de outros usuários não aparecem na listagem de "Meus Anúncios".
3. A lista indica visualmente o título, autor, modalidade (venda/troca/doação), preço (se venda), capa ilustrativa determinística e se o anúncio está "Disponível" ou "Reservado".
4. Ao tocar em um anúncio, a pessoa usuária é levada à tela de detalhe do livro correspondente (`/livro/[id]`).
5. Se a pessoa usuária não tiver anúncios cadastrados, a tela apresenta estado vazio com mensagem acolhedora e botão direto para "Cadastrar anúncio" (`/anunciar`).
6. Se um visitante não autenticado tentar acessar `/meus-anuncios`, é redirecionado imediatamente para `/entrar`.
7. Estados de carregamento (*loading*) e erro com botão de tentar novamente (*retry*) são suportados.

## Validação

- Teste unitário de caso de uso com e sem sessão.
- Teste de hook de ViewModel validando estados de carregamento, sucesso, erro e recarregamento.
- Teste de componente RNTL com acessibilidade e estados da interface.
- Teste de integração ponta a ponta simulando a criação de conta, criação de anúncios por dois usuários distintos e verificação do isolamento na tela "Meus Anúncios".
- `npm run validate` e `npm run build:web` sem erros.
