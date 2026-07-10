import { Navigate } from "react-router-dom";

// Legacy route: the old mock screen was replaced by the real
// weekly insights screen (EnterpriseWeeklyInsightsScreen), backed by
// the weekly_ai_insights table.
export default function EnterpriseAIInsightsScreen() {
  return <Navigate to="/enterprise/rh/insights" replace />;
}
