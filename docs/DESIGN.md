---
id: omniswitch-design
version: 2.0.0
status: active
single-source-of-truth: true
theme: "Material 3 minimalist, clean, green"
stack: "Next.js, React, Tailwind CSS v4, TypeScript"
dial: "ENERGY 1 / RHYTHM 2 / MOTION 1"
---

# DESIGN.md: AI Gateway Dashboard Design System

> Design read: `A developer dashboard for an AI gateway, Material 3 minimalist, clean, green, dial ENERGY 1 / RHYTHM 2 / MOTION 1.`

## 0. HOW TO READ THIS DOCUMENT

This document is the **single source of truth** for the visual, structural, and interaction design of the dashboard.

### 0.1 Writing conventions

| Marker | Meaning |
|---|---|
| `code` | Literal value, copy-paste ready |
| **Bold** | Canonical token name. Never rename it |
| `[AI DIRECTIVE]` | Hard constraint for code generation |
| MUST / NEVER / OPTIONAL | Obligation level |

### 0.2 Read order for AI

1. Read §1 for design intent
2. Read §3, §4, §5 for tokens
3. Read §6 and §7 before creating any component
4. Run §18 before finishing

---

## 1. EXECUTIVE SUMMARY

1. One sentence: a developer dashboard that feels **minimal, clean, and precise**, built with Material 3 design language and a green color system.
2. Target emotion: calm, focused, professional. Not consumer-app playfulness.
3. Color strategy: green primary with Material 3 tonal surfaces, minimal accent usage.
4. Type strategy: Inter for UI, JetBrains Mono for data/numbers/code.
5. Motion strategy: subtle and functional. M3 state layers and transitions.

---

## 2. MATERIAL 3 PRINCIPLES

### Principle 1: Tonal Surfaces

M3 uses tonal elevation, not shadows. Surfaces are distinguished by lightness, not shadow depth.

- MUST: surface elevation shown by background lightness, not heavy shadows
- MUST: use surface containers (low, medium, high) for elevation hierarchy
- NEVER: use drop shadows as primary elevation indicator

### Principle 2: Color from Tone

Colors come from tonal palettes. Each color has tones 0-100.

- MUST: use primary color at full saturation for key actions only
- MUST: use primary container (tone 10-20) for secondary emphasis
- MUST: use on-primary (white or near-white) text on primary surfaces
- NEVER: use pure black or pure white as background

### Principle 3: Rounded Geometry

M3 uses generous, consistent corner radii.

- MUST: use M3 radius scale (4, 8, 12, 16, 28)
- MUST: larger radius for larger components
- NEVER: mix radius values arbitrarily

### Principle 4: State Layers

Interaction feedback uses state layers (translucent overlays), not color changes.

- MUST: hover = 8% opacity overlay of on-surface color
- MUST: focus = 12% opacity overlay
- MUST: pressed = 12% opacity overlay
- MUST: disabled = 12% opacity overlay with 38% text opacity
- NEVER: change base color for interaction states

---

## 3. COLOR SYSTEM

### 3.1 Green primary palette (Material 3 tonal)

```css
:root {
  /* Green primary - Material 3 tonal palette */
  --green-0: #000000;
  --green-10: #002106;
  --green-20: #00390D;
  --green-30: #005314;
  --green-40: #006D1B;
  --green-50: #008723;
  --green-60: #00A22B;
  --green-70: #00BD34;
  --green-80: #00D93D;
  --green-90: #4EFF5E;
  --green-95: #B8FFC0;
  --green-99: #F2FFF0;
  --green-100: #FFFFFF;

  /* Neutral palette */
  --neutral-0: #000000;
  --neutral-10: #1A1C19;
  --neutral-20: #2F312D;
  --neutral-30: #454843;
  --neutral-40: #5D6059;
  --neutral-50: #767971;
  --neutral-60: #90938A;
  --neutral-70: #ABAEA5;
  --neutral-80: #C6C9BF;
  --neutral-90: #E2E3DB;
  --neutral-95: #F1F1EA;
  --neutral-99: #FCFCF5;
  --neutral-100: #FFFFFF;

  /* Error palette */
  --error-40: #BA1A1A;
  --error-90: #FFDAD6;
  --error-99: #FFF9F9;
}
```

### 3.2 Semantic tokens - light mode (default)

