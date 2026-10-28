import { ScrollViewStyleReset, useServerDocumentContext } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * HTML raiz da Web (Spec 025 / Issue #121).
 * Define idioma pt-BR, Web App Manifest, cores temáticas e meta tags PWA para instalação no celular.
 * Desde o Expo 58, os scripts e estilos do bundle chegam por `useServerDocumentContext`;
 * sem renderizar `headNodes` e `bodyNodes` a página exportada fica em branco.
 */
export default function Root({ children }: PropsWithChildren) {
  const { htmlAttributes, bodyAttributes, headNodes, bodyNodes } = useServerDocumentContext();
  return (
    <html lang="pt-BR" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#2C5E45" />
        <meta name="description" content="Marketplace comunitário de livros em Piripiri, PI (venda, troca e doação)" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="IpêBook" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icone-192.png" />
        <ScrollViewStyleReset />
        {/* Barras de rolagem finas e discretas nos dois temas (a nativa do Chrome fica branca no escuro). */}
        <style
          dangerouslySetInnerHTML={{
            __html: [
              `*{scrollbar-width:thin;scrollbar-color:rgba(128,128,128,.45) transparent}`,
              // Foco de teclado visível nos dois temas: anel escuro com halo claro (WCAG 2.4.7).
              `:focus-visible{outline:2px solid #1F4A35;outline-offset:2px;box-shadow:0 0 0 5px #CFE8D9;border-radius:8px}`,
              `[role="button"],[role="link"],[role="tab"],[role="radio"],[role="checkbox"],[role="switch"],[role="search"]{cursor:pointer}`,
              `[aria-disabled="true"]{cursor:not-allowed}`,
              `@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}`,
            ].join(""),
          }}
        />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){});});}`,
          }}
        />
      </body>
    </html>
  );
}
