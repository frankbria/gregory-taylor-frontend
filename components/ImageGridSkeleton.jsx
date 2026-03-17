export default function ImageGridSkeleton({ count = 9 }) {
  return (
    <div role="status" aria-label="Loading images" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} data-testid="skeleton-item" className="animate-pulse">
          <div
            data-testid="skeleton-image-placeholder"
            className="bg-gray-200 dark:bg-gray-700 rounded-lg aspect-[3/2]"
          />
          <div
            data-testid="skeleton-title-placeholder"
            className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-2 w-3/4 mx-auto"
          />
        </div>
      ))}
    </div>
  )
}
