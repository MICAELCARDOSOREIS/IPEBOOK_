# Plano de Implementação: Permissões da Plataforma (Spec 020)

## Observação de dependência

Bairro é escolha manual (lista fixa), não exige permissão de SO nem biblioteca de localização.
Fotos no fluxo de anunciar provavelmente já usa `expo-image-picker` ou similar — conferir o que
`src/app/anunciar.tsx`/view de anunciar já importa antes de adicionar dependência nova; não medir
suposição.

## Arquitetura em 7 Camadas (MVVM)

1. **Model:**
   - `src/model/neighborhoods.ts` (ou similar): lista fixa de bairros de Piripiri (dado estático,
     mesmo padrão de `src/model/helpContent.ts`/`legalContent.ts`).
2. **Infra:** nenhum datasource novo — permissões são tratadas via API nativa (Expo), não dados
   persistidos.
3. **DI:** nenhum registro novo.
4. **UseCase:** nenhuma regra de negócio nova além de validar que o bairro escolhido está na
   lista — pode viver direto no ViewModel por ser dado estático.
5. **ViewModel:**
   - `src/viewmodel/useNeighborhoodPickerViewModel.ts`.
   - `src/viewmodel/usePermissionPromptViewModel.ts` (genérico: tipo de permissão → texto
     explicativo → pedir → tratar negado), reaproveitado nas 3 telas de permissão.
6. **View:**
   - `src/view/onboarding/neighborhoodPicker.tsx`.
   - `src/view/onboarding/permissionPrompt.tsx` (genérico, parametrizado por tipo).
7. **App (Expo Router):**
   - `src/app/bairro.tsx`.
   - Telas de permissão acopladas ao fluxo que as originou (cadastro → notificações;
     anunciar → câmera/fotos), não como rotas isoladas visitáveis a qualquer momento.
8. **Testes e Validação:**
   - Testes do viewmodel genérico de permissão (concedida/negada) e do seletor de bairro.
   - `npm run validate` e `npm run build:web`; registrar em `validacao.md` ao final.
