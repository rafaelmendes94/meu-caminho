import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useOrgMinGroupSize(defaultValue = 5) {
  const { organization } = useAuth();
  const [min, setMin] = useState<number>(defaultValue);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!organization?.id) return;
      const { data } = await supabase.rpc("get_org_min_group_size", {
        _organization_id: organization.id,
      });
      if (alive && typeof data === "number") setMin(data);
    })();
    return () => {
      alive = false;
    };
  }, [organization?.id]);

  return min;
}