import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, className = "", id, children, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-on-surface-variant">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`h-12 px-3 rounded-xs border border-outline bg-transparent text-on-surface focus:border-2 focus:border-primary focus:outline-none transition-colors ${className}`}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = "Select";
