"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import PrintCategory from "@/models/PrintCategory";
import Print from "@/models/Print";

// Transliteration helper for Cyrillic (Uzbek/Russian)
const translit = (str: string) => {
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya', 'қ': 'q', 'ғ': 'gh', 'ҳ': 'h', 'ў': 'o'
  };
  return str.toLowerCase().split('').map(char => map[char] || char).join('');
};

const slugify = (name: string) => {
  let slug = translit(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  
  // Fallback if slug is empty
  if (!slug) {
    slug = "cat-" + Date.now().toString(36);
  }
  return slug;
};

export async function getPrintCategories() {
  try {
    await dbConnect();
    const categories = await PrintCategory.find({}).sort({ name: 1 }).lean();
    
    // Enrich with counts
    const categoriesWithCounts = await Promise.all(
      (categories as any[]).map(async (cat) => {
        const count = await Print.countDocuments({ category: cat.slug });
        return {
          ...cat,
          _id: cat._id.toString(),
          printCount: count
        };
      })
    );

    return JSON.parse(JSON.stringify(categoriesWithCounts));
  } catch (error) {
    console.error("Error fetching print categories:", error);
    return [];
  }
}

export async function createPrintCategory(formData: FormData) {
  try {
    await dbConnect();
    const name = formData.get("name") as string;
    const manualSlug = formData.get("slug") as string;
    
    // Use manual slug if provided, else auto-generate
    const slug = manualSlug?.trim() ? manualSlug.trim().toLowerCase() : slugify(name);

    const category = await PrintCategory.create({ name, slug });
    revalidatePath("/admin/prints");
    revalidatePath("/admin/prints/categories");
    return { success: true, category: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    console.error("Error creating print category:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePrintCategory(id: string, formData: FormData) {
  try {
    await dbConnect();
    const name = formData.get("name") as string;
    const manualSlug = formData.get("slug") as string;

    const oldCategory = await PrintCategory.findById(id);
    if (!oldCategory) {
      return { success: false, error: "Категория не найдена" };
    }

    const oldSlug = oldCategory.slug;
    const slug = manualSlug?.trim() ? manualSlug.trim().toLowerCase() : slugify(name);

    const category = await PrintCategory.findByIdAndUpdate(
      id,
      { name, slug },
      { new: true }
    );

    // If slug has changed, update all prints that were using the old slug
    if (slug !== oldSlug) {
      await Print.updateMany({ category: oldSlug }, { $set: { category: slug } });
    }

    revalidatePath("/admin/prints");
    revalidatePath("/admin/prints/categories");
    return { success: true, category: JSON.parse(JSON.stringify(category)) };
  } catch (error: any) {
    console.error("Error updating print category:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePrintCategory(id: string) {
  try {
    await dbConnect();
    await PrintCategory.findByIdAndDelete(id);
    revalidatePath("/admin/prints");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting print category:", error);
    return { success: false, error: error.message };
  }
}
