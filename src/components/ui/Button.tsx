import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md";
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "solid", size = "md", ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-xl font-medium transition";
    const sizes = size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4";
    const variants = {
      solid: "bg-brand-600 text-white hover:bg-brand-700 shadow-soft",
      outline: "border border-brand-600 text-brand-700 hover:bg-brand-50",
      ghost: "text-neutral-700 hover:bg-neutral-100"
    }[variant];

    return <button ref={ref} className={cn(base, sizes, variants, className)} {...props} />;
  }
);
Button.displayName = "Button";
