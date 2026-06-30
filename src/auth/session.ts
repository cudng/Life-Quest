import { useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// Module-level store: one auth listener shared by every component that reads the
// session, instead of a subscription per hook call or a context provider.
let session: Session | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function init(): void {
  if (initialized) return;
  initialized = true;

  void supabase.auth.getSession().then(({ data }) => {
    session = data.session;
    emit();
  });

  supabase.auth.onAuthStateChange((_event, nextSession) => {
    session = nextSession;
    emit();
  });
}

function subscribe(listener: () => void): () => void {
  init();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Session | null {
  return session;
}

/** Reactive current Supabase session (null when signed out / still loading). */
export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSnapshot);
}