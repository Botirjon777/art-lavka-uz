/**
 * Gallery shots are stored at 2242×3051 on Cloudinary. Routing those through
 * Next's optimiser in dev is what makes the market page hang (and time out) —
 * Cloudinary already does the job, so ask it for the size we need and mark the
 * result `unoptimized` so Next serves the URL directly.
 */

/** Every gallery photo has this exact ratio, so tiles can match it and crop nothing. */
export const SHOT_W = 2242;
export const SHOT_H = 3051;
export const SHOT_ASPECT = `${SHOT_W} / ${SHOT_H}`;

const CLOUDINARY_UPLOAD = "/image/upload/";

/**
 * Injects a transformation into a Cloudinary delivery URL.
 * Non-Cloudinary URLs are returned untouched.
 */
export function cld(url: string | null | undefined, width: number): string {
  if (!url) return "";
  const at = url.indexOf(CLOUDINARY_UPLOAD);
  if (at === -1) return url;

  const head = url.slice(0, at + CLOUDINARY_UPLOAD.length);
  const tail = url.slice(at + CLOUDINARY_UPLOAD.length);

  // Already transformed (a leading segment with Cloudinary params) — leave it.
  if (/^[a-z]_[^/]+\//.test(tail)) return url;

  return `${head}f_auto,q_auto,c_limit,w_${width}/${tail}`;
}

/** True when the URL is a Cloudinary asset we can transform ourselves. */
export function isCloudinary(url: string | null | undefined): boolean {
  return Boolean(url && url.includes(CLOUDINARY_UPLOAD));
}
