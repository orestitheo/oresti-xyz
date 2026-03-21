# oresti.xyz — Portfolio Website

## Project
Static personal portfolio for Oresti (artist name: Demea), experimental electronic musician based in Malmö, Sweden.
Hosted on GitHub Pages. Domain: demea.xyz (registered on Cloudflare, DNS pointed at GitHub Pages).
GitHub repo: github.com/orestitheo/oresti-xyz — remote via SSH: git@github.com:orestitheo/oresti-xyz.git

## Stack
- Vanilla HTML/CSS/JS only
- No frameworks, no build tools, no dependencies
- Three files: index.html, style.css, script.js

## Aesthetic
- Dark, minimal, cold — near-black with cyan tones (#080c0c bg, #4dd9d9 accent)
- Typography: Space Grotesk (body) + Space Mono (headings, dates, mono elements)
- Glitch art aesthetic — artist has provided artwork (IMG_0286.PNG, IMG_0287.PNG, IMG_1926.jpg)
- Less is more — let content breathe
- Tone: not serious, playful but not loud

## Artist identity
- Name: Oresti Theodoridis
- Artist name: Demea (from Hume's Dialogues on Religion — kept because it stuck, not for meaning)
- Previous artist name: Catacomb Sun (now a track name on the album SYN)
- Music: experimental electronic, samples, noise — "a mix of sounds and noises, drawn from the internet or otherwise discovered"
- Album: SYN on Bandcamp (dmea.bandcamp.com)
- Mix: "Grant Us Eyes Mix" on SoundCloud (soundcloud.com/catacombsun)
- Contact: oresti.theodoridis@gmail.com
- Logo: glitchy symbol (IMG_1926.jpg), used as ghost overlay in hero with mix-blend-mode: screen

## Sections
- Hero: "Demea" h1 + tagline "Samples, noise and tunes from Malmö" + logo ghost (IMG_1926.jpg) + glitch art background (IMG_0286.PNG)
- Music: SoundCloud (Grant Us Eyes Mix) + Bandcamp (SYN album) players side by side, stacked on mobile
- Bio: "A mix of sounds and noises, drawn from the internet or otherwise discovered. Press play <3"
- Links: SoundCloud, Bandcamp, Contact email

## Rules
- Mobile responsive (640px breakpoint)
- Fast loading
- Anonymous feel, no face photos
- Nothing that looks like a template
- Don't over-engineer
- Short commit messages, no co-author credits in commits

## Teaching mode
Oresti is a SW engineer (6 years, AI/backend focus) but not a frontend specialist. Briefly explain
key CSS and JS decisions as you make them — one or two lines max, inline comments in
the code itself. Don't over-explain, don't be patronizing. Just enough that I
understand why, not just what.

## Git
When committing, short messages, don't credit yourself.

## Future ideas
- Generative music app using Strudel (TidalCycles ported to JS) — random samples, drum patterns, always-on cloud app
- Would live in a separate repo, possibly hosted at music.demea.xyz
- Artwork hooks already in place in the site (data-section attributes, position: relative on sections)
