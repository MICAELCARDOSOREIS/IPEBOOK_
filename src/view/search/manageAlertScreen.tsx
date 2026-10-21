import ManageAlert, { type ManageAlertProps } from "@/view/search/manageAlert";
import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";

type Props = Omit<ManageAlertProps, "userId">;

export default function ManageAlertScreen(props: Props) {
  const [auth] = useAuthViewModel();
  return <ManageAlert {...props} userId={auth.user?.id ?? null} />;
}