```css
:root {
  /* Surfaces */
  --md-surface: var(--neutral-99);
  --md-surface-container-lowest: var(--neutral-100);
  --md-surface-container-low: var(--neutral-95);
  --md-surface-container: #F5F5EF;
  --md-surface-container-high: #EFEFE9;
  --md-surface-container-highest: #E9E9E3;

  /* Primary */
  --md-primary: var(--green-40);
  --md-on-primary: var(--green-100);
  --md-primary-container: var(--green-90);
  --md-on-primary-container: var(--green-10);

  /* Secondary */
  --md-secondary-container: var(--neutral-90);
  --md-on-secondary-container: var(--neutral-10);

  /* Text */
  --md-on-surface: var(--neutral-10);
  --md-on-surface-variant: var(--neutral-40);
  --md-outline: var(--neutral-60);
  --md-outline-variant: var(--neutral-80);

  /* Error */
  --md-error: var(--error-40);
  --md-on-error: var(--neutral-100);
  --md-error-container: var(--error-90);
  --md-on-error-container: #410002;

  /* State layers */
  --md-state-hover: rgba(26, 28, 25, 0.08);
  --md-state-focus: rgba(26, 28, 25, 0.12);
  --md-state-pressed: rgba(26, 28, 25, 0.12);
  --md-state-disabled: rgba(26, 28, 25, 0.12);
}
```

### 3.3 Semantic tokens - dark mode

```css
[data-theme="dark"] {
  /* Surfaces */
  --md-surface: var(--neutral-10);
  --md-surface-container-lowest: var(--neutral-0);
  --md-surface-container-low: #1E201D;
  --md-surface-container: #232521;
  --md-surface-container-high: #2D2F2B;
  --md-surface-container-highest: #383A35;

  /* Primary */
  --md-primary: var(--green-80);
  --md-on-primary: var(--green-20);
  --md-primary-container: var(--green-30);
  --md-on-primary-container: var(--green-90);

  /* Secondary */
  --md-secondary-container: var(--neutral-30);
  --md-on-secondary-container: var(--neutral-90);

  /* Text */
  --md-on-surface: var(--neutral-90);
  --md-on-surface-variant: var(--neutral-70);
  --md-outline: var(--neutral-60);
  --md-outline-variant: var(--neutral-30);

  /* Error */
  --md-error: #FFB4AB;
  --md-on-error: #690005;
  --md-error-container: #93000A;
  --md-on-error-container: var(--error-90);

  /* State layers */
  --md-state-hover: rgba(226, 227, 219, 0.08);
  --md-state-focus: rgba(226, 227, 219, 0.12);
  --md-state-pressed: rgba(226, 227, 219, 0.12);
  --md-state-disabled: rgba(226, 227, 219, 0.12);
}
```

### 3.4 Color usage rules

| Rule | Specification |
|---|---|
| Primary usage | Max 20% of viewport. Primary is for key actions and active states. |
| Surface elevation | Use surface containers, not shadows. Higher elevation = lighter surface. |
| Contrast floor | Every text/background pair passes WCAG AA (4.5:1 body, 3:1 large) |
| Status colors | Never use red/green alone. Always pair with icon or label |
| Light mode | Default. Dark mode is fully supported. |

---

## 4. TYPOGRAPHY

### 4.1 Typeface stack

| Role | Family | Reason |
|---|---|---|
| UI | Inter | Clean, neutral, M3-compatible |
| Data | JetBrains Mono | Tabular figures, perfect for numbers |

```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, monospace;
```

### 4.2 M3 type roles

```css
--md-display-large: 3.5625rem;  /* 57px */
--md-display-medium: 2.8125rem; /* 45px */
--md-display-small: 2.25rem;   /* 36px */
--md-headline-large: 2rem;     /* 32px */
--md-headline-medium: 1.75rem; /* 28px */
--md-headline-small: 1.5rem;   /* 24px */
--md-title-large: 1.375rem;    /* 22px */
--md-title-medium: 1rem;       /* 16px */
--md-title-small: 0.875rem;    /* 14px */
--md-body-large: 1rem;         /* 16px */
--md-body-medium: 0.875rem;    /* 14px */
--md-body-small: 0.75rem;      /* 12px */
--md-label-large: 0.875rem;    /* 14px */
--md-label-medium: 0.75rem;    /* 12px */
--md-label-small: 0.6875rem;   /* 11px */
```

### 4.3 Usage table

| Element | Role | Weight |
|---|---|---|
| Page title | --md-headline-small | 400 |
| Section title | --md-title-large | 400 |
| Card title | --md-title-medium | 500 |
| Body | --md-body-large | 400 |
| Table cell | --md-body-medium | 400 |
| Table header | --md-label-medium | 500 |
| Data/numbers | --md-body-medium (mono) | 400 |
| Code/keys | --md-body-small (mono) | 400 |
| Button | --md-label-large | 500 |
| Label | --md-label-medium | 500 |

