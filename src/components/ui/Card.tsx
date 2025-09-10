import { PropsWithChildren } from "react";
import { cn } from "@/utils/cn";

export const Card = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <div className={cn("bg-white rounded-2xl shadow-soft border border-neutral-200", className)}>
    {children}
  </div>
);
