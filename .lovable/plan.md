# Waides KI — Full Frontend Rebuild Plan

## 1. Theme overhaul (single source of truth)

**`src/index.css`** — wipe and rewrite tokens to strict 4-color palette:
- `--background: 0 0% 0%` (pure black)
- `--foreground: 0 0% 100%` (white)
- `--primary: 185 100% 55%` (cyan)
- `--accent: 280 90% 65%` (purple)
- Derive `card`, `popover`, `muted`, `secondary`, `border`, `sidebar-*` from layered blacks (HSL 0 0% 4–12%)
- Remove all other hues (success/warning/danger/info → map to cyan/purple/white)
- Replace gradients (`--gradient-dark`, `--gradient-primary`, `--gradient-nexus`, `--gradient-card`) to only mix black + cyan + purple
- Add `html, body, #root { background: #000; color-scheme: dark; min-height: 100% }` to kill white flash
- Add `<meta name="theme-color" content="#000000">` in `index.html` and set `<html style="background:#000">`

**`tailwind.config.ts`** — keep semantic tokens; remove `success`/`warning`/`danger`/`info` extras (or alias all to primary/accent/foreground).

## 2. Kill white-flash & default styling

- `index.html`: inline `<style>html,body{background:#000;color:#fff}</style>` in `<head>` before Vite injects CSS
- Delete `src/App.css` (unused legacy styles, conflicts with theme)
- Ensure `DashboardLayout` root and `main` always have `bg-background`

## 3. Landing route → Chat

- `src/pages/Index.tsx`: render the Chat experience (inside `DashboardLayout`) instead of `Landing`
- Update `App.tsx` routing: `/` renders DashboardLayout with Chat as the index route; keep `/dashboard`, `/signals`, etc. as siblings
- Old `Landing.tsx` kept but unused (or repurposed later)

## 4. App shell — no re-render on navigation

- Move `DashboardLayout` to wrap `/` so sidebar + header mount once; only `<Outlet/>` swaps
- Memoize `AppSidebar` and header (`React.memo`)
- Move global hooks (`useMarketData`, `useSignals`, `useSandboxAutoTrader`) into a separate `<GlobalRuntime/>` component mounted once in layout — sidebar receives no props derived from polling state
- Remove the 60s `setInterval` health re-render from layout; subscribe via memoized selector or move to header-only memoized child

## 5. Scroll stability

- Audit `main` for scroll listeners; ensure none set React state
- Any scroll-driven UI uses `useRef` + `requestAnimationFrame`

## 6. Card component normalization

- Update `TerminalCard` to use only `bg-card` (layered black), border `border-border`, hover ring `hover:shadow-[0_0_24px_hsl(var(--primary)/0.25)]`
- Remove backdrop-blur from `.terminal-border` (per "no global blur")

## 7. Footer

- New `src/components/AppFooter.tsx`: friendly footer with brand mark, tagline, quick nav (Chat, Signals, Predictions, Chinnikstah, Tredbeings, Sandbox), system status pill, "Konsmik Civilization · © 2026", small cyan/purple accent line
- Mount inside `DashboardLayout` below `<main>`

## 8. Cleanup pass

- Delete `src/App.css`
- Search & remove inline `style={{...}}` color usage in pages (keep functional inline styles like `paddingBottom: env(safe-area-inset-bottom)`)
- Remove unused keyframes that reference non-palette colors

## 9. Verification

- Build passes
- Visit `/`, `/signals`, `/chinnikstah`, `/tredbeings` — no white flash, sidebar doesn't remount (no flicker)
- All visible color = black/cyan/purple/white only

## Technical notes

- Files touched: `src/index.css`, `src/App.tsx`, `src/App.css` (delete), `index.html`, `src/pages/Index.tsx`, `src/layouts/DashboardLayout.tsx`, `src/components/AppSidebar.tsx` (memo), `src/components/TerminalCard.tsx`, `src/components/AppFooter.tsx` (new), `tailwind.config.ts`
- Non-goals: no business logic changes, no backend changes, no new features beyond footer + landing reroute
- Risk: token color changes ripple visually across every page — acceptable per user directive ("full UI rebuild")
