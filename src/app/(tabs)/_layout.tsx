import { Platform } from "react-native";
import { Slot } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { RequireAuth } from "@/view/components/RequireAuth";
import { replaceOnce } from "@/view/pushOnce";
import { useTheme } from "@/view/theme/ThemeProvider";

/**
 * Layout das 3 abas principais (Início, Explorar, Estante).
 * No iOS usa `NativeTabs` (`UITabBar` nativo com Liquid Glass no iOS 26+).
 * No Android e na Web delega via `<Slot />` para preservar o PagerView/NavigationBar e o WebHeader.
 */
export default function TabsLayout() {
  const { colors } = useTheme();

  if (Platform.OS !== "ios") {
    return <Slot />;
  }

  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/bem-vindo")}>
      <NativeTabs
        tintColor={colors.m3.primary}
        backgroundColor={colors.surface}
        blurEffect="none"
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} />
          {/* biome-ignore lint/correctness/noReactNativeRawText: NativeTabs.Trigger.Label exige string literal para o UITabBar nativo */}
          <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="pesquisa">
          <NativeTabs.Trigger.Icon sf="magnifyingglass" />
          {/* biome-ignore lint/correctness/noReactNativeRawText: NativeTabs.Trigger.Label exige string literal para o UITabBar nativo */}
          <NativeTabs.Trigger.Label>Explorar</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="meus-anuncios">
          <NativeTabs.Trigger.Icon sf={{ default: "books.vertical", selected: "books.vertical.fill" }} />
          {/* biome-ignore lint/correctness/noReactNativeRawText: NativeTabs.Trigger.Label exige string literal para o UITabBar nativo */}
          <NativeTabs.Trigger.Label>Estante</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </RequireAuth>
  );
}
