export default function ReportesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 bg-gray-200 rounded-xl mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded-lg" />
        </div>
      </div>

      {/* Filtros skeleton */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-5">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-3">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 w-24 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 w-16 bg-gray-200 rounded" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 w-20 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border-2 border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              <div className="h-6 w-14 bg-gray-100 rounded-lg" />
            </div>
            <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-7 w-32 bg-gray-300 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-200 rounded-xl" />
            <div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-1.5" />
              <div className="h-3 w-48 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="h-80 bg-gradient-to-b from-gray-100 to-gray-50 rounded-xl flex items-end gap-1.5 px-4 pb-4">
            {Array.from({ length: 20 }).map((_, i) => {
              const h = 30 + Math.sin(i * 0.7) * 25 + Math.random() * 20;
              return (
                <div key={i} className="flex-1 flex flex-col gap-1 justify-end">
                  <div
                    className="bg-orange-200 rounded-t"
                    style={{ height: `${h * 0.3}%` }}
                  />
                  <div
                    className="bg-blue-200 rounded-t"
                    style={{ height: `${h * 0.6}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Donut chart */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-200 rounded-xl" />
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-1.5" />
              <div className="h-3 w-28 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="flex items-center justify-center my-6">
            <div className="w-44 h-44 rounded-full bg-gray-200 relative">
              <div className="absolute inset-8 rounded-full bg-white" />
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300" />
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                </div>
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-9 h-9 bg-gray-200 rounded-xl" />
          <div>
            <div className="h-4 w-28 bg-gray-200 rounded mb-1.5" />
            <div className="h-3 w-44 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-6 px-6 py-4">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="flex-1 h-3 bg-gray-100 rounded" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-300 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
