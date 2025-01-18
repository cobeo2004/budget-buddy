import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonWrapperProps {
  children: React.ReactNode;
  isLoading: boolean;
  fullWidth?: boolean;
}

export function SkeletonWrapper({
  children,
  isLoading,
  fullWidth = true,
}: SkeletonWrapperProps) {
  if (!isLoading) return children;
  return (
    <Skeleton className={cn(fullWidth && "w-full")}>
      <div className="opacity-0">{children}</div>
    </Skeleton>
  );
}
