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
const socialImagePath = "/screenshot-ouncebook.png";

const metadataBase = (() => {
  try {
    return new URL(siteUrl);
  } catch {
    return new URL("https://ouncebook.com");
  }
})();

export const metadata: Metadata = {
  applicationName: "OunceBook",
  metadataBase,
  title: {
    default: "OunceBook | Coming Soon",
    template: "%s | OunceBook",
  },
  description:
    "OunceBook is building a more intentional text network. Join the waitlist for first access.",
  keywords: [
    "OunceBook",
    "coming soon",
    "waitlist",
    "text social network",
    "early access",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "OunceBook | Coming Soon",
    description: "an ounce of thought in a pound of noise",
    url: siteUrl,
    type: "website",
    siteName: "OunceBook",
    locale: "en_US",
    images: [
      {
        url: socialImagePath,
        width: 1918,
        height: 942,
        alt: "OunceBook coming soon page preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OunceBook | Coming Soon",
    description: "an ounce of thought in a pound of noise",
    images: [socialImagePath],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
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
