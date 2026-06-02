
# Waides KI — Full Frontend Rebuild

A complete UI overwrite enforcing a strict 4-color system (Black, Cyan, Purple, White), eliminating white-flash, stabilizing scroll, and making the KI Chat the landing page. No logic, no backend, no engine code is touched.

## 1. Theme Lockdown (single source of truth)

Rewrite `src/index.css` and `tailwind.config.ts` so the ONLY available colors are:

- `--background` → pure black `0 0% 0%`
- `--foreground` → white `0 0% 100%`
- `--primary` → cyan `185 100% 55%`
- `--accent` → purple `280 90% 65%`
- Neutrals derived only from black + white (muted = `0 0% 8%`, border = `0 0% 14%`)
- Status colors collapsed: `success` = cyan, `warning` = purple, `danger` = white-on-cyan outline only

Remove every other custom token (`--info`, gradients with extra hues, `--primary-glow`, `--accent-glow` mapped to same cyan/purple). Delete `src/App.css` (unused legacy).

Add `html, body, #root { background: #000; color: #fff; min-height: 100%; }` and set `<html class="dark">` permanently in `index.html` plus a black `<body style="background:#000">` inline ONLY in `index.html` to kill first-paint white flash before CSS loads.

## 2. Landing = Chat

- Repoint `src/pages/Index.tsx` to render the Chat experience (wrapped in `DashboardLayout`) instead of `Landing`.
- Update router: `/` shows Chat inside the dashboard shell so sidebar + bottom nav are visible immediately.
- Keep `/chat` working as an alias.
- `Landing.tsx` stays in repo (unused) — out of scope to delete page-level files referenced elsewhere; just unwire from `/`.

## 3. Rebuilt Bottom Nav (`MobileBottomNav`)

Full rewrite with:
- Pill-shaped floating bar, black with cyan border-glow, safe-area aware.
- 5 items: Chat (center, elevated cyan glow), Signals, Chinnikstah, Predictions, Dashboard.
- Active item: cyan icon + purple underline dot, smooth scale.
- Inactive: white/60 icons.
- No re-render on scroll (uses `NavLink` only, no scroll listeners).

## 4. Sidebar refresh

Restyle `AppSidebar` to the 4-color palette:
- Pure black background, white text, cyan active state, purple hover accent.
- Remove all gradient/nexus shimmer that introduced other hues.
- Keep nav items as-is (no item changes).

## 5. Card & Surface system

Rewrite `TerminalCard` and add `.surface` utility:
- Background: layered black (`#000` → `#0a0a0a`).
- Border: `hsl(0 0% 14%)`.
- Hover: cyan glow `0 0 24px hsl(185 100% 55% / .35)`, alternating purple variant via `variant="accent"`.
- No backdrop-blur (removed per "no global blur" rule — keep only on sticky header at minimal level… actually remove entirely to honor rule).

## 6. White-flash & scroll fixes

- `index.html`: inline `<style>html,body{background:#000;color:#fff}</style>` in `<head>` before any JS.
- `DashboardLayout`: root wrapper forced `bg-black`, remove `bg-gradient-dark`.
- Remove `backdrop-blur-md` from sticky header (replaced with solid `bg-black/95`).
- `ErrorBoundary` fallback: black background.
- Audit and remove `scroll`-triggered `useState` (none found in layout; will verify in `Markets`, `Signals`, `Predictions` quickly and convert any to `useRef` if present).

## 7. CSS cleanup

- Delete `src/App.css`.
- Strip unused utilities from `index.css`: `nexus-shimmer`, `float-glow`, `hex-pattern`, `scanline`, gradient tokens not in palette.
- Keep only: `grid-pattern` (recolored cyan/purple), `pulse-dot`, `text-gradient-primary` (cyan→purple), `terminal-border`, `glow-primary`, `glow-accent`.
- Remove inline `style={}` color usages found in components touched.

## 8. Out of scope (explicitly NOT touched)

- Engine code (`src/lib/konsmia/*`)
- Hooks (`useSignals`, `useMarketData`, `useSandboxAutoTrader`, `useOnyix`)
- Edge functions / Supabase
- Tredbeings, SmaiChinnikstah, Sandbox page **logic** (only color tokens propagate via theme — no structural edits)
- Per-page rebuilds beyond what the theme inheritance gives us. The user said "rebuild frontend UI system" + nav + landing; per-page redesigns of 15+ pages would be a separate pass. This plan delivers the system, landing, nav, sidebar, cards, and flash/scroll fixes so every page inherits the new look automatically.

## Files

**Rewrite:** `src/index.css`, `tailwind.config.ts`, `index.html`, `src/App.tsx`, `src/pages/Index.tsx`, `src/components/MobileBottomNav.tsx`, `src/components/AppSidebar.tsx`, `src/components/TerminalCard.tsx`, `src/layouts/DashboardLayout.tsx`, `src/components/ErrorBoundary.tsx`

**Delete:** `src/App.css`

## Confirm before I execute

Reply "go" to execute, or tell me to expand scope to also rebuild specific pages (Dashboard, Signals, etc.) individually.
