"use client";

// import { analytics, app } from "@/components/firebase/config";
// import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
// import { usePathname } from "next/navigation";
import { ReactNode } from "react";
interface Props {
  readonly children: ReactNode;
}
export default function RouteChangeListener({ children }: Props) {
  // const pathname = usePathname();

  // useEffect(() => {
  //   console.log(`Route changed to: ${pathname}`);
  //   const myString = "This is a sentence.";
  //   const words = pathname.split("/");
  //   console.log("words ", words[words.length - 1]);

  //   isSupported().then((yes) =>
  //     yes
  //       ? logEvent(getAnalytics(app), "screen_view", {
  //           firebase_screen: words[words.length - 1],
  //           firebase_screen_class: "User",
  //         })
  //       : null
  //   );

  // }, [pathname]);

  return <>{children}</>;
}
