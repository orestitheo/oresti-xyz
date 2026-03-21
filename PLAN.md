# oresti.xyz — Portfolio Site Build Plan

## Context
Clean slate build of a personal portfolio site for Oresti, experimental electronic musician based in Malmö, Sweden. Zero implementation exists — index.html, style.css, script.js all need to be created. Hosted on GitHub Pages. Aesthetic: dark, minimal, intentional. Artist will provide artwork later — structure must accommodate it without restructuring.

---

## Files to Create

- `index.html` (~90 lines)
- `style.css` (~300 lines)
- `script.js` (~50 lines)

---

## index.html

Single page. Semantic HTML5 landmarks. No divitis.

**Structure:**
```
<head>
  - charset, viewport, description, og:title/description
  - preconnect: fonts.googleapis.com, fonts.gstatic.com
  - Google Fonts: Space Grotesk (400, 700) + Space Mono (400)
  - link: style.css
  - title: Oresti

<body>
  <header>
    <nav> — 5 anchor links: #hero, #music, #bio, #gigs, #links
  <main>
    <section id="hero"> — <h1>Oresti</h1> + <p class="tagline">
    <section id="music"> — <div class="players"> with two player divs
      <div class="player player--soundcloud"> — SoundCloud iframe placeholder
      <div class="player player--bandcamp"> — Bandcamp iframe placeholder
    <section id="bio"> — <p> placeholder text
    <section id="gigs"> — <ul> with <li> items, each containing
      <span class="gig-date"> + <span class="gig-info">
    <section id="links"> — <ul> of <li><a> external links
  <footer> — "© <span id="year"></span> Oresti"
  <script src="script.js">
```

Each `<section>` gets `data-section` attribute matching its id (for JS IntersectionObserver hooks and future artwork targeting).

`#hero` is full-viewport-height (`min-height: 100svh`), full-width — text container inside is capped at `--max-width`.

---

## style.css

Comment-delimited sections, no tooling:

```
/* 1. Custom properties */
/* 2. Reset / base */
/* 3. Typography */
/* 4. Layout */
/* 5. Nav */
/* 6. Hero */
/* 7. Music / players */
/* 8. Bio */
/* 9. Gigs */
/* 10. Links */
/* 11. Footer */
/* 12. Media queries */
```

**Design tokens on `:root`:**
```css
--bg:           #0a0a0a;
--surface:      #111111;
--border:       #1e1e1e;
--text:         #d4d4d4;
--text-muted:   #5a5a5a;
--accent:       #c8b89a;   /* warm sand — no neon, no blue */

--font-body:    'Space Grotesk', sans-serif;
--font-mono:    'Space Mono', monospace;

--size-hero:    clamp(2.5rem, 8vw, 5rem);
--max-width:    720px;
--space-xl:     8rem;
--space-lg:     4rem;
--space-md:     2rem;
--space-sm:     1rem;

--transition:   200ms ease;
--noise-texture: none;  /* hook for future texture overlay */
--hero-bg:      none;   /* hook for future artwork */
```

**Key rules:**
- All sections: `max-width: var(--max-width); margin-inline: auto; padding: var(--space-xl) var(--space-md)`
- `#hero`: overrides max-width to full-bleed; inner container capped at --max-width; `position: relative; overflow: hidden` for artwork readiness
- Section `h2`: `font-weight: 400; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-muted)` — understated labels
- Hero `h1`: `font-size: var(--size-hero); font-weight: 700; letter-spacing: -0.02em`
- `.tagline`: uppercase, muted, small, tracked
- `.players`: flex column, gap, `--surface` background on each player div
- Gig `<li>`: flex row with date in mono font, muted; info in regular
- Links `<ul>`: plain list, each `<a>` gets accent color on hover
- `body::before`: `position: fixed; inset: 0; background-image: var(--noise-texture); opacity: 0.03; pointer-events: none` — ready for texture, zero cost without it
- `html`: `scroll-behavior: smooth`

**Mobile (single breakpoint at 640px):**
- Reduce `--space-xl` and `--space-lg`
- Nav links: stack or reduce size
- Player heights adjusted
- Gig list items: flex-direction column (date above info)

---

## script.js

Exactly two responsibilities:

1. **IntersectionObserver for active nav state**
   - Observe each `section[data-section]`
   - On intersection: find matching nav `<a[href="#id"]>` and add `aria-current="page"` (remove from others)
   - ~25 lines

2. **Footer year injection**
   - `document.getElementById('year').textContent = new Date().getFullYear()`
   - 1 line

No other JS. No scroll listeners. No DOM content manipulation.

---

## Fonts

- **Space Grotesk** — body, headings. Technical, slightly cold, not startup-ish
- **Space Mono** — dates, metadata labels. Same design family, reinforces machine/grid feel

Both loaded from Google Fonts with `display=swap`.

---

## Artwork accommodation (built in, zero cost until needed)

| Insertion point | How it works |
|---|---|
| Hero full-bleed bg | `--hero-bg` custom property + `background-image: var(--hero-bg)` on `#hero`. Set the variable when artwork arrives. |
| Section art | `data-section` attributes on each section; `position: relative` already set — drop in `<figure class="section-art">` and style with absolute positioning |
| Noise texture | `body::before` with `var(--noise-texture)` — set the variable to a path when ready |

---

## Verification

1. Open `index.html` in browser — check: dark bg, fonts load, sections visible
2. Resize to 375px — check: no horizontal scroll, nav readable, gig list stacks
3. Click nav links — check: smooth scroll, active state updates
4. Check footer year matches current year
5. Validate HTML at validator.w3.org — expect zero errors
