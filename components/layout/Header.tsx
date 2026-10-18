"use client";

import { LogoutButton } from "./LogoutButton";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  title: string;
  onMenu?: () => void;
}

export function Header({ title, onMenu }: HeaderProps) {
  return (
    <header className="h-16 bg-surface border-b border-outline-variant flex items-center justify-between gap-4 px-4 md:px-6">
      <div className="flex items-center gap-2 min-w-0">
        {onMenu && (
          <button
            type="button"
            onClick={onMenu}
            className="md:hidden inline-flex h-12 shrink-0 items-center gap-1 rounded-full px-3 text-sm font-medium text-on-surface-variant hover:bg-on-surface/8"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Menu
          </button>
        )}
        <h1 className="text-xl font-normal text-on-surface truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
