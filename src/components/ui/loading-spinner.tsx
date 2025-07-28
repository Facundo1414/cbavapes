import { cn } from "@/lib/utils";

// components/ui/loading-spinner.tsx
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin",
        className
      )}
    />
  )
}
