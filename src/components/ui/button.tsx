import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium transition-all duration-150 ease-out cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-iris text-white shadow-glow-soft hover:shadow-glow hover:brightness-110 active:brightness-95",
        secondary:
          "border border-border-strong bg-elevated text-text-primary shadow-card hover:bg-white/5 hover:border-white/25",
        ghost: "text-text-secondary hover:text-text-primary hover:bg-white/5",
        run: "border border-run/25 bg-run/10 text-run hover:bg-run/20",
        warning: "border border-warning/25 bg-warning/10 text-warning hover:bg-warning/20",
        destructive: "border border-destructive/25 bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-10 px-5 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
