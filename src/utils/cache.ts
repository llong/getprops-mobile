import { atomWithStorage, createJSONStorage } from "jotai/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";

// For general-purpose, non-sensitive data, AsyncStorage is fine.
const asyncStorage = <T>() => createJSONStorage<T>(() => AsyncStorage);

/**
 * A wrapper around atomWithStorage that uses AsyncStorage by default.
 * This allows us to easily swap out the underlying storage engine in the future if needed.
 * @param key The key for the storage entry
 * @param initialValue The initial value of the atom
 * @returns A Jotai atom that is persisted to AsyncStorage.
 */
export const atomWithAsyncStorage = <T>(key: string, initialValue: T) =>
  atomWithStorage<T>(key, initialValue, asyncStorage());
