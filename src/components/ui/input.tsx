import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border-2 border-[#c9a84c] bg-white px-3 py-2 text-base font-medium text-[#010101] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f8cc72] focus-visible:ring-offset-2 hover:border-[#f8cc72] hover:bg-[#fffdf5] transition-colors disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-[#1a1a1a] dark:border-[#c9a84c] dark:text-[#f8cc72] dark:placeholder:text-slate-500 dark:hover:bg-[#222]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
