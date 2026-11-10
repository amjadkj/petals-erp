import type { ReactNode } from 'react';

export const metadata = {
  title: 'Petals Child Development Centre',
  description: 'ERP for Petals Child Development Centre',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

