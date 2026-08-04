import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "./provider/querryProvider";
import { Toaster } from "./components/ui/sonner";
import { Header } from "./components/Header";
import { JsonLd } from "./components/JsonLd";
import { siteConfig, absoluteUrl } from "./lib/seo/site";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "VU exam preparation",
    "Virtual University MCQs",
    "VU handouts",
    "VU past papers",
    "VU solved MCQs",
    "VU final term preparation",
    "VU midterm preparation",
    "AI study assistant",
    "MCQ practice",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: siteConfig.locale,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
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
  category: "education",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Note: maximumScale / userScalable were removed — disabling zoom fails
  // WCAG 2.2 SC 1.4.4 (Resize Text) and costs Lighthouse accessibility points.
  themeColor: "#1e3a8a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    // Real, crawlable logo asset (SVG is a Google-supported logo format).
    // Previously pointed at the removed /favicon.ico.
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/icon-badge.svg"),
      width: 512,
      height: 512,
    },
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en",
  };

  // Preconnect to the API origin so the Header's /user/me call (and any client
  // fetches) start their TLS handshake early instead of on first request.
  let apiOrigin: string | null = null;
  try {
    apiOrigin = new URL(process.env.NEXT_PUBLIC_API_BASE_URL ?? "").origin;
  } catch {
    apiOrigin = null;
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {apiOrigin && <link rel="preconnect" href={apiOrigin} />}
        <JsonLd data={[organizationLd, websiteLd]} />
        <QueryProvider>
          <Header />
          {children}
          <Toaster position="top-left" />
        </QueryProvider>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-QCJRDCWGHB"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-QCJRDCWGHB');
          `}
        </Script>
      </body>
    </html>
  );
}

// <!-- Google tag (gtag.js) -->
// <script async src="https://www.googletagmanager.com/gtag/js?id=G-QCJRDCWGHB"></script>
// <script>
//   window.dataLayer = window.dataLayer || [];
//   function gtag(){dataLayer.push(arguments);}
//   gtag('js', new Date());

//   gtag('config', 'G-QCJRDCWGHB');
// </script>
