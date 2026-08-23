import Image from "next/image";

interface LandingLogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  textColor?: "light" | "dark";
  asLink?: boolean;
}

const sizeClasses = {
  sm: {
    image: "w-8 h-8",
    text: "text-xl",
  },
  md: {
    image: "w-9 h-9",
    text: "text-2xl",
  },
  lg: {
    image: "w-10 h-10",
    text: "text-3xl",
  },
};

export function LandingLogo({
  href = "/",
  size = "sm",
  textColor = "dark",
  asLink = true,
}: LandingLogoProps) {
  const { image, text } = sizeClasses[size];
  const textClass = textColor === "light" ? "text-white" : "text-brand-navy";

  const content = (
    <>
      <Image
        src="/assets/images/landing_page/logo-icon.png"
        alt="3i Institute"
        width={40}
        height={40}
        className={`${image} rounded object-contain`}
      />
      <span className={`font-semibold tracking-tight ${text} ${textClass}`}>
        3i Institute
      </span>
    </>
  );

  if (asLink) {
    return (
      <a
        href={href}
        className="flex items-center gap-2"
        aria-label="3i Institute home"
      >
        {content}
      </a>
    );
  }

  return <span className="flex items-center gap-2">{content}</span>;
}
