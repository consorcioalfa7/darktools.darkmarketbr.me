import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#000000' },
  ],
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://darktoolslabs.com'),
  title: {
    default: "DarkToolsLabs - Suite de Ferramentas Premium",
    template: "%s | DarkToolsLabs"
  },
  description: "Suite completa de ferramentas avançadas de validação e análise. CHK AMEX, CHK CARDS, CC-GEN, DARK GG FACTORY, DATABASE e FIND GATE.",
  keywords: [
    "DarkToolsLabs",
    "DarkMarket",
    "CHK AMEX",
    "CHK CARDS",
    "CC-GEN",
    "DARK GG FACTORY",
    "FIND GATE",
    "DATABASE",
    "Validação de Cartões",
    "Ferramentas Premium"
  ],
  authors: [{ name: "DarkToolsLabs", url: "https://t.me/DarkToolsLabs" }],
  creator: "DarkToolsLabs",
  publisher: "DarkToolsLabs",
  applicationName: "DarkToolsLabs",
  icons: {
    icon: [
      { url: "/darktools-logo.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/darktools-logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://darktoolslabs.com",
    siteName: "DarkToolsLabs",
    title: "DarkToolsLabs - Suite de Ferramentas Premium",
    description: "Suite completa de ferramentas avançadas de validação e análise.",
    images: [
      {
        url: "/darktools-logo.png",
        width: 1200,
        height: 630,
        alt: "DarkToolsLabs"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "DarkToolsLabs - Suite de Ferramentas Premium",
    description: "Suite completa de ferramentas avançadas de validação e análise.",
    images: ["/darktools-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <head>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
