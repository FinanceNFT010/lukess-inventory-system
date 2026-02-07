import { SkeletonCard, SkeletonTable } from "@/components/ui/SkeletonCard";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Tables Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonTable />
        <SkeletonTable />
      </div>
    </div>
  );
}
