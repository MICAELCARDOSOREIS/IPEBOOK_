# Spec 050 — Mensagem formatada e compartilhamento dedicado no WhatsApp (Figma fluxo 08)

**Responsável:** Maria Clara (`pessoa:maria-clara`)
**Data:** 21 de outubro de 2026
**Issue:** #145
**Telas no Figma:** `08.01 · Compartilhar livro`, `08.02 · Convidar amigos`.

## Problema

O compartilhamento existente (Spec 019, Issue #74) só envia a URL nua do anúncio pelo menu nativo
do sistema (ou copia o link na Web). Não há texto formatado com título, autor e modalidade, nem um
botão dedicado ao WhatsApp — canal principal de divulgação da comunidade de Piripiri.

## Escopo

- `ShareUseCases.buildShareMessage`: texto em português com título, autor, modalidade (Venda,
  Troca, Doação; preço quando for venda) e o link do anúncio.
- `ShareUseCases.buildWhatsAppShareUrl`: URL do esquema `whatsapp://send?text=...` com a mensagem
  codificada.
- Nova ação `shareToWhatsApp` em `useShareListingViewModel`, com botão dedicado "Compartilhar no
  WhatsApp" em `BookDetail`, mantendo o botão genérico "Compartilhar" já existente (Spec 019).
- Fallback quando o WhatsApp não está instalado: `Linking.canOpenURL` decide entre abrir o
  WhatsApp ou cair no menu nativo de compartilhamento (`Share.share`) com a mesma mensagem
  formatada.
- Na Web (sem app de WhatsApp para abrir por esquema de URL): usa a Web Share API
  (`navigator.share`) quando disponível; sem suporte, copia a mensagem formatada para a área de
  transferência, reaproveitando o aviso "link copiado" já existente na interface.

## Regras de Negócio e Comportamento Esperado

- **RN-01 (Mensagem):** o texto segue o formato `"{título}" de {autor} — {modalidade}{preço}.` mais
  uma linha com o link do anúncio; o preço só aparece quando a modalidade é venda.
- **RN-02 (WhatsApp disponível):** `Linking.canOpenURL` verdadeiro aciona `Linking.openURL` com o
  esquema `whatsapp://send?text=...`.
- **RN-03 (Fallback nativo):** `Linking.canOpenURL` falso aciona o menu nativo de compartilhamento
  (`Share.share`) com a mesma mensagem, sem travar a tela nem lançar exceção não tratada.
- **RN-04 (Web):** usa a Web Share API quando `navigator.share` existe; caso contrário, copia a
  mensagem para a área de transferência.

## Critérios de Aceite

1. A mensagem de compartilhamento contém título, autor, modalidade e, quando aplicável, o preço.
2. Tocar em "Compartilhar no WhatsApp" abre o WhatsApp quando instalado.
3. Quando o WhatsApp não está instalado, o compartilhamento cai no menu nativo (mobile) ou na Web
   Share API/cópia de texto (Web), sem erro não tratado.
4. `npm run validate` passa.

## Validação

- Teste unitário do novo `buildShareMessage`/`buildWhatsAppShareUrl`.
- Teste de hook cobrindo WhatsApp disponível, fallback nativo, Web Share API e cópia na Web.
- Teste de componente cobrindo o novo botão em `BookDetail`.
- `npm run validate`.
