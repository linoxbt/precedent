import type { Metadata } from "next";
import "./globals.css";
import AppKitProvider from "@/components/AppKitProvider";
import WindowChrome from "@/components/WindowChrome";
import NavigationPane from "@/components/NavigationPane";

export const metadata: Metadata = {
  title: "Precedent Engine",
  description:
    "A trustless, precedent-consistent adjudication protocol for the agentic economy: on-chain case law for AI judgment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AppKitProvider>
          <WindowChrome>
            <NavigationPane />
            <main className="flex min-w-0 flex-1 flex-col">{children}</main>
          </WindowChrome>
        </AppKitProvider>
      </body>
    </html>
  );
}
