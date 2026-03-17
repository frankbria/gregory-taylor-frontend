export default function CategoryGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          data-testid="category-skeleton-item"
          className="animate-pulse rounded overflow-hidden shadow bg-white dark:bg-gray-800"
        >
          <div className="flex flex-col h-[280px]">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700" />
            <div className="p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
