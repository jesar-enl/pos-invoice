"use client";

import { useEffect } from "react";

export function useKeyboardShortcuts(map: Record<string, () => void>) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const fn = map[e.key];
      if (fn) {
        e.preventDefault();
        fn();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [map]);
}
