import { HTMLAttributes, forwardRef, useEffect, useRef } from "react";

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  label?: string;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, label, className = "", children, ...props }, ref) => {
    const innerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!open) return;

      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") onClose();
      }

      window.addEventListener("keydown", handleKeyDown);
      innerRef.current?.focus();
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
        <div
          ref={(node) => {
            innerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          className={`relative bg-surface-container-high rounded-3xl p-6 max-w-md w-full mx-4 max-h-[85dvh] overflow-y-auto ${className}`}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);

Modal.displayName = "Modal";
