import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p
      className={cn(
        "text-gold text-[11px] font-bold uppercase tracking-wider",
        className,
      )}
    >
      {children}
    </p>
  );
}
