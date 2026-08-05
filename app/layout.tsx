import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Enterprise Student Marketplace",
    template: "%s | Enterprise Student Marketplace"
  },
  description: "The premier platform connecting university talent with enterprise opportunities.",
  keywords: ["student jobs", "enterprise marketplace", "freelance tasks", "university talent"],
  openGraph: {
    title: "Enterprise Student Marketplace",
    description: "Connect university students with leading enterprise opportunities.",
    type: "website",
    siteName: "Enterprise Student Marketplace",
  },
  twitter: {
    card: "summary_large_image",
    title: "Enterprise Student Marketplace",
    description: "Connect university students with leading enterprise opportunities.",
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
      className={cn("h-full", "antialiased", "dark", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
