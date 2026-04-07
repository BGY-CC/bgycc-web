import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | BGYCC Admin",
    default: "BGYCC Admin — School of Leadership",
  },
  description: "BGYCC School of Leadership admin dashboard",
  icons: {
    icon: "/bgycc_logo.svg",
    shortcut: "/bgycc_logo.svg",
    apple: "/bgycc_logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
