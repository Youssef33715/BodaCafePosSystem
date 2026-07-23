export function SkeletonCard() {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="skeleton h-11 w-11 rounded-xl" />
        <div className="skeleton h-4 w-10 rounded" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-6 w-28 rounded" />
      </div>
    </div>
  )
}

export function SkeletonRow({ cols = 6 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="skeleton h-4 w-full max-w-[120px] rounded" />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonTable({ rows = 6, cols = 6 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </tbody>
  )
}

export function SkeletonProductCard() {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="skeleton h-24 w-full rounded-lg" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="skeleton h-8 w-full rounded-lg" />
    </div>
  )
}

export function SkeletonChart() {
  return <div className="skeleton h-64 w-full rounded-xl" />
}
