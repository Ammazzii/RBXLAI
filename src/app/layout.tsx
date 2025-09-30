import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'prismjs/themes/prism-tomorrow.css'; // Add this line for the dark theme
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RBXAI",
  description: "AI-powered Roblox development assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-gray-900">
      <body className={`${inter.className} h-full`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}