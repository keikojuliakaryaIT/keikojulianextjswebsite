"use client";
import type { AppStore } from "@/components/lib/store";
import { makeStore } from "@/components/lib/store";
import { setupListeners } from "@reduxjs/toolkit/query";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { analytics } from "@/components/firebase/config";

interface Props {
  readonly children: ReactNode;
}

export const StoreProvider = ({ children }: Props) => {
  // const pathname = usePathname();
  // useEffect(() => {
  //   console.log(`Route changed to: ${pathname}`);
  // }, [pathname]);

  useEffect(() => {
    // logEvent(analytics, "screen_view", {
    //   firebase_screen: screenName,
    //   firebase_screen_class: screenClass,
    // });
    analytics;
  }, []);
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  useEffect(() => {
    if (storeRef.current != null) {
      // configure listeners using the provided defaults
      // optional, but required for `refetchOnFocus`/`refetchOnReconnect` behaviors
      const unsubscribe = setupListeners(storeRef.current.dispatch);
      return unsubscribe;
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
};
