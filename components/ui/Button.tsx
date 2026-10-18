import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "filled" | "text" | "outlined" | "tonal" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "filled", size = "md", className = "", ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium transition-colors duration-100 ease-[var(--md-easing-standard)] rounded-full cursor-pointer min-h-12 md:min-h-0 disabled:opacity-38 disabled:pointer-events-none";
    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-6 text-sm",
      lg: "h-12 px-8 text-base",
    };
    const variants = {
      filled: "bg-primary text-on-primary hover:bg-primary/90 active:bg-primary/80",
      text: "bg-transparent text-primary hover:bg-on-surface/8 active:bg-on-surface/12",
      outlined: "bg-transparent text-primary border border-outline hover:bg-on-surface/8 active:bg-on-surface/12",
      tonal: "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 active:bg-secondary-container/70",
      danger: "bg-error text-on-error hover:bg-error/90 active:bg-error/80",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
