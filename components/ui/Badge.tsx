import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "error";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", className = "", ...props }, ref) => {
    const variants = {
      default: "bg-secondary-container text-on-secondary-container",
      success: "bg-primary-container text-on-primary-container",
      error: "bg-error-container text-on-error-container",
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center h-6 px-2 rounded-sm text-xs font-medium ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
