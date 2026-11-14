# Guia de uso da versão atual

A versão `0.2.0` do **IpêBook** é a plataforma comunitária de venda, troca e doação de livros físicos em **Piripiri, PI**, disponível na Web (PWA responsivo) e no Android.

## Como acessar

- **Web / PWA (produção):** [https://ipebook.app](https://ipebook.app)
- **Convite Beta Android (Google Play):** [https://ipebook.app/beta](https://ipebook.app/beta)
- **Ambiente local de desenvolvimento:** siga o [guia de desenvolvimento](desenvolvimento.md) (`npm ci && npm run web` ou `npm start`).

## Principais fluxos disponíveis

| Fluxo | Rotas principais | O que é possível fazer |
| --- | --- | --- |
| **Boas-vindas e Acesso** | `/bem-vindo`, `/entrar`, `/criar-conta`, `/esqueci-senha`, `/redefinir-senha` | Escolher o bairro de Piripiri no primeiro acesso, criar conta ou entrar com e-mail/senha ou Google e recuperar acesso. |
| **Descoberta e Busca** | `/`, `/pesquisa`, `/livro/[id]`, `/favoritos`, `/alertas` | Explorar a vitrine hiperlocal de Piripiri, buscar por título/autor/categoria, filtrar por modalidade (*Venda*, *Troca*, *Doação*, *Boxes*), ordenar por bairro/preço/recência, favoritar livros, criar alertas de busca e compartilhar no WhatsApp. |
| **Anunciar e Minha Estante** | `/anunciar`, `/rascunhos`, `/meus-anuncios`, `/gerenciar-anuncio/[id]`, `/editar-anuncio/[id]` | Publicar livro ou box em 3 etapas com até 3 fotos, preencher dados pelo ISBN (digitação ou câmera), salvar rascunhos no dispositivo e editar, pausar, retomar ou excluir anúncios. |
| **Negociação, Encontro e Entrega** | `/conversas`, `/conversa/[id]`, `/pedidos-recebidos`, `/meus-pedidos`, `/negociacao/[id]`, `/negociacao/[id]/encontro`, `/negociacao/[id]/entrega` | Enviar proposta (com mensagem inicial e livro de troca opcional), conversar em tempo real, combinar encontro em um dos Pontos Seguros de Piripiri, confirmar a entrega presencial por **QR Code** (ou código de 8 caracteres) e avaliar a contraparte de 1 a 5 estrelas. |
| **Perfil, Configurações e Segurança** | `/perfil`, `/perfil/editar`, `/perfil/configuracoes`, `/perfil/avaliacoes`, `/perfil/encontros`, `/perfil/bloqueados`, `/excluir-conta` | Editar foto e dados públicos, alternar tema (*Claro*, *Escuro* ou *Sistema*), gerenciar canais de notificação, exportar dados pessoais (LGPD), bloquear usuários, denunciar anúncios/pessoas e excluir a conta definitivamente. |

## Estados da interface

Todas as telas de consulta e operação apresentam feedback explícito:

| Estado | O que a tela mostra | O que fazer |
| --- | --- | --- |
| **Carregando** | Esqueleto de carregamento (*Skeleton*) ou indicador com rótulo acessível | Aguardar a conclusão da consulta |
| **Vazio** | Ilustração e mensagem acolhedora explicando a ausência de itens | Acionar o atalho sugerido (ex.: explorar acervo, limpar filtros ou anunciar livro) |
| **Sem conexão** | Banner global ou cartão `OfflineState` indicando falta de rede | Verificar a conexão; a tela tenta recuperar automaticamente ao reconectar ou pelo botão "Tentar novamente" |
| **Falha** | Mensagem clara em português (`ErrorState` ou `InlineErrorCard`) sem expor detalhes internos | Corrigir o campo sinalizado ou acionar "Tentar novamente" |

## Limites de escopo vigentes

- **Apenas livros físicos em Piripiri, PI:** a beta opera exclusivamente nos 17 bairros oficiais de Piripiri; não há leitura nem envio de livros digitais (e-books).
- **Modalidades:** venda, troca e doação. Empréstimo temporário não faz parte do escopo.
- **Sem pagamento intermediado no app:** nos anúncios de venda, o valor é combinado e pago diretamente entre as pessoas no encontro presencial.

Para detalhes dos requisitos e decisões de produto, consulte [produto.md](produto.md) e [estado.md](estado.md).
