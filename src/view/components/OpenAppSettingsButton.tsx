import { useState } from "react";
import { openSettings } from "expo-linking";
import { InlineErrorCard } from "@/view/components/InlineErrorCard";
import { OutlinedButton } from "@/view/components/OutlinedButton";

export function OpenAppSettingsButton() {
  const [failed, setFailed] = useState(false);

  return (
    <>
      <OutlinedButton
        label="Abrir Ajustes"
        onPress={() => {
          setFailed(false);
          void openSettings().catch(() => setFailed(true));
        }}
      />
      {failed ? <InlineErrorCard message="Abra os Ajustes do iPhone e procure o IpêBook para liberar o acesso." /> : null}
    </>
  );
}
