import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import "@/lib/telegram/init";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ART LAVKA.UZ - Эксклюзивные дизайнерские футболки",
  description:
    "Интернет-магазин эксклюзивных дизайнерских футболок с авторскими иллюстрациями",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${montserrat.variable} antialiased`}>{children}</body>
    </html>
  );
}
