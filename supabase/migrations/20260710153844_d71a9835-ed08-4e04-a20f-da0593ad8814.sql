-- Privacy fix: RH must NOT read raw employee_profiles rows.
-- Only the safe aggregated view (employee_profiles_rh_view) is exposed to RH.

DROP POLICY IF EXISTS employee_profiles_rh_read_same_org ON public.employee_profiles;

-- Make the RH aggregate view run as its owner (definer semantics), so it can
-- still read the base table even without an RH RLS policy on it.
ALTER VIEW public.employee_profiles_rh_view SET (security_invoker = false);

-- Ensure only authenticated RH-side reads reach the view; grants are unchanged
-- but restated for clarity.
GRANT SELECT ON public.employee_profiles_rh_view TO authenticated;
REVOKE SELECT ON public.employee_profiles_rh_view FROM anon;