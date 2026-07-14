import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  EMPLOYEE_NAV,
  EMPLOYEE_GROUP_LABEL,
  type EmployeeNavItem,
} from "./employeeNav";
import { getRecentRoutes, getContinueItems } from "@/lib/employeePrefs";

/**
 * Employee global search / command palette.
 * Opens with ⌘K / Ctrl+K. Purely client-side navigation index
 * plus recent routes and "continue where you left off". Does NOT
 * hit the network or change business logic.
 */

export const EmployeeCommandPalette: React.FC<{
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}> = ({ open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const navigate = useNavigate();

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const recents = React.useMemo(() => getRecentRoutes(6), [open]);
  const continues = React.useMemo(() => getContinueItems(5), [open]);

  const grouped = React.useMemo(() => {
    const g: Record<EmployeeNavItem["group"], EmployeeNavItem[]> = {
      jornada: [],
      conteudo: [],
      "bem-estar": [],
      conta: [],
    };
    for (const item of EMPLOYEE_NAV) g[item.group].push(item);
    return g;
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar tela, curso, livro, vídeo…" />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>

        {continues.length > 0 && (
          <>
            <CommandGroup heading="Continuar de onde parou">
              {continues.map((c) => (
                <CommandItem
                  key={`${c.kind}-${c.id}`}
                  value={`continuar ${c.title} ${c.kind}`}
                  onSelect={() => go(c.href)}
                >
                  <span className="text-xs uppercase text-muted-foreground mr-2">
                    {c.kind}
                  </span>
                  {c.title}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {recents.length > 0 && (
          <>
            <CommandGroup heading="Recentes">
              {recents.map((r) => (
                <CommandItem
                  key={r.path}
                  value={`recente ${r.label ?? r.path}`}
                  onSelect={() => go(r.path)}
                >
                  {r.label ?? r.path}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {(Object.keys(grouped) as EmployeeNavItem["group"][]).map((g) => (
          <CommandGroup key={g} heading={EMPLOYEE_GROUP_LABEL[g]}>
            {grouped[g].map((it) => (
              <CommandItem
                key={it.path}
                value={`${it.label} ${(it.keywords ?? []).join(" ")}`}
                onSelect={() => go(it.path)}
              >
                {it.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
};

export default EmployeeCommandPalette;