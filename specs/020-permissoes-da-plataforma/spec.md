# Especificação 020: Permissões da Plataforma

## 1. Contexto e Problema

Algumas funcionalidades do app dependem de permissões nativas do sistema: saber o bairro da
pessoa (localização), avisar sobre atividade (notificações) e tirar/escolher fotos (câmera e
galeria, usado no fluxo de anunciar, spec 003). Hoje o app não trata explicitamente o fluxo de
pedir essas permissões nem o que fazer quando a pessoa nega.

Telas correspondentes no Figma (fluxo 11 · Recursos da plataforma): `11.01 · Escolher bairro`,
`11.02 · Permitir localização`, `11.03 · Permitir notificações`, `11.04 · Permitir acesso às
fotos`, `11.05 · Fotos não permitidas`.

## 2. Escopo e Restrições

- **O que faz parte:**
  - Tela de escolher o bairro manualmente (sem depender de localização), já que a beta é restrita
    a Piripiri (PI) — ver `docs/estado.md`, "O usuário definiu Piripiri, PI, como a única cidade
    da beta".
  - Pedido de permissão de localização com explicação do motivo, antes do prompt nativo do
    sistema (padrão recomendado pelas lojas de app).
  - Pedido de permissão de notificações, mesmo sem push nativo implementado ainda (spec 015
    registra isso como fora de escopo) — a permissão é pra quando push for implementado depois;
    aqui só o fluxo de pedir e tratar negação.
  - Pedido de permissão de câmera/galeria no fluxo de anunciar, com tela de fallback quando
    negado.
- **O que NÃO faz parte:**
  - Implementar push notification de fato (continua fora de escopo, como já registrado na
    spec 015).
  - Geolocalização automática por GPS — a localização aqui é a escolha manual de bairro dentro
    de Piripiri, não coordenadas.

## 3. Critérios de Aceite

- [x] O usuário escolhe o bairro de uma lista pré-definida de bairros de Piripiri, sem precisar
  conceder permissão de localização pra isso. (`PIRIPIRI_NEIGHBORHOODS` em
  `src/model/entities/location.ts`, seletor em `NeighborhoodSelectorModal` + `useActiveNeighborhood`.)
- [x] Quando uma funcionalidade pede permissão de localização, notificações ou fotos, o app
  mostra uma tela explicando o motivo antes do prompt nativo do sistema. Não há pedido de
  localização no app (a escolha do bairro é manual); notificações e fotos passaram pelo
  `PermissionPromptDialog` em 2026-11-05 — ver `validacao.md`.
- [x] Se o usuário nega a permissão, o app mostra um estado claro do que ficou indisponível e
  como habilitar depois (ex. link pras configurações do sistema), sem travar o restante do app.
  (`status === "denied"` do `PermissionPromptDialog`, mais o alerta do seletor de fotos.)
- [x] Negar permissão de fotos no fluxo de anunciar não impede publicar o anúncio — ele segue
  com a capa ilustrativa (ver `design-system/04-componentes/capa-ilustrativa.md`). O botão
  "Publicar sem foto" dispensa o acesso e `photoUrl` continua opcional na publicação. Conferido em
  navegador real: publicado sem foto, com o seletor nativo nunca aberto por essa escolha (evidência
  em `validacao.md`).
- [x] Cobertura de testes acima de 80% e zero violações em `npm run check:architecture`.
  Medido em 2026-11-05: 0 violações em 473 arquivos; cobertura global acima do mínimo de 80% das
  quatro dimensões (números na Seção 1 de `docs/estado.md` após o `npm run validate`).
