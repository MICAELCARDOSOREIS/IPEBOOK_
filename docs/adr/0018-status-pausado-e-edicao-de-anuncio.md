# 0018 — Status pausado e edição de anúncio

## Status

Aceito

## Contexto

Até o momento, o ciclo de vida de um anúncio publicado no Ipebook permitia apenas as transições de criação (`available`) e reserva (`reserved`) mediante aceite de proposta, ou exclusão irreversível (`cancelListing`).

Usuários reais frequentemente precisam:
1. Corrigir informações incorretas (título, autor, categoria, valor de venda, foto ou bairro);
2. Pausar temporariamente a oferta de um livro (por viagem, indisponibilidade temporária ou negociação em andamento fora da plataforma) sem precisar apagar o anúncio e perder seu histórico;
3. Reativar o anúncio pausado assim que o livro voltar a estar disponível.

Além disso, anúncios com propostas aceitas (`reserved`) não podem ter seus dados ou preço alterados para não violar a boa-fé do acordo firmado com o solicitante.

## Decisão

1. Estender `Book.status` para admitir `"available" | "reserved" | "paused"`.
2. Adicionar restrição via check constraint no banco Supabase (`check (status in ('available', 'reserved', 'paused'))`).
3. Criar os casos de uso `updateListing` e `togglePauseListing` em `BookUseCases` com proteção de posse (`ownerId === sessionUserId`).
4. Bloquear edição e pausa caso o anúncio esteja no estado `reserved`.
5. Filtrar anúncios pausados das consultas públicas de vitrine (Home) e busca, garantindo que apenas o proprietário do livro consiga visualizar seus anúncios pausados na tela "Meus anúncios".

## Consequências

- Melhora substancial da usabilidade e retenção de anúncios na comunidade de Piripiri.
- Proteção da integridade dos acordos de negociação em andamento.
- Paridade estrita entre os adaptadores em memória e Supabase.
