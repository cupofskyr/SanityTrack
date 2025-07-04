
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/AuthContext';
import { FeatureFlagProvider } from '@/context/FeatureFlagContext';
import './globals.css';
import { PT_Sans, Playfair } from 'next/font/google';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

const playfair = Playfair({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-headline',
});

export const metadata: Metadata = {
  title: 'Leifur AI',
  description: 'The AI-Powered OS for Your Work Place.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={`${ptSans.variable} ${playfair.variable} font-body antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <FeatureFlagProvider>
            {children}
            <Toaster />
          </FeatureFlagProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
    
