import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SuggestFeatureButton from "@/components/SuggestFeatureButton";
import { LanguageProvider } from "@/lib/i18n";
import { ScenarioProvider } from "@/contexts/ScenarioContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SDLC AI-Impact Analyzer",
  description: "Quantifying AI's impact on the Software Development Lifecycle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          data-goatcounter="https://ai-sdlc.goatcounter.com/count"
          async
          src="//gc.zgo.at/count.js"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <ScenarioProvider>
            <Sidebar />
            <main className="ml-64 min-h-screen p-8">
              {children}
            </main>
            <SuggestFeatureButton />
          </ScenarioProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
