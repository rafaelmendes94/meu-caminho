
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS code text;

CREATE OR REPLACE FUNCTION public.check_department_cycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cur uuid := NEW.parent_id;
  hops int := 0;
BEGIN
  IF NEW.parent_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.parent_id = NEW.id THEN
    RAISE EXCEPTION 'Ciclo detectado: departamento não pode ser pai de si mesmo';
  END IF;
  WHILE cur IS NOT NULL AND hops < 50 LOOP
    IF cur = NEW.id THEN
      RAISE EXCEPTION 'Ciclo detectado na hierarquia de departamentos';
    END IF;
    SELECT parent_id INTO cur FROM public.departments WHERE id = cur;
    hops := hops + 1;
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_departments_no_cycle ON public.departments;
CREATE TRIGGER trg_departments_no_cycle
BEFORE INSERT OR UPDATE OF parent_id ON public.departments
FOR EACH ROW EXECUTE FUNCTION public.check_department_cycle();

CREATE OR REPLACE FUNCTION public.check_manager_cycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cur uuid := NEW.manager_id;
  hops int := 0;
BEGIN
  IF NEW.manager_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.manager_id = NEW.id THEN
    RAISE EXCEPTION 'Ciclo detectado: colaborador não pode ser gestor de si mesmo';
  END IF;
  WHILE cur IS NOT NULL AND hops < 50 LOOP
    IF cur = NEW.id THEN
      RAISE EXCEPTION 'Ciclo detectado na cadeia de gestores';
    END IF;
    SELECT manager_id INTO cur FROM public.profiles WHERE id = cur;
    hops := hops + 1;
  END LOOP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_no_manager_cycle ON public.profiles;
CREATE TRIGGER trg_profiles_no_manager_cycle
BEFORE INSERT OR UPDATE OF manager_id ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.check_manager_cycle();
