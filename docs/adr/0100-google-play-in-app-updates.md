# 0100. Verificação automática direta de atualizações na Google Play Store

- **Status:** Aceito
- **Data:** 2026-11-09
- **Contexto:** Ciclo de vida do aplicativo Android / Distribuição na Google Play Store / Automação de releases
- **Especificação:** [129](../../specs/129-in-app-updates-google-play/spec.md)

## Contexto

Com a implementação da Spec 128 (ADR 0099), o IpêBook passou a exibir aviso de atualização e redirecionamento para a Google Play Store baseado em uma tabela remota de política (`v2_app_version_policy`) no Supabase.

Embora esse mecanismo funcione e permita bloqueio emergencial (`min_supported_version`), ele exige uma etapa operacional manual a cada publicação: após o Google aprovar a nova versão no Play Console, o mantenedor precisa rodar um `UPDATE` no Supabase com a nova `latest_version`.

O objetivo desta decisão é complementar a arquitetura com verificação direta na Google Play, permitindo que o aplicativo descubra autonomamente quando há uma nova versão disponível na loja.

## Decisão

1. **Adotar a abstração `IInAppUpdateService` no domínio (`src/model/services/iInAppUpdateService.ts`):**
   - Define o contrato para verificação de disponibilidade de atualização e disparo do fluxo nativo ou redirecionamento direto.
2. **Implementar `MemoryInAppUpdateService` e provedor nativo resiliente:**
   - Permite 100% de cobertura nos testes unitários e de integração sem depender de mock complexo de bibliotecas nativas.
   - Em caso de indisponibilidade da loja, falhas de rede ou ambiente não-Google, o sistema cai com segurança para a política remota do Supabase ou encerra com `up_to_date`.
3. **Composição em `AppUpdateUseCases`:**
   - `AppUpdateUseCases` passa a orquestrar a verificação da loja nativa com fallback para a política remota.

## Consequências

- **Positivas:** Detecção automática de releases da Google Play Store sem necessidade de intervenção manual no banco a cada release; preservação de testes rápidos em Vitest; total isolamento por inversão de dependência (MVVM limpo).
- **Negativas:** Requer orquestração cuidadosa de timeout e tratamento de exceções para garantir que a inicialização do app nunca seja bloqueada por lentidão da rede.
