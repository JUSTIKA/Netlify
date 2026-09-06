# Joao's Portfolio — CLAUDE.md

Personal portfolio site. **Vanilla HTML/CSS/JS, no build step, no framework, no
package.json.** Deployed via Netlify (repo is named `Netlify`). Keep it that way —
don't introduce a bundler/React/Tailwind unless explicitly asked.

## Pages

| File | Content |
|---|---|
| `index.html` | Home — hero, About (+ stat cells), Projects grid, Experience timeline, Links |
| `formannonce.html` | Project detail — Form'Annonce (SaaS, founder) |
| `hackathon.html` | Project detail — Drone Defense Hackathon (3rd place, AdoptAI) |
| `DP.html` | Project detail — Drone Porteur (M2 graduation project) |
| `rocobup.html` | Project detail — RoboCup SSL · VisionBlackOut |
| `firstbot.html` | Project detail — FirstBot line-follower |
| `style.css` | Single shared stylesheet for every page above |
| `command-palette.js` | Shared ⌘K quick-nav, injects its own DOM, referenced from every page |

`save/` is an old pre-redesign backup (untouched, low priority to clean up).
`test.html` / `styletest.css` are scratch files, not part of the real site.

## Hard content rule

**Never invent new project/experience facts** — no new claims, dates, tools,
numbers, or details Joao hasn't stated somewhere on the site already. Restyling,
reorganizing, and rephrasing existing copy is fine (e.g. turning an em-dash
aside into a colon, or pulling a number already in a paragraph into a stat
card) — inventing a new one is not. If a design idea needs content that isn't
there, ask rather than fabricate a placeholder that looks real.

## Design system (already built — extend it, don't replace it)

Dark editorial aesthetic, established in `style.css`'s `:root`:

- **Palette**: `--bg:#0F0F0F`, `--bg-2:#171717`, `--bg-card:#1E1E1E`,
  `--text-main:#F5F3EF`, `--text-muted:#9E9892`, `--accent:#D4C4A8` (warm
  champagne — the *only* accent color, used sparingly).
