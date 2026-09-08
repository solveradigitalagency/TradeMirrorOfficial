import type { Metadata } from "next";
import "@/app/globals.css";
import { inter } from "@/app/fonts";

export const metadata: Metadata = {
  title: "TradeMirror",
  description: "Trading journal and analytics platform",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
