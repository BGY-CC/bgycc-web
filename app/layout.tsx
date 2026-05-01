import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

import { AuthProvider } from "@/hooks/use-auth";
import { UploadProvider } from "@/lib/contexts/upload-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full`}>
      <body className="antialiased font-sans h-full">
        <AuthProvider>
          <UploadProvider>
            {children}
          </UploadProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
