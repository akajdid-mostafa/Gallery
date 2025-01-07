import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from "@/components/ui/toast"
import Navbar from './components/Navbar';
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

