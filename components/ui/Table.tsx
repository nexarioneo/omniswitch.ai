import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, forwardRef } from "react";

export const Table = forwardRef<HTMLTableElement, HTMLAttributes<HTMLTableElement>>(
  ({ className = "", ...props }, ref) => (
    <div className="overflow-x-auto">
      <table ref={ref} className={`w-full text-sm ${className}`} {...props} />
    </div>
  )
);
Table.displayName = "Table";

export const Thead = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = "", ...props }, ref) => (
    <thead ref={ref} className={className} {...props} />
  )
);
Thead.displayName = "Thead";

export const Tbody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className = "", ...props }, ref) => (
    <tbody ref={ref} className={className} {...props} />
  )
);
Tbody.displayName = "Tbody";

export const Tr = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className = "", ...props }, ref) => (
    <tr ref={ref} className={`border-b border-outline-variant hover:bg-on-surface/5 transition-colors ${className}`} {...props} />
  )
);
Tr.displayName = "Tr";

export const Th = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className = "", ...props }, ref) => (
    <th ref={ref} className={`h-12 px-4 text-left text-xs font-medium text-on-surface-variant ${className}`} {...props} />
  )
);
Th.displayName = "Th";

export const Td = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className = "", ...props }, ref) => (
    <td ref={ref} className={`h-12 px-4 text-sm ${className}`} {...props} />
  )
);
Td.displayName = "Td";
