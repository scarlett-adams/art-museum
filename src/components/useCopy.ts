import { useState } from "react";

/** Copies text to the clipboard and reports how it went for a moment. */
export function useCopy() {
  const [status, setStatus] = useState<"copied" | "failed" | null>(null);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    setTimeout(() => setStatus(null), 2500);
  }

  return [status, copy] as const;
}
