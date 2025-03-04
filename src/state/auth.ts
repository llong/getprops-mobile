import { User } from "@supabase/supabase-js";
import { atom } from "jotai";
import { supabase } from "@utils/supabase";

export const authAtom = atom<User | null>(null);

export const authStateAtom = atom(null, async (get, set) => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting session:", error);
    set(authAtom, null);
    return;
  }
  set(authAtom, session?.user || null);
});
