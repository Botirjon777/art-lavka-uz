import ProductView from "@/features/v2/product/ProductView";

interface PageProps {
  params: Promise<{ printId: string }>;
}

export default async function V2ProductPage({ params }: PageProps) {
  const { printId } = await params;
  return <ProductView printId={printId} />;
}
