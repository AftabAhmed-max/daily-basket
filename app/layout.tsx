import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DailyBasket — Fresh. Fast. Delivered.",
  description:
    "Your local supermarket, delivered in minutes. Fresh fruits, dairy, snacks, and groceries at the best prices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
