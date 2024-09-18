import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";
import { Toaster } from "sonner";
import { StoreProvider } from "./StoreProvider";
import ViewListener from "./route-change-listener";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Keiko Julia",
  description: "Keiko Julia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="icon" href="/Logo.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <Providers>
          <StoreProvider>
            <ViewListener>{children}</ViewListener>
          </StoreProvider>
          {/* <Navbar >
					</Navbar>
					<Footer /> */}
        </Providers>
				<Toaster position="top-center" />
      </body>
    </html>
  );
}
