import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Toaster } from 'sonner';
import NavBar from '@/components/NavBar';
import { SessionProvider } from '@/contexts/SessionProvider';
import { getCurrentSession } from '@/lib/session';

const geistSans = localFont({
  src: '../../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: '../../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Custom Auth',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, user } = await getCurrentSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider value={{ session, user }}>
          <NavBar />
          {/* <NavBarClient /> */}
          {children}
          <Toaster richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
