# Plano de Implementação: Termos de Uso e Privacidade (Spec 010)

## Arquitetura

1. **Model**:
   - `src/model/legalContent.ts`: Objeto contendo os tópicos, títulos e textos em português claro.
2. **View**:
   - `src/view/legal/termsAndPrivacy.tsx`: Componente visual com abas para alternar entre "Termos de Uso" e "Privacidade", com estilo consistente aos tokens de cores e tipografia.
3. **App**:
   - `src/app/termos.tsx`: Rota que renderiza `TermsAndPrivacy` e conecta o botão de voltar com `router.back()`.
   - Adicionar link "Termos e Privacidade" na tela `signUp.tsx` e rodapé da Home.
4. **Testes**:
   - `tests/components/termsAndPrivacyView.test.tsx` cobrindo a alternância de seções e acessibilidade.
