interface LoaderProps {
  /** Centers spinner in remaining content area (default) */
  fullPage?: boolean;
}

/**
 * Shared spinner used across every admin page.
 * fullPage=true  → covers the entire viewport (used for initial auth loading)
 * fullPage=false → centers inside the page content area
 */
export default function Loader({ fullPage = false }: LoaderProps) {
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F5F5F5]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-purple-200 border-t-[#8814B1] rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-400 tracking-wide">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full py-24">
      <div className="w-12 h-12 border-4 border-purple-200 border-t-[#8814B1] rounded-full animate-spin" />
    </div>
  );
}
