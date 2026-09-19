import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Minicloud',
  description: 'Your personal mini cloud for files and images',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
