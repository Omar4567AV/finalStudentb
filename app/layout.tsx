import './globals.css';
import React from 'react';

export const metadata = {
  title: 'EduPortal System',
  description: 'Enterprise Core Workspace Execution Node',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-transparent selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}