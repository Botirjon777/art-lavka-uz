import TrackOrder from "@/features/client/track-order/components/TrackOrder";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function TrackOrderDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <TrackOrder initialOrderNumber={resolvedParams.orderNumber} />;
}
