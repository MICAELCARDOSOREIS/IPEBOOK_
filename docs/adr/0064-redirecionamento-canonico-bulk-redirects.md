# ADR 0064 — Redirecionamento canônico de ipebook.pages.dev via Bulk Redirects da Cloudflare

- **Status:** Aceito
- **Data:** 26 de outubro de 2026
- **Autores:** Micael Cardoso Reis (`pessoa:micael`)
- **Substitui:** item 2 da decisão do ADR 0063 (regra de domínio em `public/_redirects`).
- **Relacionado a:** ADR 0020 (Publicação Web via Cloudflare Pages) e ADR 0063 (domínio próprio `ipebook.app`).

## Contexto

O ADR 0063 previa redirecionar `ipebook.pages.dev` para `ipebook.app` com a regra `https://ipebook.pages.dev/* https://ipebook.app/:splat 301!` no topo de `public/_redirects`.

Após a publicação de 26/10/2026 (deploy `21d54d3d`), `https://ipebook.pages.dev/termos` continuou respondendo HTTP 200, sem redirecionamento. O arquivo `_redirects` do Cloudflare Pages só aceita origens relativas (`/caminho`); regras com domínio na origem são ignoradas.

## Decisão

1. Fazer o redirecionamento canônico pelo recurso **Bulk Redirects** da conta Cloudflare:
   - Lista `ipebook_canonico`: origem `ipebook.pages.dev`, destino `https://ipebook.app`, status 301, com "Preservar string de consulta", "Correspondência de subcaminho" e "Preservar sufixo do caminho" ativos. "Incluir subdomínios" fica desativado para manter acessíveis as pré-visualizações `*.ipebook.pages.dev`.
   - Regra `ipebook dominio canonico`, habilitada, associada à lista.
2. Remover a regra de domínio de `public/_redirects`, que permanece apenas com os rewrites `200` de rotas dinâmicas.

## Consequências

- **Positivas:** o redirecionamento funciona na borda, sem código e sem invocações de Pages Functions. Verificado: `https://ipebook.pages.dev/termos?x=1` responde 301 com `location: https://ipebook.app/termos?x=1`.
- **Negativas / Atenção Operacional:** a regra vive no painel da Cloudflare (Entrega e desempenho → Redirecionamentos em massa), fora do repositório. Recriar o projeto ou trocar de conta exige refazê-la conforme `docs/implantacao-cloudflare.md`.

## Alternativas consideradas

- **Pages Function `_middleware`** verificando o host: descartada porque cada requisição passaria a contar como invocação de Worker.
- **Redirecionamento no cliente (JavaScript):** descartado por não emitir 301 e não ajudar indexação.
