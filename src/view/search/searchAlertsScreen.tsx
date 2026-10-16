import { useAuthViewModel } from "@/viewmodel/useAuthViewModel";
import SearchAlerts from "@/view/search/searchAlerts";

export type SearchAlertsScreenProps = { initialQuery?: string; onBack: () => void; onLogin: () => void };
export default function SearchAlertsScreen(props: SearchAlertsScreenProps) {
  const [auth] = useAuthViewModel();
  return <SearchAlerts {...props} userId={auth.user?.id ?? null} />;
}
