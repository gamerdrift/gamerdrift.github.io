import type { Metadata } from "next";
import "./globals.css";
import "../styles/cyberpunk.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GridBeams from "../components/GridBeams";
import { GameProvider } from "../lib/state/GameContext";
import { UserProvider } from "../lib/state/UserContext";

export const metadata: Metadata = {
  title: "GamerDrift – Premium Gaming Hub",
  description: "Discover and play premium retro games with a cyber‑punk UI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-cyber-bg text-text-primary transition-colors duration-300">
        <UserProvider>
          <GameProvider>
            <GridBeams />
            <Header />
            {process.env.NEXT_PUBLIC_GA_ID && (
              <>
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}></script>
                <script dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}} />
              </>
            )}
            <main className="flex-grow flex flex-col">
              {children}
            </main>
            <Footer />
          </GameProvider>
        </UserProvider>
      </body>
    </html>
  );
}
