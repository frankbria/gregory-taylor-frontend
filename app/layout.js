import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { CartProvider } from "@/lib/CartContext";
import { ErrorProvider } from "@/lib/ErrorContext";
import { AuthProvider } from "@/lib/AuthContext";
import { Toaster } from "react-hot-toast";
import DevInspectorWrapper from "@/components/dev/DevInspectorWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Gregory Taylor Photography",
  description: "Fine art landscape photography from the Southwest and beyond.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-rev.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32-rev.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16-rev.png" />
      </head>
      <body suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorProvider>
          <AuthProvider>
            <DevInspectorWrapper>
              <CartProvider>
              <Header />
              <div className="flex flex-col min-h-screen">
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
              </CartProvider>
            </DevInspectorWrapper>
          </AuthProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              error: {
                duration: 6000,
                style: {
                  background: '#e74c3c',
                  color: '#fff',
                },
              },
            }}
          />
        </ErrorProvider>
      </body>
    </html>
  );
}
