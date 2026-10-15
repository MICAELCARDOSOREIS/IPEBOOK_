# Especificação 011: Denúncia de Anúncio e Moderação Comunitária

## 1. Contexto e Motivação
Em plataformas comunitárias de troca, venda e doação de livros físicos, garantir a segurança dos usuários e a integridade do catálogo é fundamental. Além disso, as diretrizes de conteúdo gerado por usuários (UGC) das lojas Google Play e Apple App Store exigem mecanismos claros para denúncia e moderação de conteúdo impróprio ou ilícito.

## 2. Escopo
- **Incluído:**
  - Criação da entidade `ReportListing` com motivos estruturados (conteúdo ofensivo, golpe/fraude, cópia pirata, informações falsas, outro).
  - Contrato `IReportDataSource` e implementação em memória e Supabase.
  - Caso de uso `ReportUseCases.submitReport(input, sessionUserId)` com validação de autenticação e preenchimento de motivo.
  - ViewModel `useReportListingViewModel`.
  - Tela `ReportListingView` em `src/view/listings/reportListing.tsx`.
  - Rota dinâmica `src/app/denunciar/[id].tsx`.
  - Botão de acesso "Denunciar anúncio" no detalhe do livro (`src/view/listings/bookDetail.tsx`).
- **Fora de escopo:**
  - Painel administrativo web de moderação (será tratado em backend/administração).
  - Edição de perfil da Maria Clara (Issue #55).

## 3. Critérios de Aceite
1. **CA1 — Botão visível no detalhe:** Qualquer usuário que visualize os detalhes de um livro encontra a opção acessível "Denunciar anúncio".
2. **CA2 — Validação de autenticação:** Apenas usuários autenticados podem enviar denúncias. Usuários não autenticados recebem aviso com convite para entrar.
3. **CA3 — Seleção de motivos:** A tela de denúncia disponibiliza seleção entre motivos pré-definidos objetivos.
4. **CA4 — Feedback e persistência:** Ao confirmar o envio, a denúncia é registrada e um aviso de sucesso com agradecimento e prazo de análise (24h) é exibido, permitindo voltar ao anúncio.
5. **CA5 — Acessibilidade e Design System:** Segue os tokens do Ipebook com contraste adequado, área de toque >= 48dp e acessibilidade screen-reader.
