import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ouncebook.com";

const metadataBase = (() => {
  try {
    return new URL(siteUrl);
  } catch {
    return new URL("https://ouncebook.com");
  }
})();

export const metadata: Metadata = {
  metadataBase,
  title: "OunceBook | Coming Soon",
  description:
    "OunceBook is building a more intentional text network. Join the waitlist for first access.",
  openGraph: {
    title: "OunceBook | Coming Soon",
    description: "an Ounce of words in a pound of noise",
    url: siteUrl,
    type: "website",
    siteName: "OunceBook",
  },
  twitter: {
    card: "summary_large_image",
    title: "OunceBook | Coming Soon",
    description: "an Ounce of words in a pound of noise",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-ui">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
