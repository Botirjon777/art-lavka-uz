export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative w-[174px] h-[233px] mb-[10px] bg-gray-200 rounded-lg"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  );
}

export function PrintGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <LoadingSkeleton key={index} />
      ))}
    </>
  );
}

export function SidebarPrintSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-square w-full bg-gray-200 rounded-[26px]"></div>
        </div>
      ))}
    </>
  );
}
