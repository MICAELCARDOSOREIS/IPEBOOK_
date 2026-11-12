import { makeAuthViewModel } from "@/di/container";
import SearchAlerts from "@/view/search/searchAlerts";

export type SearchAlertsScreenProps = {
  initialQuery?: string;
  onBack: () => void;
  onLogin: () => void;
  onSearchBooks?: () => void;
  onManageAlert?: (alertId: string) => void;
};
export default function SearchAlertsScreen(props: SearchAlertsScreenProps) {
  const [auth] = makeAuthViewModel();
  return <SearchAlerts {...props} userId={auth.user?.id ?? null} />;
}
