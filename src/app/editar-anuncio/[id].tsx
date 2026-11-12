import { useLocalSearchParams } from "expo-router";
import { backOnce, replaceOnce } from "@/view/pushOnce";
import { RequireAuth } from "@/view/components/RequireAuth";
import EditListingScreen from "@/view/listings/editListingScreen";

export default function EditarAnuncioRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <RequireAuth onRequireSignIn={() => replaceOnce("/entrar")}>
      <EditListingScreen
        bookId={id}
        onSaved={() => backOnce()}
        onCancel={() => backOnce()}
        onRequireSignIn={() => replaceOnce("/entrar")}
      />
    </RequireAuth>
  );
}
