import PromotionForm from "@/features/admin/promotions/components/PromotionForm";
import { getPromotionById } from "@/features/admin/promotions/actions/promotions";
import { notFound } from "next/navigation";

export default async function EditPromotionPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const result = await getPromotionById(id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-5xl mx-auto px-4 pt-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Редактирование акции</h1>
      </div>
      <PromotionForm initialData={result.data} />
    </div>
  );
}
