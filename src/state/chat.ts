import { atom } from 'jotai';

export const activeConversationIdAtom = atom<string | null>(null);
activeConversationIdAtom.debugLabel = 'activeConversationId';

export const totalUnreadMessagesAtom = atom<number>(0);
totalUnreadMessagesAtom.debugLabel = 'totalUnreadMessages';