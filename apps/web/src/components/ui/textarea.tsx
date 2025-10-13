import type * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-base border-2 border-border bg-secondary-background px-3 py-2 font-base text-foreground text-sm selection:bg-main selection:text-main-foreground placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      data-slot="textarea"
      {...props}
    />
  );
}

export { Textarea };
