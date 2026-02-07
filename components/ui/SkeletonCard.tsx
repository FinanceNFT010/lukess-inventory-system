export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="divide-y divide-gray-200">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
        >
          <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
