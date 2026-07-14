import { useEffect, useState } from "react";

/**
 * Fallback exibido durante o code-splitting das rotas.
 * - Nos primeiros 150ms fica invisível (evita flash em rotas rápidas).
 * - Depois mostra um skeleton suave que respeita o tema.
 */
export default function RouteFallback() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-background transition-opacity duration-200 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-muted border-t-primary animate-spin" />
        <span className="text-sm text-muted-foreground">Carregando…</span>
      </div>
    </div>
  );
}