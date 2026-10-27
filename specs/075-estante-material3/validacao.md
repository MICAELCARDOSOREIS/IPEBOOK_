# Validação — Spec 075

## Automatizada (2026-10-26)

`npm run validate` aprovado: 174 arquivos / 1.278 testes, `tsc --noEmit` limpo, 0 violações de
arquitetura, 75 specs e 64 ADRs sem colisão. Em `tests/components/myListingsView.test.tsx`, os testes
de CA1–CA5 falharam antes da implementação; o teste por plataforma confirma o trilho segmentado do
iPhone (raio 9) e os *segmented buttons* do Android (CA6/CA7).

## Aparelho Android (Galaxy A16, ADB, Expo Go, tema claro)

- Cabeçalho "Estante", subtítulo e "+" (Anunciar livro). **Aprovado.**
- Cartões "1 à venda / 0 em troca / 0 para doar" nas cores das modalidades. **Aprovado.**
- Segmented buttons M3 com ✓ no selecionado e distintivo "1" em Propostas. **Aprovado.**
- "Precisa da sua atenção" com "… quer comprar · 1984" e "Ver proposta"; lista "1 anúncio" em cartão. **Aprovado.**
- Estados vazios de Propostas e Concluídos: cobertos por teste, não vistos no aparelho.

## Limitações

- iPhone: sem aparelho iOS disponível; o controle segmentado foi verificado por teste, não visualmente.
- Os ícones da barra de status seguem o tema do sistema (pendência anterior, ver Spec 074).
