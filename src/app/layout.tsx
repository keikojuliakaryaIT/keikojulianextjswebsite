import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";
import { Toaster } from "sonner";
import { StoreProvider } from "./StoreProvider";
import ViewListener from "./route-change-listener";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Keiko Julia Karya",
  description: "Keiko Julia Karya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <StoreProvider>
            <ViewListener>{children}</ViewListener>
          </StoreProvider>
          {/* <Navbar >
					</Navbar>
					<Footer /> */}
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
