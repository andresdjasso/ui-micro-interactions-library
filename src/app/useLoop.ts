import { useEffect, useState } from "react";

/** Re-arms a scene every `loopMs` by returning an incrementing key to remount on. */
export function useLoop(loopMs: number, enabled = true): number {
  const [key, setKey] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setKey((k) => k + 1), loopMs);
    return () => clearInterval(id);
  }, [loopMs, enabled]);
  return key;
}
