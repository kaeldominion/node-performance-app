import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ClerkErrorBoundary } from '@/components/ClerkErrorBoundary';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AchievementNotificationProvider } from '@/contexts/AchievementNotificationContext';
import { WorkoutGenerationProvider } from '@/contexts/WorkoutGenerationContext';
import { WorkoutGenerationNotificationWrapper } from '@/components/workout/WorkoutGenerationNotificationWrapper';
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
    <ClerkErrorBoundary>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body
          className={`${spaceGrotesk.variable} ${manrope.variable} antialiased bg-dark text-text-white`}
        >
          <ThemeProvider>
            <AchievementNotificationProvider>
              <WorkoutGenerationProvider>
                <WorkoutGenerationNotificationWrapper />
                {children}
              </WorkoutGenerationProvider>
            </AchievementNotificationProvider>
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkErrorBoundary>
  );
}
