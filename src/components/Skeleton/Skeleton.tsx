interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gold-primary/10 rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <Skeleton className="h-14 w-14 rounded-xl" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

export function SkeletonImage({ className = '' }: SkeletonProps) {
  return <Skeleton className={`w-full h-full ${className}`} />;
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}
