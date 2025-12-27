import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ToastProvider } from "@/components/ui/toast-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://applyos.pro'),
  title: {
    default: "ApplyOS - AI Resume Builder & Job Application Assistant",
    template: "%s | ApplyOS"
  },
  description: "Stop manually applying. ApplyOS uses advanced AI to build tailored resumes, generate cover letters, and auto-fill applications. Get hired faster with the ultimate career operating system.",
  keywords: ["AI resume builder", "auto apply jobs", "resume optimizer", "cover letter generator", "career ai", "job application bot", "ATS friendly resume"],
  authors: [{ name: "ApplyOS Team" }],
  creator: "ApplyOS",
  publisher: "ApplyOS Inc.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://applyos.pro",
    title: "ApplyOS - The OS for Your Career",
    description: "Automate your job search with AI. Build perfect resumes and apply in seconds.",
    siteName: "ApplyOS",
    images: [{
      url: "/og-image.png", // Ensure you have an image at public/og-image.png
      width: 1200,
      height: 630,
      alt: "ApplyOS Dashboard Preview"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "ApplyOS - AI Job Search Pilot",
    description: "Automate your job search. Build resumes, match jobs, and apply faster.",
    creator: "@applyos"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "google-site-verification-code", // User to replace
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
