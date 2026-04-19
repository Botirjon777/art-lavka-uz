import PromotionForm from "@/features/admin/promotions/components/PromotionForm";
import { getPromotionById } from "@/features/admin/promotions/actions/promotions";
import { notFound } from "next/navigation";

export default async function EditPromotionPage({ params }: { params: { id: string } }) {
  const result = await getPromotionById(params.id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8 px-4 max-w-5xl mx-auto">Редактирование акции</h1>
      <PromotionForm initialData={result.data} />
    </div>
  );
}
