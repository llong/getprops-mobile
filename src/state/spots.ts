import { atom } from "jotai";
import { ISpot } from "@/types/spot";

export const spotsAtom = atom<ISpot[]>([]);