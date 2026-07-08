import { useEffect, useState } from "react";

const KEY = "mc-theme";

function read(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "dark";
}

function apply(dark: boolean) {
  const root = document.documentElement;
  if (dark) root.classList.add("dark");
  else root.classList.remove("dark");
  localStorage.setItem(KEY, dark ? "dark" : "light");
}

export function useDarkMode(): [boolean, (v?: boolean) => void] {
  const [dark, setDark] = useState<boolean>(() => read());

  useEffect(() => {
    apply(dark);
  }, [dark]);

  const toggle = (v?: boolean) => setDark((d) => (typeof v === "boolean" ? v : !d));
  return [dark, toggle];
}
