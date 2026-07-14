import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useEnterpriseSettings<T = any>(key: string, defaultValue: T) {
  const { organization } = useAuth();
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!organization?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("organization_settings")
      .select("value")
      .eq("organization_id", organization.id)
      .eq("key", key)
      .maybeSingle();
    if (error) console.error("[useEnterpriseSettings]", error);
    if (data?.value != null) setValue(data.value as T);
    setLoading(false);
  }, [organization?.id, key]);

  useEffect(() => { void load(); }, [load]);

  const save = useCallback(async (next: T) => {
    setSaving(true);
    const { data, error } = await supabase.rpc("enterprise_settings_upsert", {
      _key: key,
      _value: next as any,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message || "Falha ao salvar configuração.");
      return false;
    }
    if (data != null) setValue(data as T);
    else setValue(next);
    toast.success("Configurações salvas.");
    return true;
  }, [key]);

  return { value, setValue, save, loading, saving, reload: load };
}