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
  alternates: {
    canonical: "/",
  },
  title: {
    default: "ART-LAVKA.UZ - Эксклюзивные дизайнерские футболки в Узбекистане",
    template: "%s | ART-LAVKA.UZ"
  },
  description: "Интернет-магазин эксклюзивных дизайнерских футболок с авторскими иллюстрациями в Узбекистане. Качественные принты, быстрая доставка по Ташкенту, Фергане и всему Узбекистану.",
  keywords: ["футболки с принтами", "дизайнерские футболки", "купить футболку узбекистан", "art lavka", "арт лавка", "дизайн футболок", "футболки ташкент", "футболки фергана", "t-shirts uzbekistan", "futbolka sotib olish", "uzbekistan design"],
  authors: [{ name: "ART-LAVKA" }],
  creator: "ART-LAVKA",
  publisher: "ART-LAVKA",
  openGraph: {
    title: "ART-LAVKA.UZ - Дизайнерские футболки в Узбекистане",
    description: "Эксклюзивные принты на качественных футболках. Доставка по всему Узбекистану.",
    url: "https://art-lavka.uz",
    siteName: "ART-LAVKA.UZ",
    images: [
      {
        url: "/art-lavka-square.png",
        width: 800,
        height: 800,
        alt: "ART-LAVKA.UZ Logo",
      },
    ],
    locale: "ru_UZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ART-LAVKA.UZ - Дизайнерские футболки в Узбекистане",
    description: "Эксклюзивные принты на качественных футболках. Доставка по всему Узбекистану.",
    images: ["/art-lavka-square.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${montserrat.variable} antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
