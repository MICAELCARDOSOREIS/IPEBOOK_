# Especificação 029: Portabilidade e Download de Dados Pessoais (LGPD Art. 18 e 19)

## 1. Visão Geral
Em cumprimento aos Artigos 18 (V) e 19 da Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018), o Ipebook já disponibiliza o caso de uso de extração estruturada de dados (`UserDataExportUseCases`, ADR 0025, PR #133). 

Esta especificação define a interface de usuário e o serviço de download de arquivo para permitir que os titulares baixem uma cópia completa dos seus dados em formato JSON interoperável (`meus-dados-ipebook-[data].json`), com destaque na tela de exclusão de conta antes da eliminação definitiva.

---

## 2. Critérios de Aceite

- **CA1 — Ação de Exportação:** Disponibilizar na tela de exclusão de conta (`deleteAccount.tsx`) um card informativo sobre o direito de portabilidade com botão para "Baixar meus dados (JSON)".
- **CA2 — Download Imediato:** Na Web, gerar um arquivo `.json` estruturado contendo metadados de emissão, versão do schema LGPD, dados de perfil, livros cadastrados, solicitações e denúncias associadas ao titular.
- **CA3 — Feedback Visual Acessível:** Exibir indicador de progresso durante a geração dos dados e mensagem de confirmação com `accessibilityRole="alert"` ao concluir.
- **CA4 — Independência da Exclusão:** O titular pode baixar seus dados a qualquer momento sem ser obrigado a prosseguir com a exclusão da conta.
- **CA5 — Resiliência e Segurança:** Falhas na geração não corrompem a sessão do usuário e dados sensíveis de credenciais (senhas ou hashes) nunca são expostos na exportação.

---

## 3. Arquitetura e Rastreabilidade
- **Model:** Contrato `IFileDownloadService` em `src/model/services/iFileDownloadService.ts`.
- **Infra:** Implementação `FileDownloadService` em `src/infra/services/fileDownloadService.ts`.
- **Injeção:** Registro em `src/di/container.ts`.
- **ViewModel:** Integração de `exportUserData` em `useDeleteAccountViewModel.ts`.
- **View:** Interface em `src/view/auth/deleteAccount.tsx`.
- **Testes:** Testes unitários do serviço e do ViewModel com cobertura completa.
