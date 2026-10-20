import { useMemo, useSyncExternalStore } from "react";

// localStorage can be missing or throw (private browsing, blocked storage),
// so values are also kept in memory and the game still works without it.
const memory = new Map<string, string>();
const listeners = new Set<() => void>();

function read(key: string): string | null {
  if (memory.has(key)) return memory.get(key)!;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parse<T>(text: string | null): T | null {
  if (text === null) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readStored<T>(key: string): T | null {
  return parse<T>(read(key));
}

export function writeStored(key: string, value: unknown) {
  const text = JSON.stringify(value);
  memory.set(key, text);
  try {
    localStorage.setItem(key, text);
  } catch {
    // Keep the in-memory copy.
  }
  listeners.forEach((listener) => listener());
}

/** A stored JSON value that re-renders when it changes. Null on the server. */
export function useStored<T>(key: string): T | null {
  const text = useSyncExternalStore(subscribe, () => read(key), () => null);
  return useMemo(() => parse<T>(text), [text]);
}
