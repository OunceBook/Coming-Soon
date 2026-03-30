import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "form-ring flex h-12 w-full rounded-xl border border-divider bg-white/[0.03] px-3 text-base text-ink placeholder:text-secondary/70 transition-colors duration-200",
        "focus:border-accent/65",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
