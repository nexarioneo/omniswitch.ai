import { InputHTMLAttributes, forwardRef } from "react";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className = "", ...props }, ref) => (
    <label className={`inline-flex min-h-12 items-center gap-2 cursor-pointer ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        className="sr-only peer"
        {...props}
      />
      <div className="w-10 h-6 rounded-full bg-outline-variant peer-checked:bg-primary relative transition-colors after:content-[''] after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:rounded-full after:bg-surface peer-checked:after:translate-x-4 peer-checked:after:bg-on-primary after:transition-transform" />
      {label && <span className="text-sm">{label}</span>}
    </label>
  )
);

Switch.displayName = "Switch";
