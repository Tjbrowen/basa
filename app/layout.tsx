import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import NavBar from "./components/nav/NavBar";
import Footer from "./components/footer/Footer";
import CartProvider from "@/providers/CartProvider";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "B-Shop",
  description: "retail store",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload the font */}
        <link
          rel="preload"
          href="/_next/static/css/app/layout.css?v=1719428021120"
          as="style"
        />
        <link
          rel="stylesheet"
          href="/_next/static/css/app/layout.css?v=1719428021120"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="/_next/static/css/app/layout.css?v=1719428021120"
          />
        </noscript>
      </head>
      <body
        className={`${poppins.className} text-slate-700`}
        suppressHydrationWarning={true}
      >
        <Toaster
          toastOptions={{
            style: {
              background: "rgb(51 65 85)",
              color: "#fff",
            },
          }}
        />
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <NavBar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
