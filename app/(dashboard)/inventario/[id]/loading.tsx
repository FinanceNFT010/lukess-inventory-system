export default function EditProductLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="flex-1">
            <div className="h-8 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Form fields skeleton */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}

          {/* Actions skeleton */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <div className="h-12 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-12 w-40 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
