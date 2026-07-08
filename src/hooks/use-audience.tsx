import { useLocation } from "react-router-dom";
import { useCallback } from "react";

export type Audience = "b2c" | "enterprise-user" | "rh";

export function getAudience(pathname: string): Audience {
  if (pathname.startsWith("/enterprise/rh")) return "rh";
  if (pathname.startsWith("/enterprise")) return "enterprise-user";
  return "b2c";
}

export function useAudience(): Audience {
  const { pathname } = useLocation();
  return getAudience(pathname);
}

/**
 * Prefixa /enterprise em paths compartilhados quando o usuário está no
 * contexto Enterprise (colaborador). RH e rotas externas passam direto.
 */
export function prefixForAudience(path: string, audience: Audience): string {
  if (!path.startsWith("/")) return path;
  // Externos / âncoras
  if (path.startsWith("//") || path.startsWith("/#")) return path;
  // Já tem prefixo enterprise — não duplica
  if (path.startsWith("/enterprise")) return path;
  // Rotas que NÃO devem ser prefixadas (auth/marketing/admin/etc)
  const passthrough = [
    "/login",
    "/cadastro",
    "/onboarding",
    "/recuperar",
    "/recuperar-senha",
    "/redefinir-senha",
    "/verificar",
    "/auth",
    "/sobre",
    "/sobre-expert",
    "/planos",
    "/checkout",
    "/landing",
    "/privacy",
    "/termos",
    "/policy",
    "/admin",
    "/parent",
    "/crianca",
    "/kid",
    "/family",
  ];
  if (passthrough.some((p) => path === p || path.startsWith(p + "/"))) return path;

  if (audience === "enterprise-user") return `/enterprise${path}`;
  return path;
}

export function useAudienceLink() {
  const audience = useAudience();
  return useCallback(
    (path: string) => prefixForAudience(path, audience),
    [audience]
  );
}
