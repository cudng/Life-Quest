import { useSession } from "@/auth/session";

// The single admin (you). UX gate only — real enforcement is RLS in
// supabase/policies.sql. A UID is not a secret, safe to commit.
const ADMIN_UID = "ce4086d6-30ad-487b-b1f3-50c151a00d6a";

/** True only when the logged-in user is the admin. Gates edit controls (UX). */
export function useIsAdmin(): boolean {
  const session = useSession();
  return session?.user.id === ADMIN_UID;
}