"use client";

import { useMemo, useState } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { getTranslated } from "@/lib/i18n/utils";
import { usePrintCategories } from "@/features/client/home/hooks/usePrintCategories";
import { useProducts } from "@/features/client/home/hooks/useProducts";
import { useSettings } from "@/features/client/home/hooks/useSettings";
import ProductTile from "../components/ProductTile";
import { useCatalog } from "../hooks/useCatalog";
import { activeGarmentCategories, pickPreviewProduct } from "../lib/catalog";

type ViewMode = "grid" | "3d";
type SortMode = "new" | "name";

const PAGE_SIZE = 12;

const GARMENT_LABELS: Record<string, string> = {
  all: "Все",
  women: "Женские",
  men: "Мужские",
  kids: "Детские",
};

const SORTS: { id: SortMode; label: string }[] = [
  { id: "new", label: "Новые" },
  { id: "name", label: "По названию" },
];

export default function MarketView() {
  const { lang } = useLanguageStore();

  const [categorySlug, setCategorySlug] = useState("all");
  const [garment, setGarment] = useState("all");
  const [sort, setSort] = useState<SortMode>("new");
  const [view, setView] = useState<ViewMode>("grid");
  const [liveId, setLiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const { data: categories = [] } = usePrintCategories();
  const { data: products = [] } = useProducts();
  const { data: settings } = useSettings();
  const { data: catalog = [], isLoading, isError, refetch } = useCatalog();

  const garments = useMemo(
    () => ["all", ...activeGarmentCategories(products, settings?.categoryStatuses)],
    [products, settings]
  );

  // Which blank the listing is priced and previewed against.
  const previewProduct = useMemo(
    () => pickPreviewProduct(products, garment),
    [products, garment]
  );

  const entries = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = catalog.filter((entry) => {
      if (categorySlug !== "all" && entry.category !== categorySlug) return false;
      if (!query) return true;
      const name = (getTranslated(entry.print, lang) || entry.name).toLowerCase();
      return name.includes(query);
    });

    if (sort === "name") {
      return [...filtered].sort((a, b) =>
        (getTranslated(a.print, lang) || a.name).localeCompare(
          getTranslated(b.print, lang) || b.name,
          "ru"
        )
      );
    }
    // "Новые" — highest code first, which is how the shop numbers its designs.
    return [...filtered].sort((a, b) => (b.code || "").localeCompare(a.code || ""));
  }, [catalog, categorySlug, search, sort, lang]);

  const shown = entries.slice(0, visible);

  const resetPaging = () => {
    setVisible(PAGE_SIZE);
    setLiveId(null);
  };

  const activeCategoryName =
    categorySlug === "all"
      ? "Все принты"
      : getTranslated(categories.find((c) => c.slug === categorySlug), lang) || "Принты";

  const switchView = (next: ViewMode) => {
    setView(next);
    if (next === "grid") setLiveId(null);
  };

  return (
    <div className="mx-auto max-w-[1328px] px-4 pb-20 pt-6 desk:px-6 desk:pb-24 desk:pt-10">
      {/* ---------------- Filter bar ---------------- */}
      <div className="flex flex-col gap-3 desk:flex-row desk:items-center desk:gap-4">
        <div className="flex h-[52px] items-center overflow-hidden rounded-[10px] border-[1.5px] border-[#E2E2E8] bg-white desk:w-[340px] desk:shrink-0">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPaging();
            }}
            placeholder="Поиск по принтам"
            aria-label="Поиск по принтам"
            className="h-full min-w-0 flex-1 px-4 text-[15px] text-[#333333] outline-none placeholder:text-[#9F9F9F]"
          />
          <span className="flex h-full w-[52px] shrink-0 items-center justify-center bg-[#8814B1]">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.6-3.6" />
            </svg>
          </span>
        </div>

        <div className="-mx-4 flex min-w-0 items-center gap-2 overflow-x-auto px-4 desk:mx-0 desk:flex-1 desk:px-0">
          {garments.map((g) => {
            const on = garment === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setGarment(g)}
                className={`h-[52px] shrink-0 cursor-pointer rounded-[10px] border-[1.5px] px-[18px] text-[15px] font-semibold transition-colors desk:px-[22px] ${
                  on
                    ? "border-[#8814B1] bg-[#8814B1] text-white"
                    : "border-[#E2E2E8] bg-white text-[#333333] hover:border-[#C9C9D2]"
                }`}
              >
                {GARMENT_LABELS[g] ?? g}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-0 flex-1 desk:flex-none">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              aria-expanded={sortOpen}
              className="flex h-[52px] w-full cursor-pointer items-center justify-between gap-3 rounded-[10px] border-[1.5px] border-[#E2E2E8] px-4 desk:w-[228px]"
            >
              <span className="truncate text-[15px] text-[#9F9F9F]">
                Сортировка:{" "}
                <span className="font-semibold text-[#1A1A1A]">
                  {SORTS.find((s) => s.id === sort)?.label}
                </span>
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9F9F9F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} aria-hidden="true" />
                <ul className="absolute right-0 top-full z-20 mt-1 w-full overflow-hidden rounded-[10px] border border-[#ECECEF] bg-white py-1 shadow-lg desk:w-[228px]">
                  {SORTS.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSort(s.id);
                          setSortOpen(false);
                          resetPaging();
                        }}
                        className={`w-full cursor-pointer px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-[#F7F2FA] ${
                          sort === s.id ? "font-bold text-[#8814B1]" : "font-medium text-[#333333]"
                        }`}
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Grid ⇄ 3D */}
          <div
            role="group"
            aria-label="Режим просмотра"
            className="flex h-[52px] shrink-0 items-center gap-1 rounded-[10px] bg-[#F4F4F6] p-1"
          >
            {(["grid", "3d"] as ViewMode[]).map((mode) => {
              const on = view === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => switchView(mode)}
                  aria-pressed={on}
                  className={`flex h-11 cursor-pointer items-center gap-1.5 rounded-lg px-[15px] text-[14px] font-semibold transition-colors ${
                    on ? "bg-white text-[#1A1A1A] shadow-[0_1px_3px_rgba(16,16,24,0.14)]" : "text-[#6B6B75]"
                  }`}
                >
                  {mode === "grid" ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
                      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
                      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
                      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3 4 7.2v9.6L12 21l8-4.2V7.2Z" />
                      <path d="m4 7.2 8 4.3 8-4.3" />
                      <path d="M12 11.5V21" />
                    </svg>
                  )}
                  {mode === "grid" ? "Сетка" : "3D"}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---------------- Body ---------------- */}
      <div className="mt-8 flex items-start gap-12">
        {/* Collections rail */}
        <aside className="hidden w-[288px] shrink-0 flex-col gap-5 desk:flex">
          <h2 className="text-[17px] font-bold leading-[22px] text-[#1A1A1A]">Коллекции</h2>

          <div className="flex flex-col gap-0.5">
            <CollectionRow
              label="Все коллекции"
              count={catalog.length}
              active={categorySlug === "all"}
              onClick={() => {
                setCategorySlug("all");
                resetPaging();
              }}
            />
            {categories.map((c) => (
              <CollectionRow
                key={c._id}
                label={getTranslated(c, lang) || c.name}
                count={catalog.filter((e) => e.category === c.slug).length}
                active={categorySlug === c.slug}
                onClick={() => {
                  setCategorySlug(c.slug);
                  resetPaging();
                }}
              />
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex items-baseline justify-between gap-5">
            <h1 className="text-[24px] font-extrabold leading-[30px] tracking-[-0.015em] text-[#1A1A1A] desk:text-[30px] desk:leading-[37px]">
              {activeCategoryName}
            </h1>
            {!isLoading && (
              <span className="shrink-0 text-[14px] text-[#9F9F9F] desk:text-[15px]">
                Найдено: <span className="font-semibold text-[#333333]">{entries.length}</span>
              </span>
            )}
          </div>

          {/* Mobile collection chips */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 desk:hidden">
            <MobileChip
              label="Все"
              active={categorySlug === "all"}
              onClick={() => {
                setCategorySlug("all");
                resetPaging();
              }}
            />
            {categories.map((c) => (
              <MobileChip
                key={c._id}
                label={getTranslated(c, lang) || c.name}
                active={categorySlug === c.slug}
                onClick={() => {
                  setCategorySlug(c.slug);
                  resetPaging();
                }}
              />
            ))}
          </div>

          {view === "3d" && (
            <div className="flex items-start gap-2.5 rounded-[10px] border border-[#C7E7F1] bg-[#EAF9FE] px-4 py-3">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0E6F87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-px shrink-0">
                <path d="M12 3 4 7.2v9.6L12 21l8-4.2V7.2Z" />
                <path d="m4 7.2 8 4.3 8-4.3" />
                <path d="M12 11.5V21" />
              </svg>
              <span className="text-[13px] font-medium leading-5 text-[#0E4F61] desk:text-[14px]">
                Режим 3D: нажми «Покрутить» на карточке, чтобы заменить фото живой моделью.
                Одновременно крутится одна — так страница остаётся быстрой.
              </span>
            </div>
          )}

          {!previewProduct && !isLoading && (
            <div className="rounded-[10px] border border-[#F0DCC4] bg-[#FDF6EC] px-4 py-3 text-[14px] leading-5 text-[#8A5B1E]">
              Для этой категории пока нет товара, на котором можно показать принты. Выберите другую
              или добавьте товар в админке.
            </div>
          )}

          {isError ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <span className="text-[17px] font-semibold text-[#333333]">Не удалось загрузить каталог</span>
              <button
                type="button"
                onClick={() => refetch()}
                className="h-12 cursor-pointer rounded-[10px] bg-[#8814B1] px-7 text-[15px] font-semibold text-white transition-colors hover:bg-[#6E1090]"
              >
                Попробовать снова
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 desk:grid-cols-3 desk:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <div className="aspect-square animate-pulse rounded-[14px] bg-[#F4F4F6]" />
                  <div className="flex flex-col gap-2">
                    <div className="h-3 w-1/2 animate-pulse rounded bg-[#F4F4F6]" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-[#F4F4F6]" />
                    <div className="h-5 w-1/2 animate-pulse rounded bg-[#F4F4F6]" />
                  </div>
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#D8D8DE" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.6-3.6" />
              </svg>
              <span className="text-[17px] font-semibold text-[#333333]">Ничего не нашлось</span>
              <span className="text-[15px] text-[#9F9F9F]">Попробуй снять часть фильтров</span>
              <button
                type="button"
                onClick={() => {
                  setCategorySlug("all");
                  setGarment("all");
                  setSearch("");
                  resetPaging();
                }}
                className="mt-1 h-12 cursor-pointer rounded-[10px] bg-[#8814B1] px-7 text-[15px] font-semibold text-white transition-colors hover:bg-[#6E1090]"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 desk:grid-cols-3 desk:gap-6">
                {shown.map((entry, i) => (
                  <ProductTile
                    key={entry.id}
                    entry={entry}
                    product={previewProduct}
                    is3d={view === "3d"}
                    isLive={liveId === entry.id}
                    onGoLive={() => setLiveId(entry.id)}
                    priority={i < 3}
                  />
                ))}
              </div>

              {visible < entries.length && (
                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    className="h-14 min-w-[280px] cursor-pointer rounded-[10px] bg-[#1A1A1A] px-10 text-[15px] font-bold text-white transition-colors hover:bg-black desk:min-w-[360px]"
                  >
                    Показать ещё
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CollectionRow({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-[58px] cursor-pointer items-center gap-3.5 rounded-[10px] px-3 text-left transition-colors ${
        active ? "bg-[#F7F2FA]" : "hover:bg-[#F7F7F9]"
      }`}
    >
      <span
        className={`flex-1 truncate text-[15px] text-[#1A1A1A] ${active ? "font-bold" : "font-medium"}`}
      >
        {label}
      </span>
      {typeof count === "number" && count > 0 && (
        <span className="shrink-0 text-[13px] text-[#9F9F9F]">{count}</span>
      )}
      {active && <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#8814B1]" />}
    </button>
  );
}

function MobileChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-11 shrink-0 cursor-pointer rounded-full border-[1.5px] px-4 text-[14px] font-semibold transition-colors ${
        active ? "border-[#8814B1] bg-[#8814B1] text-white" : "border-[#E2E2E8] bg-white text-[#333333]"
      }`}
    >
      {label}
    </button>
  );
}
