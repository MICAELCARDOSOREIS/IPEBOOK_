# 0094. Refinamentos Visuais e Interativos das Telas

**Data:** 3 de novembro de 2026  
**Status:** Aceito  
**Contexto Técnico:** `src/view/favorites/favorites.tsx`, `src/view/requests/delivery.tsx`, `src/view/home.tsx`, `src/view/listings/bookDetail.tsx`, `src/view/listings/createListingStep2.tsx`, `src/view/conversations/chat.tsx`  
**Spec vinculada:** [120](../../specs/120-refinamentos-visuais-e-interativos-das-telas/spec.md)

## Contexto

Após a padronização universal de rolagem e a blindagem de duplo toque, foi realizada uma auditoria sistemática em todas as telas da aplicação procurando pontos de atrito, lacunas de paridade mobile/web e oportunidades de clareza para o usuário em Piripiri:
1. Em Favoritos, os filtros rápidos e a nota de garantia de privacidade só existiam na web.
2. Na Entrega presencial por QR Code, o temporizador não oferecia aviso prévio quando faltavam menos de 30 segundos para o código expirar.
3. Na Home, selecionar um bairro sem anúncios deixava carrosséis vazios sem instrução acolhedora.
4. No Detalhe do livro, a informação de que a entrega ocorre com segurança via QR Code em Ponto Seguro público não estava explícita no card da pessoa anunciante.
5. Na criação de anúncios (passo 2 de fotos), faltava uma orientação visual para incentivar fotos da lombada e do estado real do livro.
6. No chat, faltava indicador de proximidade do limite de caracteres ao digitar mensagens longas.

## Decisão

1. **Favoritos:** Paridade completa entre mobile e web com chips de filtro rápido (`Todos`, `Disponíveis`, `Reservados`) e inclusão da nota de privacidade no rodapé da lista móvel.
2. **Entrega Presencial:** Adicionar aviso visual de expiração iminente quando `secondsLeft <= 30`, mudando a cor do contador para o tom de aviso e orientando a gerar novo código se necessário.
3. **Home:** Cartão acolhedor quando o bairro escolhido não tiver livros, com ações diretas para "Anunciar livro" ou "Ver livros de toda a cidade".
4. **Detalhes do Livro:** Micro-selo e texto de confiança no card do anunciante indicando Ponto Seguro de Piripiri e confirmação por QR Code.
5. **Criação de Anúncios:** Caixa de dica no passo 2 de fotos orientando sobre enquadramento de lombada e cortes.
6. **Chat:** Exibição discreta do contador `N/500` quando a mensagem ultrapassar 400 caracteres.

## Consequências

- **Positivas:** Maior transparência, confiança no encontro físico em Piripiri, paridade de recursos entre as versões web e mobile, e prevenção de frustrações durante o agendamento e entrega.
- **Limitações:** Manter todas as verificações de acessibilidade e testes automatizados existentes sincronizados com os novos elementos de UI.
