import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// A plain native <select>, styled to match the rest of the ui/ primitives.
// The admin dashboard's filters are simple enough that Radix's Select
// doesn't earn its keep here (it's not installed elsewhere in the project).
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative inline-block">
      <select
        data-slot="select"
        className={cn(
          "border-input h-9 w-full appearance-none rounded-md border bg-transparent px-3 py-1 pr-8 text-sm shadow-xs outline-none transition-[color,box-shadow]",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="text-muted-foreground pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2" />
    </div>
  );
}

export { Select };
