# Spec 059 — Leitor de código de barras por câmera para ISBN (Figma 04.01)

## Contexto e Objetivo

No fluxo de publicação de anúncios (`/anunciar`), o card da etapa 1 indica:
`"Ler ISBN com a câmera / Preenche título e autor automaticamente"` (Figma `04.01`).

A Spec 058 habilitou a validação e consulta de metadados em base aberta a partir do ISBN digitado. Esta especificação (Spec 059) implementa a leitura física do código de barras impresso no verso do livro utilizando a câmera do dispositivo móvel através do `expo-camera`.

Ao apontar a câmera para o código de barras (EAN-13, EAN-8 ou UPC) do livro:
1. O aplicativo lê o código e fecha o leitor imediatamente para evitar múltiplas leituras sucessivas.
2. O código de barras é normalizado como ISBN.
3. O ViewModel automaticamente dispara a consulta de metadados (Spec 058) e preenche os campos `Título` e `Autor`.
4. Se o usuário estiver na web sem suporte a câmera, recusar a permissão de câmera ou fechar o leitor, a aplicação continua funcionando normalmente com o campo de inserção manual de ISBN.

## Requisitos Funcionais

- **RF-01**: A etapa 1 de anúncio deve exibir a ação de abrir o leitor de código de barras com a câmera (`"Escanear código de barras"` ou ícone de câmera).
- **RF-02**: Ao acionar o scanner, a aplicação solicita permissão de acesso à câmera de forma contextual.
- **RF-03**: Ao conceder a permissão, o scanner é exibido em um modal com visor central (mira) e botão para fechar / cancelar a qualquer momento.
- **RF-04**: Ao detectar um código de barras de livro (formatos EAN-13 ou equivalentes), o modal se fecha, o campo de ISBN é preenchido e a busca de metadados é acionada automaticamente.
- **RF-05**: Se a permissão for negada ou a câmera estiver indisponível, deve ser exibido aviso amigável explicando que a câmera não pôde ser iniciada e orientando o usuário a digitar o código manualmente.
- **RF-06**: A solução deve respeitar a acessibilidade, com rotulagem adequada dos botões e contraste em conformidade com o tema do Ipebook.

## Critérios de Aceite

- **CA-01**: Componente `BarcodeScannerModal` criado na camada de visualização com visor, tratamento de permissão de câmera e botão de cancelamento.
- **CA-02**: Integração do botão de escaneamento em `CreateListingStep1.tsx` ao lado ou dentro do card de ISBN.
- **CA-03**: Suporte a preenchimento automático e encadeamento com `lookupIsbn()` no `useCreateListingViewModel`.
- **CA-04**: Testes unitários para o componente do scanner (com simulação de permissão concedida, negada e detecção de código).
- **CA-05**: Testes de regressão da etapa 1 de anúncio e validação completa sem violação de arquitetura.
