import EditAlert, { type EditAlertProps } from "@/view/search/editAlert";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";

type Props = Omit<EditAlertProps, "userId">;

export default function EditAlertScreen(props: Props) {
  const [auth] = useAuthViewModel();
  return <EditAlert {...props} userId={auth.user?.id ?? null} />;
}
