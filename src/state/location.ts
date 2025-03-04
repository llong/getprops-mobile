import { atom } from "jotai";
import { Region } from "react-native-maps";

export const DEFAULT_REGION: Region = {
  latitude: 3.139,
  longitude: 101.6869,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const regionAtom = atom<Region>(DEFAULT_REGION);

export const userLocationAtom = atom<{
  latitude: number;
  longitude: number;
} | null>(null);
