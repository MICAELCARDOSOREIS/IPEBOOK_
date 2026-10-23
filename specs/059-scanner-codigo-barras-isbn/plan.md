# Plano de Implementação — Spec 059 (Leitor de Código de Barras por Câmera)

## 1. Arquitetura e Camadas Afetadas

- **View (`src/view/components/barcodeScannerModal.tsx`)**:
  - Modal com `CameraView` do `expo-camera`.
  - Tratamento de status de permissão (`useCameraPermissions`).
  - Overlay semi-transparente com moldura de foco (mira) e instruções para o usuário (`"Aponte a câmera para o código de barras no verso do livro"`).
  - Botão de fechar e feedback caso permissão seja negada.
- **View (`src/view/listings/createListingStep1.tsx`)**:
  - Adicionar botão `"Escanear código de barras"` com ícone `camera-outline` junto ao card de ISBN.
  - Abrir `BarcodeScannerModal`.
  - No callback `onScan(barcode)`, preencher o ISBN e disparar a busca automática.
- **ViewModel (`src/viewmodel/useCreateListingViewModel.ts`)**:
  - Suportar método auxiliar `handleBarcodeScanned(code: string)` que normaliza o ISBN, preenche o campo e executa `lookupIsbn(code)`.

## 2. Testes

- `tests/components/barcodeScannerModal.test.tsx`:
  - Mock do `expo-camera` e `useCameraPermissions`.
  - Testa exibição de pedido de permissão.
  - Testa exibição de aviso caso permissão seja negada.
  - Testa detecção do código de barras e chamada do callback `onScan`.
  - Testa fechamento do modal.
- `tests/components/createListingView.test.tsx`:
  - Testa abertura do scanner e fluxo de escaneamento preenchendo o título/autor.
