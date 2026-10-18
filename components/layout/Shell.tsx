"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface ShellProps {
  title: string;
  children: React.ReactNode;
}

export function Shell({ title, children }: ShellProps) {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!navOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setNavOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navOpen]);

  return (
    <div className="flex h-dvh">
      <Sidebar className="hidden md:flex" />

      {navOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-[var(--md-easing-standard)] md:hidden ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!navOpen}
      >
        <Sidebar
          onNavigate={() => setNavOpen(false)}
          onClose={() => setNavOpen(false)}
          className="h-full"
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header title={title} onMenu={() => setNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
