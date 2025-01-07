'use client';

import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from "@/components/ui/toast"
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}



