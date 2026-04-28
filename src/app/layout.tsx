import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://art-lavka.uz"),
  title: "ART-LAVKA.UZ - Эксклюзивные дизайнерские футболки",
  description:
    "Интернет-магазин эксклюзивных дизайнерских футболок с авторскими иллюстрациями",
  openGraph: {
    images: ["/art-lavka-square.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/art-lavka-square.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${montserrat.variable} antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
