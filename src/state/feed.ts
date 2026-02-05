import { atom } from 'jotai';

export interface FeedFilters {
    nearMe: boolean;
    maxDistKm: number;
    spotTypes: string[];
    difficulties: string[];
    riderTypes: string[];
    maxRisk: number;
    selectedLocation?: {
        lat: number;
        lng: number;
        name: string;
    };
    author?: {
        id: string;
        username: string;
        displayName: string;
        avatarUrl?: string | null;
    };
}

export const INITIAL_FEED_FILTERS: FeedFilters = {
    nearMe: false,
    maxDistKm: 50,
    spotTypes: [],
    difficulties: [],
    riderTypes: [],
    maxRisk: 5,
};

// For mobile, we might want to persist this using AsyncStorage via jotai/utils,
// but for now we'll start with a basic atom.
export const feedFiltersAtom = atom<FeedFilters>(INITIAL_FEED_FILTERS);
feedFiltersAtom.debugLabel = 'feedFilters';