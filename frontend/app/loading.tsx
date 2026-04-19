export default function Loading() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar skeleton */}
      <aside className="w-56 shrink-0 border-r border-zinc-100 bg-white p-4 space-y-3">
        <div className="skeleton h-8 w-32 rounded-lg mb-6" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-8 rounded-lg" />
        ))}
      </aside>

      <main className="flex-1 flex flex-col">
        {/* Topbar skeleton */}
        <div className="px-8 py-5 border-b border-zinc-100 bg-white flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="skeleton h-5 w-28 rounded" />
            <div className="skeleton h-3.5 w-52 rounded" />
          </div>
          <div className="skeleton h-9 w-32 rounded-xl" />
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-8">
            {/* Filter pills skeleton */}
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-7 w-14 rounded-full" />
              ))}
            </div>

            {/* Template grid skeleton */}
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-zinc-100 p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="skeleton w-10 h-10 rounded-lg" />
                    <div className="skeleton h-5 w-14 rounded-full" />
                  </div>
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 rounded" />
                  <div className="skeleton h-3 w-4/5 rounded" />
                  <div className="border-t border-zinc-50 pt-3 space-y-2">
                    <div className="skeleton h-3 w-2/3 rounded" />
                    <div className="skeleton h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel skeleton */}
          <aside className="w-72 shrink-0 border-l border-zinc-100 bg-white p-5 space-y-4">
            <div className="skeleton h-3 w-20 rounded" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="skeleton h-3 w-16 rounded" />
                <div className="skeleton h-9 rounded-lg" />
              </div>
            ))}
          </aside>
        </div>
      </main>
    </div>
  );
}
