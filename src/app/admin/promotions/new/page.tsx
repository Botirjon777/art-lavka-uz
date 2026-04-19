import PromotionForm from "@/features/admin/promotions/components/PromotionForm";

export default function NewPromotionPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8 px-4 max-w-5xl mx-auto">Создание акции</h1>
      <PromotionForm />
    </div>
  );
}
