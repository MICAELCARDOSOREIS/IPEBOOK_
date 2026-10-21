# Plano — Spec 036

## Implementação

1. Acrescentar `modalities` aos alertas e preservar as três modalidades como padrão para registros existentes.
2. Filtrar notificações por modalidade tanto no adaptador em memória quanto no gatilho SQL.
3. Criar as rotas de gerenciamento e edição; converter cada item da lista em um alvo navegável.
4. Cobrir validação, correspondência, navegação, edição, pausa e exclusão por testes proporcionais.

## Verificação

- `npm run validate`: tipos, arquitetura, migrações/RLS e testes com cobertura.
- `npm run verify:release`: verificações de publicação existentes.
- Conferir as telas no Android por ADB quando houver aparelho disponível.

Nenhuma dependência nova é necessária. A migração é aditiva e mantém o comportamento anterior dos alertas existentes.
