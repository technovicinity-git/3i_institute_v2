import Link from "next/link";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: {
    square: "w-8 h-8 text-sm",
    text: "text-lg",
  },
  md: {
    square: "w-10 h-10 text-lg",
    text: "text-xl",
  },
  lg: {
    square: "w-12 h-12 text-xl",
    text: "text-2xl",
  },
};

export function Logo({ href = "/", size = "md" }: LogoProps) {
  const { square, text } = sizeClasses[size];

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity"
      aria-label="3i Home"
    >
      <div
        className={`${square} bg-primary text-white rounded-lg flex items-center justify-center font-serif font-bold leading-none`}
      >
        3i
      </div>
      <span
        className={`${text} font-serif font-bold tracking-tight text-primary`}
      >
        3i
      </span>
    </Link>
  );
}
