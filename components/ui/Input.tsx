import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-on-surface-variant">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-12 px-3 rounded-xs border border-outline bg-transparent text-on-surface placeholder:text-on-surface-variant/50 focus:border-2 focus:border-primary focus:outline-none transition-colors ${className}`}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
