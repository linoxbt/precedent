import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import AppKitProvider from "@/components/AppKitProvider";

export const metadata: Metadata = {
  title: "Precedent Engine",
  description:
    "A trustless, precedent-consistent adjudication protocol for the agentic economy — on-chain case law for AI judgment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <AppKitProvider>
          <TopNav />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppKitProvider>
      </body>
    </html>
  );
}
