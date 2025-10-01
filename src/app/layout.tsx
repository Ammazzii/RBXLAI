'use client'; 

import SessionGatekeeper from './components/SessionGatekeeper';
import { Inter, Source_Code_Pro } from "next/font/google"; 
import "./globals.css";
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
        {/* Wrap the children with the new Gatekeeper */}
        <SessionGatekeeper>
          {children}
        </SessionGatekeeper>
      </AuthProvider>
    </body>
  </html>
);
}