---

## 5. SHAPE AND ELEVATION

### 5.1 Corner radius (M3 scale)

```css
--md-radius-xs: 4px;
--md-radius-sm: 8px;
--md-radius-md: 12px;
--md-radius-lg: 16px;
--md-radius-xl: 28px;
--md-radius-full: 9999px;
```

### 5.2 Elevation (surface containers, not shadows)

| Level | Surface | Usage |
|---|---|---|
| 0 | --md-surface | Page background |
| 1 | --md-surface-container-low | Cards, inputs |
| 2 | --md-surface-container | FAB, dropdowns |
| 3 | --md-surface-container-high | Modals, sheets |
| 4 | --md-surface-container-highest | Dialogs, popovers |

### 5.3 Shadow (minimal, only for highest elevation)

```css:
--md-shadow-1: 0 1px 2px rgba(0, 0, 0, 0.1);
--md-shadow-2: 0 2px 4px rgba(0, 0, 0, 0.1);
```

Only use shadows on level 3+ surfaces. Levels 0-2 use tonal difference only.

---

## 6. COMPONENTS

### 6.1 Button

| Variant | Background | Text | State layer |
|---|---|---|---|
| Filled | --md-primary | --md-on-primary | --md-state-hover |
| Text | transparent | --md-primary | --md-state-hover |
| Outlined | transparent | --md-primary | --md-state-hover, 1px --md-outline border |
| Tonal | --md-secondary-container | --md-on-secondary-container | --md-state-hover |
| Danger | --md-error | --md-on-error | --md-state-hover |

```css
--btn-height: 40px;
--btn-radius: var(--md-radius-full);
--btn-padding-x: 24px;
--btn-padding-x-icon: 16px;
```

### 6.2 Card

- Background: --md-surface-container-low
- Radius: --md-radius-md
- Padding: 16px
- Border: none (use tonal surface, not border)
- Hover: state layer overlay

### 6.3 Table

- Font: --md-body-medium
- Row height: 48px
- Header: --md-label-medium, --md-on-surface-variant
- Hover row: --md-state-hover
- Divider: 1px --md-outline-variant

### 6.4 Badge (chip)

- Height: 24px
- Radius: var(--md-radius-sm)
- Font: --md-label-medium
- Variants: default (neutral), success (green), error (red)

### 6.5 Input (text field)

- Background: transparent
- Border: 1px --md-outline
- Focus: 2px --md-primary border
- Radius: var(--md-radius-xs)
- Height: 48px
- Label: floating label pattern (M3)

### 6.6 Navigation (nav rail / nav bar)

- Background: --md-surface
- Active indicator: --md-secondary-container pill
- Active icon/text: --md-on-secondary-container
- Inactive: --md-on-surface-variant

### 6.7 Stat card

- Background: --md-surface-container-low
- Radius: --md-radius-md
- Label: --md-label-medium, --md-on-surface-variant
- Value: --md-headline-medium, mono font
- Trend: --md-label-medium, success/error color

### 6.8 Modal / Dialog

- Background: --md-surface-container-high
- Radius: --md-radius-xl
- Padding: 24px
- Scrim: rgba(0, 0, 0, 0.5)

---

## 7. MOTION

### 7.1 Timing

```css
--md-duration-short: 100ms;
--md-duration-medium: 250ms;
--md-duration-long: 400ms;
```

### 7.2 Easing

```css
--md-easing-standard: cubic-bezier(0.2, 0, 0, 1);
--md-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
```

### 7.3 Rules

1. MUST: use state layers for hover/focus/pressed feedback
2. MUST: transitions use --md-easing-standard
3. NEVER: duration over 400ms for UI interactions
4. MUST: respect prefers-reduced-motion

---

## 8. DASHBOARD PAGES

### 8.1 Overview

- Row of 4 stat cards (total requests, active keys, providers, tokens used)
- Recent activity list
- Provider status cards

### 8.2 API Keys

- Table: key (masked), name, status, usage, created, actions
- FAB (floating action button) to create new key
- Actions: edit, delete, regenerate

### 8.3 Providers

- Card grid: provider name, status, key count, model count
- Card opens the provider detail page
- Provider detail: info (base URL, auth type, rotation, created), API key management (list, add, remove), delete provider
- Model enable/disable stays on the Models page

### 8.4 Models

- Table: model name, provider, status, actions
- Toggle switch per model (M3 switch)

### 8.5 Usage

- Date range filter (M3 date picker)
- Table: timestamp, api key, provider, model, tokens, latency, status
- Summary stats at top

### 8.6 Settings

- Form: gateway name, default rate limit, log retention
- Save button (filled)

