export default function PedidosLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-52 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-gray-100 rounded" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          "bg-amber-50 border-amber-200",
          "bg-blue-50 border-blue-200",
          "bg-purple-50 border-purple-200",
          "bg-green-50 border-green-200",
        ].map((colors, i) => (
          <div
            key={i}
            className={`${colors} border-2 rounded-xl p-5`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-6 h-6 bg-gray-200 rounded-full" />
              <div className="w-10 h-8 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-20 bg-gray-200 rounded mb-1" />
            <div className="h-3 w-28 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Filter bar skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 h-10 bg-gray-100 rounded-lg" />
          <div className="w-40 h-10 bg-gray-100 rounded-lg" />
          <div className="w-36 h-10 bg-gray-100 rounded-lg" />
        </div>
      </div>

      {/* Tabs + cards skeleton */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex gap-4 px-4 py-3 border-b border-gray-100">
          {[80, 100, 110, 90, 120, 100].map((w, i) => (
            <div key={i} className={`h-6 bg-gray-100 rounded`} style={{ width: w }} />
          ))}
        </div>

        {/* Order cards */}
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-xl border-l-4 border-l-gray-200 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="h-6 w-28 bg-gray-100 rounded-full" />
                </div>
                <div className="h-4 w-20 bg-gray-100 rounded" />
              </div>
              <div className="h-3 w-24 bg-gray-100 rounded" />
              <div className="flex gap-4">
                <div className="h-4 w-36 bg-gray-100 rounded" />
                <div className="h-4 w-28 bg-gray-100 rounded" />
              </div>
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="h-6 w-24 bg-gray-100 rounded" />
                <div className="h-9 w-28 bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
