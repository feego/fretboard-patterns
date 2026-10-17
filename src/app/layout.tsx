import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SocialLinks from "../components/SocialLinks";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const THEME_SCRIPT = `try{if(localStorage.getItem("fretboard-theme")!=="dark")document.documentElement.dataset.theme="light"}catch(e){document.documentElement.dataset.theme="light"}`;

export const metadata: Metadata = {
  applicationName: "Fretboard Visualizer",
  title: "Fretboard Visualizer",
  description: "Interactive guitar fretboard visualizer",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* Apply the saved theme before first paint (light unless "dark" was saved). */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static inline script, no user input
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <SocialLinks />
      </body>
    </html>
  );
}
