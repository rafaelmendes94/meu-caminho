import { useAuth } from "@/hooks/useAuth";

export interface DisplayUser {
  name: string;
  firstName: string;
  email: string;
  avatarUrl: string | null;
  initial: string;
  planLabel: string;
  isEnterprise: boolean;
}

export function useDisplayUser(): DisplayUser {
  const { profile, user, organization, roles } = useAuth();
  const name =
    profile?.display_name ||
    profile?.full_name ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "Convidado";
  const firstName = name.split(" ")[0] || name;
  const email = user?.email ?? "";
  const avatarUrl = profile?.avatar_url ?? null;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initial = (
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : (parts[0]?.slice(0, 2) || "?")
  ).toUpperCase();
  const isEnterprise = !!organization;

  let planLabel = "Plano Free";
  if (roles.includes("platform_admin")) planLabel = "Super Admin";
  else if (organization) {
    const status = organization.subscription_status?.toLowerCase();
    if (status === "trial") planLabel = "Plano Trial";
    else if (status === "past_due") planLabel = "Pagamento pendente";
    else if (status === "canceled") planLabel = "Plano Cancelado";
    else planLabel = "Plano Enterprise";
  }

  return { name, firstName, email, avatarUrl, initial, planLabel, isEnterprise };
}