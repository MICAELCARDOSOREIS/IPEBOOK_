import { makeAuthViewModel } from "@/di/container";
import ManageAlert, { type ManageAlertProps } from "@/view/search/manageAlert";

type Props = Omit<ManageAlertProps, "userId" | "sessionLoading">;

export default function ManageAlertScreen(props: Props) {
  const [auth] = makeAuthViewModel();
  return <ManageAlert {...props} userId={auth.user?.id ?? null} sessionLoading={auth.loading} />;
}
