import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full h-12 px-4 border border-[#E3E8EF] rounded-lg outline-none focus:border-[#12304E] text-[#0C1F33]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
