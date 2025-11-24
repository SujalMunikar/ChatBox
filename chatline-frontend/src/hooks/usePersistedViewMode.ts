import { useCallback, useEffect, useState } from "react";

export type ViewMode = "card" | "compact";

// Persists a simple UI view mode toggle to localStorage and hydrates it on initial render.
export default function usePersistedViewMode(storageKey: string, defaultMode: ViewMode = "card") {
  const read = (): ViewMode => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "card" || saved === "compact") return saved;
    } catch {}
    return defaultMode;
  };

  const [mode, setMode] = useState<ViewMode>(read);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, mode);
    } catch {}
  }, [mode, storageKey]);

  const update = useCallback((m: ViewMode) => setMode(m), []);

  return [mode, update] as const;
}
