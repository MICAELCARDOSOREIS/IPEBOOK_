import type { MainTabsPagerProps } from "@/view/components/MainTabsPager";

/**
 * Na Web, as rotas `/`, `/pesquisa` e `/meus-anuncios` permanecem independentes no Expo Router
 * (preservando URLs, SSR e SEO sem empacotar `react-native-pager-view` no bundle Web, Spec 144).
 */
export function MainTabsPager({ homeContent }: MainTabsPagerProps) {
  return <>{homeContent}</>;
}

export default MainTabsPager;
