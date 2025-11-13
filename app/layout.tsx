
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '../components/theme-provider';
import { Toaster } from '../components/ui/toaster';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Foot Layer - Premium Footwear Collection',
  description: 'Discover our exquisite collection of loafers, traditional Peshawari chappals, sandals, and Saudi chappals. Quality craftsmanship meets traditional design.',
  keywords: 'shoes, loafers, peshawari chappals, sandals, saudi chappals, footwear, leather shoes',
  authors: [{ name: 'Foot Layer' }],
  creator: 'Foot Layer',
  publisher: 'Foot Layer',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: 'https://cdn.abacus.ai/images/62cee9a9-a87b-449d-8f3b-768c03d8ad02.png',
    shortcut: 'https://cdn.abacus.ai/images/62cee9a9-a87b-449d-8f3b-768c03d8ad02.png',
    apple: 'https://cdn.abacus.ai/images/62cee9a9-a87b-449d-8f3b-768c03d8ad02.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
