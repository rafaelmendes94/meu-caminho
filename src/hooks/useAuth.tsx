import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export type AppRole = "owner" | "rh_admin" | "leader" | "employee" | "b2c_user" | "platform_admin";

export interface Profile {
  id: string;
  organization_id: string | null;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  job_title: string | null;
  department: string | null;
  phone: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  subscription_status: string | null;
  licenses_total?: number | null;
  licenses_used?: number | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  organization: Organization | null;
  hasEmployeeProfile: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function loadUserData(userId: string) {
  const [{ data: profile }, { data: rolesData }, { data: empProfile }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase.from("employee_profiles").select("id").eq("user_id", userId).maybeSingle(),
  ]);

  let organization: Organization | null = null;
  if (profile?.organization_id) {
    const { data: org } = await supabase
      .from("organizations")
        .select("id, name, slug, logo_url, subscription_status, licenses_total, licenses_used")
      .eq("id", profile.organization_id)
      .maybeSingle();
    organization = (org as Organization) ?? null;
  }

  const roles = ((rolesData ?? []) as { role: AppRole }[]).map((r) => r.role);
  return { profile: (profile as Profile) ?? null, roles, organization, hasEmployeeProfile: !!empProfile };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [hasEmployeeProfile, setHasEmployeeProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  const hydrate = async (nextSession: Session | null) => {
    if (nextSession?.user) {
      // Gate consumers until roles/profile are loaded, so role-based
      // redirects don't fire with a stale empty roles array.
      setLoading(true);
      setSession(nextSession);
      setUser(nextSession.user);
      try {
        const data = await loadUserData(nextSession.user.id);
        setProfile(data.profile);
        setRoles(data.roles);
        setOrganization(data.organization);
        setHasEmployeeProfile(data.hasEmployeeProfile);
      } catch (e) {
        console.error("[auth] loadUserData failed", e);
      }
    } else {
      setSession(null);
      setUser(null);
      setProfile(null);
      setRoles([]);
      setOrganization(null);
      setHasEmployeeProfile(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Defer supabase calls out of the listener
      setTimeout(() => { void hydrate(nextSession); }, 0);
    });

    supabase.auth.getSession().then(({ data }) => { void hydrate(data.session); });

    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    profile,
    roles,
    organization,
    hasEmployeeProfile,
    loading,
    isAuthenticated: !!session,
    hasRole: (role) => roles.includes(role),
    hasAnyRole: (rs) => rs.some((r) => roles.includes(r)),
    signInWithPassword: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ?? null };
    },
    signInWithGoogle: async () => {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) return { error: result.error instanceof Error ? result.error : new Error(String(result.error)) };
      return { error: null };
    },
    signUp: async (email, password, metadata) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: metadata,
        },
      });
      return { error: error ?? null };
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
    refresh: async () => {
      if (user) {
        const data = await loadUserData(user.id);
        setProfile(data.profile);
        setRoles(data.roles);
        setOrganization(data.organization);
        setHasEmployeeProfile(data.hasEmployeeProfile);
      }
    },
  }), [user, session, profile, roles, organization, hasEmployeeProfile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}