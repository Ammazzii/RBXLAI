'use client'; 

import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google"; 
import "./globals.css";
// THE ONLY CHANGE IS ON THIS LINE:
import { AuthProvider } from '../contexts/AuthContext'; 

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const sourceCodePro = Source_Code_Pro({ 
    weight: ['400', '600'], 
    subsets: ["latin"],
    variable: '--font-source-code-pro'
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} ${sourceCodePro.className}`}> 
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}