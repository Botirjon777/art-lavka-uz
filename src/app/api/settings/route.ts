import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Settings, { ICategory, ISettings } from "@/models/Settings";
import { BTS_PRICES, BTS_COURIER_FEES } from "@/lib/deliveryDataBTS";

export const revalidate = 86400; // Cache for 24 hours

export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne();
    
    // Default categories for backward compatibility
    const defaultCategories: ICategory[] = [
      { id: "women", label: "Женский", status: "active" },
      { id: "men", label: "Мужской", status: "soon" },
      { id: "kids", label: "Детский", status: "soon" },
    ];

    // Default menu structure
    const defaultMenu: ISettings["menu"] = {
      delivery: "Доставка по городу Фергана бесплатная.\n\nДоставка в другие города Узбекистана осуществляется курьерской службой по усмотрению для заказов стоимостью до 200 000 сум в количестве от 4-5 единиц товара.\n\nСрок доставки от 24 до 7дн рабочих дней, в зависимости от удаленности региона.",
      payment: "Мы принимаем оплату с карт UZCARD, HUMO любых банков, а также Payme CARD.",
      about: "Добро пожаловать в наш интернет магазин эксклюзивных дизайнерских футболок! Мы рады предложить вам уникальные и стильные футболки с авторскими иллюстрациями, созданные нашим талантливым художником.\n\nМы используем только качественные материалы и современные технологии печати, чтобы гарантировать долговечность и яркость наших изделий.\n\nВ нашем каталоге вы найдете множество разнообразных дизайнов - от креативных и смешных до серьезных и стильных. Мы уверены, что каждый найдет у нас футболку, которая подойдет именно ему.\n\nМы ценим каждого нашего клиента и гарантируем быструю и качественную доставку по всей стране. Если у вас возникнут вопросы или пожелания, наша команда всегда готова помочь вам.\n\nСпасибо, что выбрали наш магазин. Мы надеемся, что наши футболки станут вашими любимыми вещами в гардеробе и подарят вам много радости и улыбок!",
      telegram: "https://t.me/artlavkauz",
      email: "support@artlavka.uz",
      instagramArtists: "https://www.instagram.com/yana_zakhary/",
      instagramStore: "https://www.instagram.com/art_lavka.uz/",
    };

    if (!settings) {
      settings = await Settings.create({
        categories: defaultCategories,
        menu: defaultMenu,
        deliveryPrices: BTS_PRICES,
        courierFees: BTS_COURIER_FEES,
      });
    } else {
      let updated = false;

      if (!settings.categories || settings.categories.length === 0) {
        // Migrate from old categoryStatuses if it existed
        if (settings.categoryStatuses) {
          const migrated: ICategory[] = [];
          const oldData = settings.categoryStatuses as any;
          
          const labelMap: Record<string, string> = {
            women: "Женский",
            men: "Мужской",
            kids: "Детский",
          };

          // Handle both Map and POJO safely
          if (oldData instanceof Map) {
            oldData.forEach((status: string, id: string) => {
              migrated.push({ id, label: labelMap[id] || id, status: status as "active" | "soon" });
            });
          } else if (typeof oldData === "object") {
            Object.entries(oldData).forEach(([id, status]) => {
              migrated.push({ id, label: labelMap[id] || id, status: status as any });
            });
          }

          settings.categories = migrated.length > 0 ? migrated : defaultCategories;
        } else {
          settings.categories = defaultCategories;
        }
        updated = true;
      }

      // Initialize menu if missing
      if (!settings.menu || !settings.menu.delivery) {
        settings.menu = defaultMenu;
        updated = true;
      }

      // Initialize delivery settings if missing
      if (!settings.deliveryPrices) {
        settings.deliveryPrices = BTS_PRICES;
        updated = true;
      }

      if (!settings.courierFees) {
        settings.courierFees = BTS_COURIER_FEES;
        updated = true;
      }

      if (updated) await settings.save();
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    let settings = await Settings.findOne();
    
    if (settings) {
      // Update both categories and menu
      if (body.categories) settings.categories = body.categories;
      if (body.menu) settings.menu = body.menu;
      
      // Explicitly mark as modified for Mixed types if needed, 
      // though simple assignment usually works for POJOs in Mongoose if schema matches.
      await settings.save();
    } else {
      settings = await Settings.create(body);
    }

    revalidatePath("/api/settings", "page");
    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
