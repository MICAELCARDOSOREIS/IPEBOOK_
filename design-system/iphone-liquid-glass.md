# iPhone · iOS 26 — especificação visual Liquid Glass

Revisão do Figma em 24/11/2026. Responsável pela atualização: Micael Cardoso Reis.

Este documento registra as referências visuais do Figma em tema claro. A implementação usa abas nativas e material Liquid Glass no iOS compatível, com alternativa opaca para Reduzir Transparência. A homologação visual em iPhone segue pendente. [ADR 0123](../docs/adr/0123-liquid-glass-nativo-ios.md) · [Estado e continuidade](../docs/estado.md)

## Componentes e mapeamento

| Componente | Referência no Figma | Contrato |
| --- | --- | --- |
| Botão iPhone | [abrir](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=928-1090&m=dev) | Principal, secundário, texto, destrutivo, desativado; SF Pro Semibold 17 pt |
| Doação | [abrir](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=1353-3305&m=dev) | 361 × 52 pt no quadro de referência; âmbar e texto marrom |
| Seletor de localização | [abrir](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=1346-3014&m=dev) | 146 × 44 pt; padrão, pressionado, aberto; seta separada do texto |
| Filtro | [abrir](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=928-1131&m=dev) | 44 pt; padrão e selecionado com check; largura conforme rótulo |
| Campo de texto | [abrir](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=928-1101&m=dev) | Rótulo persistente, ajuda e erro |
| Busca | [abrir](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=928-1116&m=dev) | Busca, limpar e foco |
| Controle segmentado | [abrir](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=928-1138&m=dev) | Seleção explícita e rótulos |
| Card de livro compacto | [abrir](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=1000-284&m=dev) | Capa, modalidade, título, autor e disponibilidade |
| Favoritos | [abrir](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=916-450&m=dev) | Todos, Disponíveis, Reservados |
| Resultados da busca | [abrir](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=937-2563&m=dev) | Barra flutuante translúcida; Início, Explorar, Estante |

### Botões e rodapé

- Principal: `primary` (#2B6334) com `on-primary` (#FFFFFF); preenchimento 96%, contorno branco 28%, blur 14, sombra externa leve (raio 10, y=3, opacidade 16%) e brilho interno (raio 2, y=1, branco 32%).
- Doação: `brand-amber` (#F59E0B) com `brand-brown` (#58331F); preenchimento 96% e contorno branco 55%. O âmbar da ação não substitui o amarelo canônico `ipe-bloom` da capa e da tag.
- Botões de ação fixa: altura de referência 52 pt, formato cápsula, margem lateral 16 pt no conteúdo de 393 pt. Usar largura flexível na implementação e respeitar área segura inferior e texto ampliado.
- Secundário: vidro claro, blur 16 e sombra suave; destrutivo: `error-container` / `on-error-container`; desativado: `surface-container-high` / `on-surface-variant` conforme referência visual, sem interação.
- Rodapés de detalhe: superfície clara translúcida com opacidade 86% e blur 22. Em agendamento, usar superfície clara sólida (#FCFAF5) para evitar o fundo preto observado na renderização. Em Reduzir transparência, usar superfície opaca, não depender de blur.
- Controles de navegação e ação recebem vidro; conteúdo editorial, textos, formulários e capas não precisam de vidro indiscriminadamente.

### Validação e acessibilidade

Alvo recomendado de 44 pt no iPhone; texto normal com contraste mínimo 4,5:1 e controles/indicadores essenciais 3:1. Respeitar VoiceOver, Dynamic Type, Reduzir movimento e Reduzir transparência. As variantes de carregamento, foco e erro devem ser testadas na implementação; não presumir que a inspeção do Figma comprova funcionamento.

Foram inspecionados visualmente 88 quadros de tela, incluindo protótipos e estados; a revisão estrutural de conexões não substitui teste de ponta a ponta. Depois da padronização dos botões foram conferidas telas representativas. Há 72 instâncias da família de botões na página iPhone, cinco variantes existentes atualizadas e um componente de doação criado. O inventário atual está em [telas-iphone-figma.md](telas-iphone-figma.md).

## Referências complementares

- [Guia de acessibilidade do Figma](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=1344-2&m=dev) — critérios WCAG 2.2 AA, teclado, leitores de tela e movimento.
- [Biblioteca Web](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=1344-30&m=dev) — botões e campos com estados interativos.
- [Web / SearchBookCard](https://www.figma.com/design/cxEisNRzOQR6krv8Ow7HCa/Ip%C3%AABook?node-id=1345-642&m=dev) — grade/lista × venda/troca/doação; aplicação nas telas existentes ainda parcial.
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/).
