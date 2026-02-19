import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { SpeedInsights } from '@vercel/speed-insights/next';
import Providers from "@/components/Providers";

const twkLausanne = localFont({
  src: [
    { path: '../../fontlar/TWKLausanne-600.woff2', weight: '600', style: 'normal' },
    { path: '../../fontlar/TWKLausanne-700.woff2', weight: '700', style: 'normal' },
    { path: '../../fontlar/TWKLausanne-750.woff2', weight: '750', style: 'normal' },
    { path: '../../fontlar/TWKLausanne-800.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-twk-lausanne',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Veezet 2.0 - NFC Platform",
  description: "Modern NFC platform for business cards and digital products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az">
      <body
        className={`${twkLausanne.variable} ${inter.variable} font-body antialiased`}
        suppressHydrationWarning={true}
      >
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
