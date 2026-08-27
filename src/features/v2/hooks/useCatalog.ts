import { useQuery } from "@tanstack/react-query";
import { PrintDesign } from "@/types";

/**
 * The v2 catalogue.
 *
 * The shop keeps the same design in two collections that are not linked in the
 * database (`gallery.productId` is null on every row): `galleries` holds the
 * real photographed product shots, `prints` holds the artwork that drives the
 * 3D decal. Both name their rows with the same leading code — "0101 «Paxtagul»"
 * — and that code is what pairs them: of the 61 coded prints, all 61 have a
 * photo. So the code is the join key until the data gets a real relation.
 */

export interface CatalogEntry {
  /** Shared 4-digit code, e.g. "0101". Null when a name has no code. */
  code: string | null;
  /** Print id — the sellable identity and the product-page route param. */
  id: string;
  name: string;
  /** Real photographed shot from the gallery; null when none matched. */
  photo: string | null;
  /** Print category slug, for the collections filter. */
  category: string;
  print: PrintDesign;
}

export interface GalleryPhoto {
  _id: string;
  name: string;
  image: string;
}

/** Leading 3-4 digit code from a row name, normalised to 4 digits. */
export function codeOf(name: string | undefined | null): string | null {
  const match = String(name || "").trim().match(/^(\d{3,4})/);
  return match ? match[1].padStart(4, "0") : null;
}

async function fetchCatalog(): Promise<CatalogEntry[]> {
  const [printsRes, galleryRes] = await Promise.all([
    fetch("/api/prints?limit=1000"),
    fetch("/api/gallery?limit=1000"),
  ]);

  const printsJson = await printsRes.json();
  if (!printsJson.success) throw new Error(printsJson.error || "Failed to fetch prints");

  // The gallery is a nice-to-have: if it fails we still list everything, just
  // with the composed preview instead of a photograph.
  let photos: GalleryPhoto[] = [];
  try {
    const galleryJson = await galleryRes.json();
    if (galleryJson.success) photos = galleryJson.data as GalleryPhoto[];
  } catch {
    photos = [];
  }

  const photoByCode = new Map<string, string>();
  for (const photo of photos) {
    const code = codeOf(photo.name);
    if (code && !photoByCode.has(code)) photoByCode.set(code, photo.image);
  }

  const prints = (printsJson.data as PrintDesign[]).map((p) => ({
    ...p,
    id: (p as { _id?: string })._id,
  })) as PrintDesign[];

  return prints.map((print) => {
    const code = codeOf(print.name);
    return {
      code,
      id: ((print as { _id?: string })._id || print.id || "").toString(),
      name: print.name,
      photo: code ? photoByCode.get(code) ?? null : null,
      category: print.category,
      print,
    };
  });
}

export const useCatalog = (options = {}) =>
  useQuery({
    queryKey: ["v2-catalog"],
    queryFn: fetchCatalog,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
    ...options,
  });

/** Photo lookup for a print that came from somewhere else (e.g. the cart). */
export function photoForPrint(
  entries: CatalogEntry[] | undefined,
  print: PrintDesign | null
): string | null {
  if (!print || !entries?.length) return null;
  const printId = ((print as { _id?: string })._id || print.id || "").toString();
  const byId = entries.find((e) => e.id === printId);
  if (byId?.photo) return byId.photo;

  const code = codeOf(print.name);
  return code ? entries.find((e) => e.code === code)?.photo ?? null : null;
}
