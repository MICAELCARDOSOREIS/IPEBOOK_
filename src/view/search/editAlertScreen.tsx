import { makeAuthViewModel } from "@/di/container";
import EditAlert, { type EditAlertProps } from "@/view/search/editAlert";

type Props = Omit<EditAlertProps, "userId">;

export default function EditAlertScreen(props: Props) {
  const [auth] = makeAuthViewModel();
  return <EditAlert {...props} userId={auth.user?.id ?? null} />;
}
