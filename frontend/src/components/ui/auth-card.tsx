import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
  maxWidth?: string;
}

export function AuthCard({
  children,
  className,
  maxWidth = "max-w-[500px]",
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-card border border-surface-high p-8 sm:p-10 w-full",
        maxWidth,
        className,
      )}
    >
      {children}
    </div>
  );
}
