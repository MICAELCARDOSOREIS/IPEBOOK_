# ADR 0042: Leitor de Código de Barras por Câmera para ISBN (Figma 04.01)

- **Status**: Aceito
- **Data**: 2026-10-23
- **Decisores**: Equipe de Arquitetura e Engenharia Ipebook
- **Contexto de Especificação**: Spec 059

## Contexto

A Spec 058 implementou a busca e o preenchimento automático de metadados a partir de um código ISBN informado manualmente. No entanto, o cartão da etapa 1 no Figma (`04.01`) prevê explicitamente `"Ler ISBN com a câmera / Preenche título e autor automaticamente"`. Digitar 13 dígitos de um código EAN no teclado do celular é propenso a erros de digitação e gera fricção desnecessária para o leitor.

O ecossistema Expo 57 disponibiliza a biblioteca oficial `expo-camera` com suporte unificado à leitura de códigos de barras via propriedade `onBarcodeScanned` e `barcodeScannerSettings` no componente `CameraView`.

## Decisão

1. **Adoção do `expo-camera` (`CameraView`)**:
   - Utilizar `expo-camera` versão compatível com Expo SDK 57 (`~57.0.6`) para gerenciar permissões de câmera e leitura de códigos de barras (tipos `ean13`, `ean8`, `upc_a`, `upc_e`).
2. **Camada de Abstração e Tolerância de Plataforma**:
   - Criar um componente modal de escaneamento (`BarcodeScannerModal`) desacoplado da lógica de negócio.
   - Tratar permissões de câmera de forma graciosa: se o usuário recusar ou a câmera for indisponível (ex.: navegadores restritos ou simulador), informar feedback claro e manter o botão de entrada manual disponível.
3. **Fluxo de Integração com o ViewModel**:
   - Quando um código de barras compatível com ISBN for lido, fechar automaticamente o modal do scanner, preencher o campo `isbnInput` e disparar o `lookupIsbn()` para carregar título, autor e sugestão de capa.
4. **Respeito à Arquitetura em 7 Camadas**:
   - `expo-camera` e elementos visuais de hardware permanecem estritamente na camada `view` (componente reutilizável e modal) e respeitam os tokens de design do Ipebook (`tokens.ts`).

## Consequências

### Positivas
- Redução drástica do atrito de cadastro de livros no aplicativo comunitário.
- Leitura instantânea de códigos de barras de livros físicos direto no verso da capa.
- Fallback integral para digitação manual caso a câmera não esteja disponível ou a permissão seja negada.

### Negativas / Mitigações
- Requer permissão de câmera do sistema operacional: mitigada solicitando permissão apenas no clique do botão `"Escanear código de barras"`, com mensagem contextual amigável.
