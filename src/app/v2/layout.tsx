import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Header from "@/features/v2/components/Header";
import Footer from "@/features/v2/components/Footer";
import MobileTabBar from "@/features/v2/components/MobileTabBar";

export const metadata: Metadata = {
  title: "ART-LAVKA — маркет авторских принтов",
  description:
    "Маркет авторских принтов на футболках. Обычная витрина с возможностью посмотреть каждую футболку в 3D. Доставка по всему Узбекистану.",
  robots: { index: false, follow: false },
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white pb-[68px] desk:pb-0">
      <Header />

      <main className="flex-1">{children}</main>

      <Footer />
      <MobileTabBar />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1A1A1A",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 600,
            maxWidth: "90vw",
          },
          success: { iconTheme: { primary: "#8814B1", secondary: "#fff" } },
        }}
      />
    </div>
  );
}