---

## 9. ACCESSIBILITY

| Requirement | Standard |
|---|---|
| Color contrast | WCAG 2.2 AA minimum |
| Focus indicator | 2px --md-primary outline on all interactive elements |
| Keyboard navigation | Full tab order, logical DOM order |
| Touch targets | Min 48x48px (M3 minimum) |
| Motion | Respect prefers-reduced-motion |
| Status | Never color alone, always pair with icon or label |

---

## 10. MASTER DESIGN TOKENS

### 10.1 Custom CSS (primary source)

```css
:root {
  /* Green primary - M3 tonal */
  --green-10: #002106;
  --green-20: #00390D;
  --green-30: #005314;
  --green-40: #006D1B;
  --green-80: #00D93D;
  --green-90: #4EFF5E;
  --green-95: #B8FFC0;

  /* Neutral */
  --neutral-0: #000000;
  --neutral-10: #1A1C19;
  --neutral-20: #2F312D;
  --neutral-30: #454843;
  --neutral-40: #5D6059;
  --neutral-50: #767971;
  --neutral-60: #90938A;
  --neutral-70: #ABAEA5;
  --neutral-80: #C6C9BF;
  --neutral-90: #E2E3DB;
  --neutral-95: #F1F1EA;
  --neutral-99: #FCFCF5;
  --neutral-100: #FFFFFF;

  /* Error */
  --error-40: #BA1A1A;
  --error-90: #FFDAD6;

  /* Type */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* Radius */
  --md-radius-xs: 4px;
  --md-radius-sm: 8px;
  --md-radius-md: 12px;
  --md-radius-lg: 16px;
  --md-radius-xl: 28px;
  --md-radius-full: 9999px;

  /* Motion */
  --md-duration-short: 100ms;
  --md-duration-medium: 250ms;
  --md-duration-long: 400ms;
  --md-easing-standard: cubic-bezier(0.2, 0, 0, 1);

  /* Layout */
  --sidebar-width: 280px;
  --header-height: 64px;
}
```

### 10.2 Tailwind v4 bridge

```css
@import "tailwindcss";

@theme inline {
  --color-surface: var(--md-surface);
  --color-surface-container: var(--md-surface-container);
  --color-surface-container-low: var(--md-surface-container-low);
  --color-surface-container-high: var(--md-surface-container-high);
  --color-primary: var(--md-primary);
  --color-on-primary: var(--md-on-primary);
  --color-primary-container: var(--md-primary-container);
  --color-on-primary-container: var(--md-on-primary-container);
  --color-on-surface: var(--md-on-surface);
  --color-on-surface-variant: var(--md-on-surface-variant);
  --color-outline: var(--md-outline);
  --color-outline-variant: var(--md-outline-variant);
  --color-error: var(--md-error);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
}
```

---

## 11. FILE AND NAMING CONVENTIONS

```text
src/
  components/
    ui/           Button, Card, Input, Badge, Table, Modal, Switch
    layout/       Sidebar, Header, Shell
    dashboard/    StatCard, ProviderCard, ApiKeyTable, UsageTable
  lib/
    tokens.ts     TypeScript mirror of CSS tokens
```

---

## 12. DO AND DO NOT

### DO

- Use M3 tonal surfaces for elevation, not shadows
- Use state layers for interaction feedback
- Use green primary sparingly (max 20% viewport)
- Use mono font for all numbers and data
- Use M3 radius scale consistently
- Make light mode the default

### DO NOT

- Do not use heavy drop shadows
- Do not use color alone for status
- Do not use emoji as icons
- Do not mix radius values arbitrarily
- Do not use generic CTAs like "Click here"
- Do not use decorative gradients

---

## 13. AI IMPLEMENTATION CHECKLIST

Before generating or changing UI code, verify:

- [ ] All colors come from M3 semantic tokens, never raw hex
- [ ] Surface elevation uses tonal containers, not shadows
- [ ] State layers used for hover/focus/pressed
- [ ] All animations use --md-easing-standard
- [ ] prefers-reduced-motion is handled
- [ ] Focus states are visible and pass contrast
- [ ] Every data block has empty, loading, and error states
- [ ] No dead links or placeholder buttons
- [ ] Light mode is default, dark mode is fully designed
- [ ] Status is never color alone
- [ ] Numbers use mono font
- [ ] Touch targets are min 48x48px

---

## 14. CHANGE LOG

| Version | Date | Change |
|---|---|---|
| 2.0.0 | 2026-10-17 | Switched to Material 3 design language, green color system |
| 1.0.0 | 2026-10-17 | Initial design system (dark-first, blue accent) |
