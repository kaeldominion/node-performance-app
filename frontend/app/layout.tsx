import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/contexts/ThemeContext';
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NØDE OS",
  description: "NØDE OS - Performance Training Infrastructure. Elite training platform with structured workouts, AI-generated sessions, and comprehensive tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={clerkKey}>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body
          className={`${spaceGrotesk.variable} ${manrope.variable} antialiased bg-dark text-text-white`}
        >
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkErrorBoundary>
  );
}
