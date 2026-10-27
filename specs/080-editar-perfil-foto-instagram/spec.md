# Spec 080 — Editar perfil profissional: foto pela câmera ou galeria e Instagram

**Data:** 26 de outubro de 2026 · **ADR:** 0065 · **Tela:** `src/view/profile/profile.tsx`

## Escopo

1. **Foto**: no topo do formulário, avatar grande com ações "Galeria" e "Câmera" (e "Remover" quando há foto).
   A imagem é recortada em 1:1, validada por *magic bytes* (JPEG, PNG, WebP) e 5 MB, enviada ao Storage e
   aparece no cartão de leitor; só é gravada no perfil ao salvar. Estados: enviando, erro amigável, permissão negada.
2. **Instagram** no lugar de "Rede social": aceita `@perfil` ou `perfil`, guarda como `@perfil`, valida
   letras, números, ponto e sublinhado (até 30) e não aceita link.
3. **Acabamento M3**: seções em cartões, sem o campo de link da foto.

## Critérios de aceite

| # | Critério | Verificação |
|---|---|---|
| CA1 | Magic bytes reconhecem JPEG, PNG e WebP e recusam o resto | teste unitário |
| CA2 | Caso de uso recusa arquivo grande/inválido e envia para `<id>/perfil/` | teste unitário |
| CA3 | Escolher foto mostra no cartão e salvar grava a URL | teste de componente |
| CA4 | Cancelar a escolha não muda nada; erro aparece sem travar a tela | teste de viewmodel |
| CA5 | Instagram normaliza `@`, recusa inválido e salva `@perfil` | teste de componente |
| CA6 | Fluxo real com galeria no Galaxy A16 | ADB |

## Evolução no Meu perfil (2026-10-26)

- O Instagram aparece **dentro do cartão de leitor** do Meu perfil, como botão "@perfil" que abre
  `https://instagram.com/perfil`; sem @ cadastrado, o botão "Adicionar Instagram" leva ao Editar perfil.
- No Meu perfil o selo do ipê no canto do cartão saiu (`showMark={false}`), para o nome caber; a prévia do
  Editar perfil mantém o selo.
- Plural das métricas: "1 publicação", "1 troca".

## Validação

`npm run validate` aprovado (181 arquivos / 1.309 testes). No Galaxy A16, o seletor de fotos do Android abriu
pelo botão "Galeria" e a foto escolhida pelo usuário apareceu no cartão do Meu perfil depois de salva — fluxo
real de envio ao Supabase Storage confirmado. O Instagram dentro do cartão ainda não foi conferido no aparelho.
