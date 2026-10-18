"use client";

export function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be unavailable in private modes; the toggle still works for this session.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-on-surface/8"
    >
      <svg className="w-5 h-5 dark:hidden" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
      <svg className="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </button>
  );
}
