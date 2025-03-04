import React from "react";
import { ToastProvider as RNToastProvider } from "react-native-toast-notifications";

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <RNToastProvider>{children}</RNToastProvider>;
};
