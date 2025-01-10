import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/nav/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Beratrack",
  description: "Track Berachain Discord roles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col mt-5">
          {/* Header Container */}
          <header className="w-full ">
            <div className="mx-auto max-w-[1200px] w-full px-4 nm:px-8 tablet:px-24">
              <Navbar />
            </div>
          </header>

          {/* Main Content Container */}
          <main className="flex-1 w-full">
            <div className="mx-auto max-w-[1200px] w-full px-4 nm:px-8 tablet:px-24 py-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
