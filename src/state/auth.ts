import { atom } from 'jotai'
import type { Session, User, WeakPassword } from '@supabase/supabase-js'
import type { UserProfile, Spot, LikedMediaItem, UserMediaItem, AppNotification } from '../types'
import { supabase } from "@utils/supabase";

export type Auth = {
    user: User;
    session: Session | null;
    weakPassword?: WeakPassword;
}

export const userAtom = atom<Auth | null>(null)
userAtom.debugLabel = 'user';
export const isLoggedInAtom = atom((get) => get(userAtom) !== null)
isLoggedInAtom.debugLabel = 'isLoggedIn';

export const profileAtom = atom<UserProfile | null>(null);
profileAtom.debugLabel = 'profile';

// Social Data Atoms
export const favoriteSpotsAtom = atom<Spot[]>([]);
export const likedMediaAtom = atom<LikedMediaItem[]>([]);
export const followersCountAtom = atom<number>(0);
export const followingCountAtom = atom<number>(0);

// Content Data Atoms
export const createdSpotsAtom = atom<Spot[]>([]);
export const userMediaAtom = atom<UserMediaItem[]>([]);

// Loading States
export const profileLoadingAtom = atom<boolean>(false);
export const socialLoadingAtom = atom<boolean>(false);
export const contentLoadingAtom = atom<boolean>(false);

// Global Fetch Tracking
export const fetchedUserIdsAtom = atom<Set<string>>(new Set<string>());

// Notifications Data Atoms
export const notificationsAtom = atom<AppNotification[]>([]);
export const unreadNotificationsCountAtom = atom<number>(0);
export const notificationsLoadingAtom = atom<boolean>(false);
export const fetchedNotificationsUserIdAtom = atom<string | null>(null);

// Legacy/Compatibility
export const authAtom = atom<User | null>((get) => get(userAtom)?.user || null);

export const authStateAtom = atom(null, async (get, set) => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    console.error("Error getting session:", error);
    set(userAtom, null);
    return;
  }
  if (session) {
      set(userAtom, { user: session.user, session });
  } else {
      set(userAtom, null);
  }
});