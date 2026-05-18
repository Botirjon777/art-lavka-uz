import HomeContainer from "@/features/client/home/components/HomeContainer";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "name": "ART-LAVKA.UZ",
    "url": "https://www.art-lavka.uz",
    "logo": "https://www.art-lavka.uz/art-lavka.png",
    "description": "Интернет-магазин эксклюзивных дизайнерских футболок в Узбекистане.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Fergana",
      "addressCountry": "UZ"
    },
    "priceRange": "$$"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">ART-LAVKA.UZ - Эксклюзивные дизайнерские футболки в Узбекистане</h1>
      <HomeContainer />
    </>
  );
}