- **Type**: DM Sans (body) + Syne (display/headings, loaded via Google Fonts
  but curiously not actually `@import`-ed for Syne — check before assuming
  it's loading) + Cabinet Grotesk (sidebar name).
- **Shape language**: hairline `1px solid var(--border)` borders, `12px`
  radius (`var(--radius)`), no default shadows except a soft one on
  hover-lift. Small decorative accent dots (status dot, timeline dot) are
  intentional, not slop — the *nav-item* dots were the slop and were removed.
- **Layout**: fixed 260px sidebar (`.sidenav`) + `.main-content`; project
  cards live in a 2-col `.projects-grid` with one `.featured` card spanning
  both columns.
- **Progressive enhancement pattern (important, see Gotchas)**: `.reveal`
  elements (project cards, timeline items) are visible by default in plain
  CSS; they only get hidden pre-animation state under `html.has-js`, a class
  a synchronous inline `<script>` at the very top of every `<head>` adds.
  JS then reveals them via IntersectionObserver, with a hard-coded
  `setTimeout(revealAll, 2500)` safety net and a full try/catch fallback.
  **Never make content's *existence* depend on JS running successfully** —
  animation is the only thing allowed to depend on JS.

## Conventions for new assets

- Card thumbnails: `images/thumb_<project>.jpg`, ~900px wide, JPEG q80-85,
  generated from real photos/video frames already on that project's own
  detail page — never a stock photo, never AI-generated imagery.
- If a source photo/video is too heavy for a homepage thumbnail (check with
  `ls -la`, anything over ~1MB is worth pausing on), extract/recompress
  rather than shipping it raw or silently picking a different asset than
  what was agreed — say what you did.
- OG images: `images/og-image.jpg` (1200×630, generic/profile-based) or a
  project's own `thumb_*.jpg` if it's large enough (~900px+ wide).
- Favicon is a **swappable placeholder** — `favicon.svg` (primary),
  `favicon-32.png` (legacy fallback), `apple-touch-icon.png`. Same filenames,
  same paths; Joao can drop in a real mark later without touching HTML.

## Skills/tools used this project (worth reaching for again)

- **`tastemaker` skill** (installed globally at `~/.claude/skills/tastemaker`,
  available in any repo) — used in **audit mode** for a design/a11y pass:
  `python3 scripts/anti_slop_scan.py <files>` (gradients, emoji-icons,
  AI-copy phrases, `transition: all`, missing alt text) and
  `python3 scripts/audit_motion.py <files>` (motion craft: layout-property
  transitions, missing `prefers-reduced-motion`, long durations). Both are
  cheap to re-run after any CSS/JS change — do it before calling a pass done.
  `scripts/check_contrast.py` is worth running on any new color pairing.
- **Playwright, driven directly (no MCP)** — this environment has no
  `chromium-cli`; instead: Node 22 via nvm
  (`export PATH="/home/joao/.nvm/versions/node/v22.0.0/bin:$PATH"`) with a
  global `playwright` install
  (`NODE_PATH="/home/joao/.nvm/versions/node/v22.0.0/lib/node_modules"`),
  Chromium already cached. Pattern: `python3 -m http.server <port> --bind
  127.0.0.1 &` from the repo root, then a throwaway Node script under the
  scratchpad dir that launches `chromium.launch()`, navigates, screenshots.
  Kill the server after with `lsof -ti:<port> -sTCP:LISTEN | xargs -r kill`.
  **This is how real bugs got caught in this project — screenshots and
  actual hover/click simulation, not just reading the CSS.** Keep doing this
  for anything interaction-dependent (hover states, JS-gated content,
  keyboard shortcuts) rather than eyeballing the diff.

## Gotchas hit in this codebase (don't reintroduce these)

1. **CSS specificity trap with `html.has-js` prefixes.** A selector like
   `html.has-js .project-card.reveal { opacity: 0 }` is *more specific* than
   a plain `.project-card.visible { opacity: 1 }` override written before
   this pattern existed — the "visible" state silently loses even though
   the class is present. If you add a `.visible`/`.active`/similar override
   for something with an `html.has-js`-prefixed hidden state, give the
   override the *same* prefix + all the same classes, not fewer.
2. **A full-card decorative `::after`/`::before` overlay without
   `pointer-events: none` silently eats every hover/click meant for its
   children.** `.project-card::after` (the corner hover-glow) did exactly
   this — it never mattered while only card-level `:hover` was used, but it
   silently killed a new per-child hover feature (video/diagram crossfade
   on `.project-visual`) until `pointer-events: none` was added. Any new
   *full-element* absolutely-positioned decorative layer needs
   `pointer-events: none` unless it's meant to intercept the pointer.
3. **`page.mouse.move(x, y)` with no `steps` option can land the *wrong*
   element** in Playwright/Chromium — it may not generate enough
   intermediate events, or scroll-behavior:smooth CSS makes a `boundingBox()`
   taken right after `scrollIntoView()` stale before the animation settles.
   Use `{ steps: 8+ }`, force `scroll-behavior: auto` (or `{behavior:
   'instant'}`) before measuring, and when a hover/click test does something
   unexpected, debug with `document.elementFromPoint(x, y)` before assuming
   the site JS is broken — it's often a hit-testing/timing issue in the test,
   but occasionally (see #2) it's real.
4. **Reveal-on-scroll must never gate content's existence**, only its
   entrance animation. This site's original scroll-reveal JS had no
   fallback: with JS disabled, the *entire* Projects and Experience sections
   were blank (confirmed via `page.newContext({ javaScriptEnabled: false })`).
   Any future scroll/reveal-triggered feature needs the same
   visible-by-default-in-CSS + JS-only-enhances pattern already in place.

## Known gaps / deliberately deferred

- `og:url` / canonical URL isn't set anywhere — the live domain was never
  confirmed. Ask Joao for it and add `<meta property="og:url">` +
  `<link rel="canonical">` to every page once known.
- `hackathon.html` has one leftover AI-copy-flagged phrase ("seamless
  communication") that anti_slop_scan still flags — left alone because it's
  a wording call on existing copy, not a styling fix; ask before touching it.
- Deferred by explicit request, not forgotten: a live GitHub activity embed
  (real data from github.com/JUSTIKA) and WebP thumbnails with JPEG
  fallback via `<picture>`.
- `save/`, `test.html`, `styletest.css` are old/scratch files still sitting
  in the repo root — never cleaned up, ask before deleting since they were
  never confirmed as safe to remove.
