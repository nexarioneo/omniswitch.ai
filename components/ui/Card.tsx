import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: 0 | 1 | 2 | 3;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevation = 1, className = "", ...props }, ref) => {
    const elevations = {
      0: "bg-surface",
      1: "bg-surface-container-low",
      2: "bg-surface-container",
      3: "bg-surface-container-high",
    };

    return (
      <div
        ref={ref}
        className={`rounded-xl p-4 ${elevations[elevation]} ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
