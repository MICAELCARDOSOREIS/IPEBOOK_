# Plano das correções da revisão integral

1. Registrar versões SQL únicas e fazer o verificador aplicar a lista completa. Criar políticas e função transacional em migrações posteriores, preservando migrações já publicadas.
2. Ajustar adaptadores e casos de uso para exportação completa e arquivo nativo, usando módulos oficiais compatíveis com Expo 57.
3. Corrigir a nomenclatura do filtro e manter as abas e contadores acessíveis.
4. Validar os contratos com testes de SQL, unidades e componentes; executar validação e build existentes.

O histórico remoto não será alterado nesta branch. A migração de edição de perfil com versão duplicada será substituída por uma migração posterior idempotente; conferir o estado remoto antes de publicar.
