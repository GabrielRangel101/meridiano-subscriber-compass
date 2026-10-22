import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";
export const THEME_KEY = "gm-theme";
const listeners = new Set<() => void>();

export function getTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset["theme"] === "light" ? "light" : "dark";
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset["theme"] = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* armazenamento indisponível: mantém só na sessão */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getTheme, () => "dark");
}

/** Script inline do <head>: aplica o tema salvo antes da pintura; padrão escuro. */
export const THEME_BOOT_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");document.documentElement.dataset["theme"]=t==="light"?"light":"dark"}catch(e){document.documentElement.dataset["theme"]="dark"}`;
