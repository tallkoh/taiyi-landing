# Taiyi Almanac Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the "Almanac" (通書) landing page for Taiyi — a $12/mo personalized weekly fengshui newsletter — as a responsive, mobile-first static HTML/CSS/JS page that matches the wireframe design exactly.

**Architecture:** Single-page static HTML with a CSS custom-property design system and minimal vanilla JS for interactivity. No build step, no framework. The page has 9 content sections (nav → masthead → bazi form → how-it-works → why-taiyi → sample newsletter → pricing → FAQ → footer).

**Tech Stack:** HTML5, CSS (custom properties, grid, flexbox), vanilla JS, Google Fonts (Newsreader, Inter Tight, Noto Serif SC, IBM Plex Mono, IBM Plex Sans, Kalam)

---

## Source Design

Design wireframe lives at `/tmp/taiyi/project/wireframes.jsx` (extracted from the design bundle). All measurements, colors, fonts, and copy come from that file. The README at `/tmp/taiyi/README.md` instructs: *"recreate pixel-perfectly in whatever technology makes sense"* and *"match the visual output; don't copy the prototype's internal structure."*

---

## File Map

```
/Users/natasha/Projects/taiyi/
├── index.html          ← full page HTML, all 9 sections
├── style.css           ← design tokens + all component/layout styles
└── script.js           ← FAQ accordion toggle only
```

---

## Design Token Reference

**Colors — Default "Cream" Palette**
```
--paper:          #f4eee0   (page background)
--paper-2:        #ebe3d0   (secondary bg: nav, masthead, footer)
--ink:            #1a1612   (text, borders, buttons)
--ink-2:          #3a322a   (secondary text, subheadings)
--muted:          #847b6a   (placeholder, labels, muted text)
--line:           rgba(26,22,18,.55)   (solid dividers)
--line-soft:      rgba(26,22,18,.22)   (soft borders)
--line-very-soft: rgba(26,22,18,.10)   (ghost borders)
--seal:           #b83828   (accent red — CTAs, Chinese chars, stamps)
--seal-2:         #8b2418   (darker accent red)
--accent:         #b83828   (same as seal)
--highlight:      #ffe888   (yellow highlight)
```

**Typography**
```
--display: 'Newsreader', 'Source Serif Pro', Georgia, serif
--body:    'Inter Tight', 'IBM Plex Sans', system-ui, sans-serif
--mono:    'IBM Plex Mono', ui-monospace, monospace
--cn:      'Noto Serif SC', serif          (Chinese characters)
--hand:    'Kalam', cursive               (decorative annotations only)
```

**Background texture (body):**
```css
background-image:
  radial-gradient(ellipse 1000px 700px at 20% 0%, rgba(184,56,40,0.05), transparent 70%),
  repeating-linear-gradient(0deg, transparent 0, transparent 28px,
    rgba(27,23,20,0.022) 28px, rgba(27,23,20,0.022) 29px);
```

**Shared measurements**
- Section padding desktop: `40px 48px`
- Section padding mobile: `28px 20px`
- Section divider: `border-top: 1px dashed var(--line-soft)`
- Max content width: `680px` (single-column, centered)
- Border radius: `2px` everywhere
- Button box-shadow offset: `2px 2px 0 0 var(--ink)`

---

## Task 1: HTML Shell + Google Fonts

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create the HTML shell**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Taiyi 太乙 — Your week, read through the four pillars</title>
  <meta name="description" content="A weekly letter combining your bazi with where you live and the qimen calendar. Sundays, by email. $12 / month." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Inter+Tight:wght@400;500;600&family=Kalam:wght@300;400&family=Noto+Serif+SC:wght@500;700;900&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>

  <!-- 1. Nav -->
  <nav class="site-nav" id="top">
    <!-- Task 4 -->
  </nav>

  <main>
    <!-- Tasks 5–11 insert full <section> blocks here in order -->
    <!-- Task 5: masthead -->
    <!-- Task 6: snapshot -->
    <!-- Task 7: how-it-works -->
    <!-- Task 8: why-taiyi -->
    <!-- Task 9: sample newsletter -->
    <!-- Task 10: pricing -->
    <!-- Task 11: faq -->
  </main>

  <!-- Task 12 inserts footer content here -->
  <footer class="site-footer">
  </footer>

  <script src="script.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify file exists and opens in browser**

```bash
open /Users/natasha/Projects/taiyi/index.html
```
Expected: blank page, no console errors, fonts load (check DevTools Network tab).

- [ ] **Step 3: Commit**

```bash
cd /Users/natasha/Projects/taiyi && git init && git add index.html && git commit -m "feat: scaffold HTML shell with section placeholders"
```

---

## Task 2: CSS Design Tokens & Global Styles

**Files:**
- Create: `style.css`

- [ ] **Step 1: Write tokens and global reset**

Create `style.css` with:

```css
/* ── Design tokens ─────────────────────────────────────────────────── */
:root {
  --paper:           #f4eee0;
  --paper-2:         #ebe3d0;
  --ink:             #1a1612;
  --ink-2:           #3a322a;
  --muted:           #847b6a;
  --line:            rgba(26,22,18,.55);
  --line-soft:       rgba(26,22,18,.22);
  --line-very-soft:  rgba(26,22,18,.10);
  --seal:            #b83828;
  --seal-2:          #8b2418;
  --accent:          #b83828;
  --highlight:       #ffe888;

  --display: 'Newsreader', 'Source Serif Pro', Georgia, serif;
  --body:    'Inter Tight', 'IBM Plex Sans', system-ui, sans-serif;
  --mono:    'IBM Plex Mono', ui-monospace, monospace;
  --cn:      'Noto Serif SC', serif;
  --hand:    'Kalam', cursive;

  --max-w:  680px;
  --pad-x:  48px;
  --pad-x-m: 20px;
}

/* ── Reset ─────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }

/* ── Body base ─────────────────────────────────────────────────────── */
body {
  font-family: var(--body);
  background-color: var(--paper);
  background-image:
    radial-gradient(ellipse 1000px 700px at 20% 0%, rgba(184,56,40,0.05), transparent 70%),
    repeating-linear-gradient(0deg, transparent 0, transparent 28px,
      rgba(27,23,20,0.022) 28px, rgba(27,23,20,0.022) 29px);
  color: var(--ink);
  font-size: 15px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  min-height: 100vh;
}

/* ── Inner content wrapper (used by all sections) ──────────────────── */
.inner {
  max-width: var(--max-w);
  margin: 0 auto;
  width: 100%;
}
```

- [ ] **Step 2: Add section layout rules**

Append to `style.css`:

```css
/* ── Section ───────────────────────────────────────────────────────── */
.section {
  padding: 40px var(--pad-x);
  border-top: 1px dashed var(--line-soft);
}
.section--masthead {
  background: var(--paper-2);
  border-top: none;
  padding-bottom: 48px;
}
.section--tinted {
  background: color-mix(in srgb, var(--paper-2) 50%, var(--paper));
}
@media (max-width: 640px) {
  :root { --pad-x: 20px; }
  .section { padding: 28px var(--pad-x); }
  .section--masthead { padding-bottom: 36px; }
}
```

- [ ] **Step 3: Verify in browser**

Reload `index.html`. Expected: cream background with faint ruled lines, no layout shifts.

- [ ] **Step 4: Commit**

```bash
git add style.css && git commit -m "feat: add CSS design tokens, global reset, section layout"
```

---

## Task 3: Shared Component Styles

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Stamp component**

Append to `style.css`:

```css
/* ── Stamp ─────────────────────────────────────────────────────────── */
.stamp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px; height: 22px;
  background: var(--seal);
  color: var(--paper);
  font-family: var(--cn);
  font-weight: 700;
  font-size: 14px;
  border-radius: 2px;
  transform: rotate(-3deg);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.25);
  flex-shrink: 0;
  user-select: none;
}
.stamp--lg { width: 36px; height: 36px; font-size: 22px; }
.stamp--xl { width: 64px; height: 64px; font-size: 38px; border-radius: 3px; }
```

- [ ] **Step 2: Eyebrow & headline typography**

Append to `style.css`:

```css
/* ── Typography helpers ────────────────────────────────────────────── */
.eyebrow {
  font-family: var(--mono);
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 6px;
  display: block;
}
.headline {
  font-family: var(--display);
  font-weight: 400;
  font-size: 30px;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--ink);
  margin: 12px 0 10px;
  text-wrap: balance;
}
.headline--lg { font-size: 38px; }
.headline--md { font-size: 22px; }
.headline--sm { font-size: 20px; }
.sub-headline {
  font-family: var(--body);
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--ink-2);
  margin-bottom: 16px;
}
.cn {
  font-family: var(--cn);
  color: var(--accent);
  font-weight: 600;
}
```

- [ ] **Step 3: Button styles**

Append to `style.css`:

```css
/* ── Buttons ───────────────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--ink);
  color: var(--paper);
  font-family: var(--body);
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 0.005em;
  padding: 10px 16px;
  border: 1.5px solid var(--ink);
  border-radius: 2px;
  box-shadow: 2px 2px 0 0 var(--ink-2);
  cursor: pointer;
  text-decoration: none;
  transition: opacity .15s;
}
.btn:hover { opacity: .88; }
.btn--primary {
  background: var(--seal);
  border-color: var(--seal);
  box-shadow: 2px 2px 0 0 var(--ink);
}
.btn--ghost {
  background: transparent;
  color: var(--ink);
  box-shadow: none;
  border-style: dashed;
}
.btn--lg { padding: 13px 20px; font-size: 14px; }
.btn--block { width: 100%; }
```

- [ ] **Step 4: Input & form row**

Append to `style.css`:

```css
/* ── Inputs & forms ────────────────────────────────────────────────── */
.input {
  border: 1.5px solid var(--ink);
  background: color-mix(in srgb, var(--paper) 80%, white);
  padding: 8px 12px;
  font-family: var(--body);
  font-size: 13px;
  color: var(--ink);
  border-radius: 2px;
  min-height: 36px;
  width: 100%;
  outline: none;
  appearance: none;
}
.input--lg { min-height: 44px; font-size: 14px; padding: 10px 14px; }
.input::placeholder { color: var(--muted); }
.input:focus { border-color: var(--seal); }

.input-label {
  font-family: var(--body);
  font-size: 11.5px;
  color: var(--muted);
  margin-bottom: 3px;
  display: block;
  letter-spacing: 0.005em;
}
.row-form {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: stretch;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}
.form-grid .full { grid-column: 1 / -1; }
.form-hint {
  font-family: var(--body);
  font-size: 11px;
  color: var(--muted);
  text-align: center;
  margin-top: 8px;
  letter-spacing: 0.01em;
}
@media (max-width: 400px) {
  .form-grid { grid-template-columns: 1fr; }
  .form-grid .full { grid-column: 1; }
}
```

- [ ] **Step 5: Scribble divider & misc**

Append to `style.css`:

```css
/* ── Scribble divider ──────────────────────────────────────────────── */
.scribble {
  height: 14px;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10' preserveAspectRatio='none'><path d='M0 5 Q 5 0, 10 5 T 20 5 T 30 5 T 40 5 T 50 5 T 60 5 T 70 5 T 80 5 T 90 5 T 100 5' stroke='currentColor' stroke-width='0.6' fill='none' opacity='0.45'/></svg>");
  background-repeat: repeat-x;
  background-size: 60px 8px;
  background-position: center;
  margin: 10px 0;
  color: var(--ink);
}

/* ── Data strip cell (used in masthead + newsletter) ───────────────── */
.data-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  border: 1px dashed var(--line);
  padding: 12px 10px;
  background: color-mix(in srgb, var(--paper) 75%, white);
  font-size: 10.5px;
  margin-bottom: 14px;
}
.data-cell-label {
  font-family: var(--mono);
  font-size: 8.5px;
  color: var(--muted);
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}
.data-cell-value {
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--ink);
}
.data-cell-sub {
  font-size: 8.5px;
  color: var(--ink-2);
  margin-top: 1px;
}
```

- [ ] **Step 6: Commit**

```bash
git add style.css && git commit -m "feat: add shared component styles (stamp, btns, inputs, scribble)"
```

---

## Task 4: Navigation Bar

**Files:**
- Modify: `index.html`, `style.css`

- [ ] **Step 1: Add nav HTML** — replace the empty `<nav class="site-nav" id="top">` body with:

```html
<nav class="site-nav" id="top">
  <div class="nav-inner">
    <a href="#top" class="nav-logo" aria-label="Taiyi home">
      <span class="stamp" aria-hidden="true">太</span>
      Taiyi
    </a>
    <div class="nav-links" role="list">
      <a href="#how" role="listitem">How it works</a>
      <a href="#why" role="listitem">Why Taiyi</a>
      <a href="#pricing" role="listitem">Pricing</a>
      <a href="#faq" role="listitem">FAQ</a>
    </div>
  </div>
</nav>
```

- [ ] **Step 2: Add nav CSS** — append to `style.css`:

```css
/* ── Site nav ──────────────────────────────────────────────────────── */
.site-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--paper-2);
  border-bottom: 1px dashed var(--line-soft);
  padding: 0 var(--pad-x);
}
.nav-inner {
  max-width: var(--max-w);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 52px;
  gap: 16px;
}
.nav-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--display);
  font-size: 20px;
  font-weight: 500;
  letter-spacing: -0.012em;
  color: var(--ink);
  text-decoration: none;
}
.nav-links {
  display: flex;
  gap: 20px;
}
.nav-links a {
  font-family: var(--body);
  font-size: 12.5px;
  color: var(--muted);
  text-decoration: none;
  letter-spacing: 0.01em;
  transition: color .15s;
}
.nav-links a:hover { color: var(--ink); }
@media (max-width: 500px) {
  .site-nav { padding: 0 var(--pad-x-m); }
  .nav-links { display: none; }
}
```

- [ ] **Step 3: Verify in browser**

Reload. Expected: sticky nav with stamp logo on left, 4 links on right; hides links below 500px.

- [ ] **Step 4: Commit**

```bash
git add index.html style.css && git commit -m "feat: add sticky nav bar"
```

---

## Task 5: Almanac Masthead (Hero Section)

**Files:**
- Modify: `index.html`, `style.css`

This is the most complex section. It has three sub-parts:
1. Three-column header: vertical Chinese text left | center content | vertical Chinese text right
2. Scribble divider + almanac strip (宜 / 忌 / QIMEN №)
3. Email capture form

- [ ] **Step 1: Add masthead HTML** — append this full `<section>` block inside `<main>`, replacing the `<!-- Task 5: masthead -->` comment line:

```html
<section class="section section--masthead" id="hero">
  <div class="inner">

    <!-- 3-col masthead header -->
    <div class="masthead-header">
      <div class="masthead-vertical masthead-vertical--left" aria-hidden="true">太乙</div>
      <div class="masthead-center">
        <div class="masthead-eyebrow">丙午年 · 立夏 · <span class="masthead-week">WEEK OF MAY 17</span></div>
        <h1 class="headline headline--lg masthead-headline">Your week, read through the four pillars.</h1>
        <p class="sub-headline masthead-sub">
          A weekly letter combining your bazi with where you live and the qimen calendar.
          Sundays, by email. $12&thinsp;/&thinsp;month.
        </p>
      </div>
      <div class="masthead-vertical masthead-vertical--right" aria-hidden="true">壬寅日</div>
    </div>

    <div class="scribble"></div>

    <!-- Today's almanac strip -->
    <div class="data-strip masthead-strip">
      <div class="data-cell">
        <div class="data-cell-label"><span class="cn" style="margin-right:3px">宜</span>TODAY</div>
        <div class="data-cell-value">sign contracts</div>
        <div class="data-cell-sub">before noon</div>
      </div>
      <div class="data-cell">
        <div class="data-cell-label"><span class="cn" style="font-weight:600;margin-right:3px">忌</span>TODAY</div>
        <div class="data-cell-value">west meetings</div>
        <div class="data-cell-sub">after 3 pm</div>
      </div>
      <div class="data-cell">
        <div class="data-cell-label" style="font-family:var(--mono)">QIMEN №427</div>
        <div class="data-cell-value">天輔星</div>
        <div class="data-cell-sub">of 1,080 plates</div>
      </div>
    </div>

    <!-- Email capture -->
    <div class="email-capture">
      <div class="row-form">
        <input
          type="email"
          class="input input--lg"
          placeholder="your email — free Sunday preview first"
          aria-label="Email address"
          autocomplete="email"
        />
        <button class="btn btn--primary btn--lg">Subscribe</button>
      </div>
      <p class="form-hint">free preview first · cancel anytime · $12/mo to keep reading</p>
    </div>

  </div>
</section>
```

- [ ] **Step 2: Add masthead CSS** — append to `style.css`:

```css
/* ── Masthead / Hero ───────────────────────────────────────────────── */
.masthead-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
  align-items: center;
  margin-bottom: 16px;
}
.masthead-vertical {
  font-family: var(--cn);
  font-weight: 700;
  line-height: 1;
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0.15em;
  user-select: none;
}
.masthead-vertical--left {
  font-size: 32px;
  color: var(--accent);
}
.masthead-vertical--right {
  font-size: 26px;
  color: var(--ink-2);
  font-weight: 600;
}
.masthead-center { text-align: center; }
.masthead-eyebrow {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.masthead-week { color: var(--ink-2); }
.masthead-headline { margin: 8px auto 6px; max-width: 400px; }
.masthead-sub { max-width: 360px; margin: 0 auto 0; font-size: 13.5px; }

.masthead-strip { margin-top: 8px; }

.email-capture { margin-top: 0; }

@media (max-width: 520px) {
  .masthead-header {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: 12px;
  }
  .masthead-vertical--right { display: none; }
  .masthead-vertical--left { font-size: 26px; }
  .masthead-headline { font-size: 28px; }
  .row-form {
    grid-template-columns: 1fr;
  }
  .row-form .btn { width: 100%; }
}
```

- [ ] **Step 3: Verify in browser**

Reload. Expected: cream background, vertical Chinese text flanking centered headline, almanac strip with 3 cols, email+button row. On mobile: right Chinese text hidden, button stacks below input.

- [ ] **Step 4: Commit**

```bash
git add index.html style.css && git commit -m "feat: add almanac masthead hero with email capture"
```

---

## Task 6: Free Bazi Snapshot Section

**Files:**
- Modify: `index.html`, `style.css`

- [ ] **Step 1: Add snapshot HTML** — append after the masthead `</section>`, replacing `<!-- Task 6: snapshot -->`:

```html
<section class="section" id="snapshot">
  <div class="inner">
    <span class="eyebrow">Or try the free snapshot first</span>
    <div class="snapshot-card">
      <span class="eyebrow" style="font-size:9px;margin-bottom:10px">Your free bazi snapshot</span>
      <div class="form-grid">
        <div>
          <label class="input-label" for="dob">date of birth</label>
          <input class="input" id="dob" type="text" placeholder="1983 / 11 / 04" autocomplete="bday" />
        </div>
        <div>
          <label class="input-label" for="tob">time of birth</label>
          <input class="input" id="tob" type="text" placeholder="07:42 am" />
        </div>
        <div class="full">
          <label class="input-label" for="pob">place of birth</label>
          <input class="input" id="pob" type="text" placeholder="Kuala Lumpur, Malaysia" autocomplete="country-name" />
        </div>
        <div class="full">
          <label class="input-label" for="email-snap">email (so we can send the weekly)</label>
          <input class="input" id="email-snap" type="email" placeholder="you@somewhere.com" autocomplete="email" />
        </div>
      </div>
      <button class="btn btn--primary btn--lg btn--block snapshot-cta">
        Cast my pillars →
      </button>
      <p class="form-hint">free · 30 seconds · no card required</p>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add snapshot CSS** — append to `style.css`:

```css
/* ── Snapshot form card ────────────────────────────────────────────── */
.snapshot-card {
  border: 1.5px dashed var(--line-soft);
  padding: 18px;
  border-radius: 2px;
  background: rgba(0,0,0,0.015);
  margin-top: 10px;
}
.snapshot-cta { margin-top: 14px; }
```

- [ ] **Step 3: Commit**

```bash
git add index.html style.css && git commit -m "feat: add bazi snapshot form section"
```

---

## Task 7: How It Works Section

**Files:**
- Modify: `index.html`, `style.css`

- [ ] **Step 1: Add how-it-works HTML** — append after snapshot section, replacing `<!-- Task 7: how-it-works -->`:

```html
<section class="section" id="how">
  <div class="inner">
    <span class="eyebrow">How it works</span>
    <h2 class="headline headline--md">Four inputs, one weekly letter.</h2>
    <ol class="how-list">
      <li class="how-item">
        <div class="how-num" aria-hidden="true">1</div>
        <div class="how-body">
          <div class="how-title">Your bazi <span class="cn">四柱</span></div>
          <div class="how-desc">Four pillars cast from DOB + time + place. Once, forever yours.</div>
        </div>
      </li>
      <li class="how-item">
        <div class="how-num" aria-hidden="true">2</div>
        <div class="how-body">
          <div class="how-title">Where you live <span class="cn">地理</span></div>
          <div class="how-desc">Latitude shifts which palace Jupiter sits in. KL ≠ London.</div>
        </div>
      </li>
      <li class="how-item">
        <div class="how-num" aria-hidden="true">3</div>
        <div class="how-body">
          <div class="how-title">Weather + season <span class="cn">節氣</span></div>
          <div class="how-desc">Local conditions mapped to the 24 solar terms.</div>
        </div>
      </li>
      <li class="how-item">
        <div class="how-num" aria-hidden="true">4</div>
        <div class="how-body">
          <div class="how-title">Qimen calendar <span class="cn">奇門</span></div>
          <div class="how-desc">1,080 plates a year. Our indexed library is the moat.</div>
        </div>
      </li>
    </ol>
  </div>
</section>
```

- [ ] **Step 2: Add how-it-works CSS** — append to `style.css`:

```css
/* ── How it works ──────────────────────────────────────────────────── */
.how-list {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.how-item {
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 14px;
  align-items: flex-start;
}
.how-num {
  width: 26px; height: 26px;
  border: 1.5px solid var(--ink);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 500;
  flex-shrink: 0;
  margin-top: 1px;
}
.how-title {
  font-family: var(--display);
  font-size: 17px;
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -0.012em;
  margin-bottom: 3px;
}
.how-title .cn { font-size: 16px; margin-left: 4px; }
.how-desc {
  font-family: var(--body);
  font-size: 13px;
  color: var(--ink-2);
  line-height: 1.5;
}
```

- [ ] **Step 3: Commit**

```bash
git add index.html style.css && git commit -m "feat: add how-it-works section"
```

---

## Task 8: Why Taiyi Section

**Files:**
- Modify: `index.html`, `style.css`

- [ ] **Step 1: Add why-taiyi HTML** — append after how-it-works section, replacing `<!-- Task 8: why-taiyi -->`:

```html
<section class="section" id="why">
  <div class="inner">
    <span class="eyebrow">Why Taiyi</span>
    <h2 class="headline headline--md">Public-domain classics, not vibes.</h2>
    <p class="sub-headline">
      Every reading is sourced. We index six classical qimen texts — all pre-1929, all public domain — verse by verse, cross-referenced to your chart.
    </p>
    <div class="sources-table">
      <div class="sources-row sources-row--header">
        <div class="sources-title">Text</div>
        <div class="sources-date">Date</div>
      </div>
      <div class="sources-row">
        <div class="sources-title">
          <span class="cn sources-cn">奇門遁甲統宗</span>
          <span class="sources-py">Qímén Dùnjiǎ Tǒngzōng</span>
        </div>
        <div class="sources-date">1641</div>
      </div>
      <div class="sources-row">
        <div class="sources-title">
          <span class="cn sources-cn">烟波釣叟賦</span>
          <span class="sources-py">Yān Bō Diào Sǒu Fù</span>
        </div>
        <div class="sources-date">Tang dyn.</div>
      </div>
      <div class="sources-row">
        <div class="sources-title">
          <span class="cn sources-cn">紫白訣</span>
          <span class="sources-py">Zǐbái Jué</span>
        </div>
        <div class="sources-date">Song dyn.</div>
      </div>
      <div class="sources-row">
        <div class="sources-title">
          <span class="sources-cn" style="font-size:14px;color:var(--muted)">+ 3 sister texts</span>
          <span class="sources-py">indexed</span>
        </div>
        <div class="sources-date">—</div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add why-taiyi CSS** — append to `style.css`:

```css
/* ── Why Taiyi / sources table ─────────────────────────────────────── */
.sources-table { margin-top: 12px; }
.sources-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  padding: 7px 0;
  border-top: 1px dashed var(--line-very-soft);
  align-items: baseline;
}
.sources-row--header {
  border-top: 1px solid var(--line-soft);
  border-bottom: none;
  padding: 0 0 6px;
}
.sources-row--header .sources-title,
.sources-row--header .sources-date {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}
.sources-cn {
  font-family: var(--cn);
  font-size: 15px;
  font-weight: 600;
  display: inline;
}
.sources-py {
  font-family: var(--body);
  font-size: 11.5px;
  color: var(--muted);
  font-style: italic;
  margin-left: 8px;
}
.sources-date {
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--muted);
  white-space: nowrap;
}
```

- [ ] **Step 3: Commit**

```bash
git add index.html style.css && git commit -m "feat: add why-taiyi sources section"
```

---

## Task 9: Sample Newsletter Section

**Files:**
- Modify: `index.html`, `style.css`

This section shows a realistic mini-newsletter preview with: header (issue number + title + stamp), personalization info, 3-col data strip (solar term · qimen · local weather), 5-day 宜/忌 table, and a classical quote block.

- [ ] **Step 1: Add sample newsletter HTML** — append after why-taiyi section, replacing `<!-- Task 9: sample newsletter -->`:

```html
<section class="section section--tinted" id="sample">
  <div class="inner">
    <span class="eyebrow">Last Sunday's letter</span>
    <h2 class="headline headline--md">This is what lands in your inbox.</h2>

    <div class="nl-preview" aria-label="Sample newsletter issue 47">

      <!-- Newsletter header -->
      <div class="nl-header">
        <div class="nl-header-left">
          <div class="nl-issue">Taiyi · Issue 47 · May 17</div>
          <div class="nl-title">The week the <span class="cn">天輔</span> opens.</div>
        </div>
        <span class="stamp" aria-hidden="true">太</span>
      </div>

      <!-- Personalization line -->
      <div class="nl-personalization">
        For Jessica · Yang Fire day master · KL · 3.1°N
      </div>

      <!-- Intro placeholder lines -->
      <div class="nl-lines">
        <div class="nl-ph nl-ph--long"></div>
        <div class="nl-ph nl-ph--long"></div>
        <div class="nl-ph nl-ph--med"></div>
      </div>

      <!-- 3-col data strip -->
      <div class="nl-data-strip">
        <div class="nl-data-cell">
          <div class="nl-data-label">SOLAR TERM</div>
          <div class="nl-data-main cn" style="font-weight:600;font-size:18px;line-height:1">立夏</div>
          <div class="nl-data-sub">Lìxià</div>
        </div>
        <div class="nl-data-cell">
          <div class="nl-data-label">QIMEN</div>
          <div class="nl-data-main" style="font-family:var(--mono);font-size:15px">№427</div>
          <div class="nl-data-sub">of 1080</div>
        </div>
        <div class="nl-data-cell">
          <div class="nl-data-label">KL TODAY</div>
          <div class="nl-data-main" style="font-size:13px">27° monsoon</div>
          <div class="nl-data-sub">east clear</div>
        </div>
      </div>

      <!-- Day-by-day table -->
      <div class="nl-days" role="table" aria-label="Weekly almanac">
        <div class="nl-day" role="row">
          <div class="nl-day-date" role="cell"><span class="nl-day-name">Mon</span><span class="nl-day-num">18</span></div>
          <div class="nl-day-good" role="cell"><span class="cn nl-yj">宜</span>sign contracts before noon</div>
          <div class="nl-day-bad" role="cell"><span class="cn nl-yj">忌</span>west mtgs after 3pm</div>
        </div>
        <div class="nl-day" role="row">
          <div class="nl-day-date" role="cell"><span class="nl-day-name">Tue</span><span class="nl-day-num">19</span></div>
          <div class="nl-day-good" role="cell"><span class="cn nl-yj">宜</span>ask the hard question</div>
          <div class="nl-day-bad" role="cell"><span class="cn nl-yj">忌</span>moving money north</div>
        </div>
        <div class="nl-day" role="row">
          <div class="nl-day-date" role="cell"><span class="nl-day-name">Wed</span><span class="nl-day-num">20</span></div>
          <div class="nl-day-good" role="cell"><span class="cn nl-yj">宜</span>edit, don't ship</div>
          <div class="nl-day-bad" role="cell"><span class="cn nl-yj">忌</span>first dates</div>
        </div>
        <div class="nl-day" role="row">
          <div class="nl-day-date" role="cell"><span class="nl-day-name">Thu</span><span class="nl-day-num">21</span></div>
          <div class="nl-day-good" role="cell"><span class="cn nl-yj">宜</span>travel south + southeast</div>
          <div class="nl-day-bad" role="cell"><span class="cn nl-yj">忌</span>dentist if you can</div>
        </div>
        <div class="nl-day" role="row">
          <div class="nl-day-date" role="cell"><span class="nl-day-name">Fri</span><span class="nl-day-num">22</span></div>
          <div class="nl-day-good" role="cell"><span class="cn nl-yj">宜</span>public-facing day</div>
          <div class="nl-day-bad" role="cell"><span class="cn nl-yj">忌</span>—</div>
        </div>
      </div>

      <!-- Classical source quote -->
      <blockquote class="nl-quote">
        天輔之星，主文書、文章、考試、求名、出行、見貴。
      </blockquote>
      <div class="nl-source">
        — 烟波釣叟賦
        <span class="nl-source-note">(Yān Bō Diào Sǒu Fù, Tang dynasty, public domain)</span>
      </div>

    </div>
  </div>
</section>
```

- [ ] **Step 2: Add newsletter CSS** — append to `style.css`:

```css
/* ── Newsletter preview ────────────────────────────────────────────── */
.nl-preview {
  border: 1.5px solid var(--ink);
  background: color-mix(in srgb, var(--paper) 80%, white);
  padding: 18px;
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.45;
  font-family: var(--body);
}

/* Header row */
.nl-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 10px;
}
.nl-issue {
  font-family: var(--mono);
  font-size: 9px;
  color: var(--muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 3px;
}
.nl-title {
  font-family: var(--display);
  font-size: 20px;
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.018em;
  color: var(--ink);
}

/* Personalization */
.nl-personalization {
  font-family: var(--mono);
  font-size: 8.5px;
  color: var(--muted);
  margin-bottom: 8px;
  letter-spacing: 0.04em;
}

/* Placeholder lines */
.nl-lines { margin-bottom: 10px; }
.nl-ph {
  height: 5px;
  background: var(--line-very-soft);
  border-radius: 3px;
  margin: 4px 0;
}
.nl-ph--long { width: 95%; }
.nl-ph--med { width: 70%; }

/* Data strip inside newsletter */
.nl-data-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  background: var(--paper-2);
  border: 1px dashed var(--line-very-soft);
  padding: 8px;
  margin-bottom: 10px;
  font-size: 8px;
}
.nl-data-label {
  font-family: var(--mono);
  font-size: 7.5px;
  color: var(--muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 2px;
}
.nl-data-main { line-height: 1.2; margin-bottom: 1px; }
.nl-data-sub { font-size: 8.5px; color: var(--ink-2); }

/* Day rows */
.nl-days { border-top: 1px solid var(--line-soft); }
.nl-day {
  display: grid;
  grid-template-columns: 36px 1fr 1fr;
  gap: 10px;
  padding: 5px 0;
  border-top: 1px dashed var(--line-very-soft);
  font-size: 9.5px;
  align-items: start;
}
.nl-day:first-child { border-top: none; }
.nl-day-date {
  display: flex;
  flex-direction: column;
  font-family: var(--mono);
  color: var(--muted);
}
.nl-day-name { font-size: 8px; }
.nl-day-num {
  font-family: var(--display);
  font-size: 16px;
  color: var(--ink);
  line-height: 1.1;
}
.nl-day-good { color: var(--ink-2); }
.nl-day-bad { color: var(--muted); }
.nl-yj { font-size: 12px; margin-right: 3px; }
.nl-day-good .nl-yj { color: var(--accent); }

/* Quote block */
.nl-quote {
  margin: 12px 0 0;
  padding-left: 10px;
  border-left: 2px solid var(--accent);
  font-family: var(--cn);
  font-size: 13px;
  line-height: 1.55;
  color: var(--ink);
}
.nl-source {
  font-size: 9.5px;
  color: var(--muted);
  font-style: italic;
  margin-top: 4px;
  font-family: var(--body);
}
.nl-source-note { font-style: normal; }

@media (max-width: 480px) {
  .nl-day { grid-template-columns: 32px 1fr; }
  .nl-day-bad { display: none; }
  .nl-data-strip { grid-template-columns: 1fr 1fr; }
  .nl-data-strip > *:last-child { display: none; }
}
```

- [ ] **Step 3: Commit**

```bash
git add index.html style.css && git commit -m "feat: add sample newsletter preview section"
```

---

## Task 10: Pricing Section

**Files:**
- Modify: `index.html`, `style.css`

- [ ] **Step 1: Add pricing HTML** — append after newsletter section, replacing `<!-- Task 10: pricing -->`:

```html
<section class="section" id="pricing">
  <div class="inner">
    <span class="eyebrow">Pricing</span>

    <div class="pricing-card">
      <div class="pricing-top">
        <div class="pricing-amount">
          $12<span class="pricing-period">/ month</span>
        </div>
        <span class="stamp stamp--lg" aria-hidden="true">月</span>
      </div>
      <p class="pricing-desc">
        One letter, Sunday morning local. Your snapshot stays free.
        Cancel anytime — your data is deleted within 7 days.
      </p>
      <ul class="pricing-features">
        <li>Weekly localized fengshui letter</li>
        <li>Day-by-day <span class="cn">宜</span> / <span class="cn">忌</span> (do&thinsp;/&thinsp;don't)</li>
        <li>Source-cited classical quotes</li>
        <li>Annual luck-pillar update (Lunar New Year)</li>
      </ul>
      <button class="btn btn--primary btn--lg btn--block">Start — $12 / month</button>
    </div>

  </div>
</section>
```

- [ ] **Step 2: Add pricing CSS** — append to `style.css`:

```css
/* ── Pricing ───────────────────────────────────────────────────────── */
.pricing-card {
  border: 2px solid var(--ink);
  padding: 20px;
  margin-top: 10px;
  background: color-mix(in srgb, var(--paper) 70%, white);
  position: relative;
}
.pricing-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.pricing-amount {
  font-family: var(--display);
  font-size: 44px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.025em;
}
.pricing-period {
  font-size: 16px;
  color: var(--muted);
  margin-left: 4px;
  letter-spacing: 0;
}
.pricing-desc {
  font-family: var(--body);
  font-size: 13px;
  color: var(--ink-2);
  line-height: 1.55;
  margin: 0 0 12px;
}
.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
}
.pricing-features li {
  font-family: var(--body);
  font-size: 12.5px;
  color: var(--ink-2);
  line-height: 1.6;
  padding-left: 14px;
  position: relative;
}
.pricing-features li::before {
  content: '–';
  position: absolute;
  left: 0;
  color: var(--muted);
}
```

- [ ] **Step 3: Commit**

```bash
git add index.html style.css && git commit -m "feat: add pricing section"
```

---

## Task 11: FAQ Accordion Section

**Files:**
- Modify: `index.html`, `style.css`
- Create: `script.js`

- [ ] **Step 1: Add FAQ HTML** — append after pricing section, replacing `<!-- Task 11: faq -->`:

```html
<section class="section" id="faq">
  <div class="inner">
    <span class="eyebrow">Skeptics first · FAQ</span>
    <div class="faq-list">

      <details class="faq-item">
        <summary class="faq-question">Isn't this just astrology? How is it different?</summary>
        <div class="faq-answer">
          <p>Astrology (western) maps planets to a fixed zodiac. Bazi (四柱命理) is a Chinese calendrical system that maps the specific five-element composition at your birth date and time to heavenly stems and earthly branches — a different calculus entirely. Qimen (奇門遁甲) is a tactical calendar, not a personality read. The practical difference: we tell you which direction to avoid for an important meeting this Thursday, not what your rising sign says about your relationship style.</p>
        </div>
      </details>

      <details class="faq-item">
        <summary class="faq-question">Why not just ask DeepSeek for the same thing?</summary>
        <div class="faq-answer">
          <p>You can, but you'll get a generic response that doesn't know what qimen plate is active right now, doesn't know your local weather, and doesn't cite a source. Taiyi cross-references your pillar to a specific indexed verse in a classical text, adds real geolocation, and delivers it Sunday morning so you can actually use it.</p>
        </div>
      </details>

      <details class="faq-item">
        <summary class="faq-question">What happens to my date-of-birth data? (PDPA / PDPL)</summary>
        <div class="faq-answer">
          <p>Your date of birth and birth time are used only to calculate your four pillars — they are stored encrypted and never shared or sold. You can request deletion at any time; your data is purged within 7 days. We comply with Singapore PDPA 2012 and Malaysia PDPA 2010. Delete button is in your account settings.</p>
        </div>
      </details>

      <details class="faq-item">
        <summary class="faq-question">Who is writing the readings — an AI or a master?</summary>
        <div class="faq-answer">
          <p>The readings are AI-generated, cross-referenced against an indexed library of classical qimen texts (all pre-1929, all public domain). We don't pretend otherwise. The value is in the sourcing discipline and the calendrical accuracy, not a human signature. A practitioner review tier is planned for 2027.</p>
        </div>
      </details>

      <details class="faq-item">
        <summary class="faq-question">Can I cancel? Will you keep emailing me?</summary>
        <div class="faq-answer">
          <p>Cancel any time from your account page — one click, no form, no retention email. The subscription stops immediately. We send only what you signed up for: one letter per Sunday and, if you opt in, a Lunar New Year luck-pillar update. No upsells, no notifications, no ads.</p>
        </div>
      </details>

    </div>
  </div>
</section>
```

- [ ] **Step 2: Add FAQ CSS** — append to `style.css`:

```css
/* ── FAQ accordion ─────────────────────────────────────────────────── */
.faq-list { margin-top: 6px; }
.faq-item {
  border-top: 1px dashed var(--line-very-soft);
}
.faq-item:first-child { border-top: 1px solid var(--line-soft); }
.faq-question {
  display: grid;
  grid-template-columns: 1fr 20px;
  gap: 10px;
  align-items: center;
  padding: 12px 0;
  font-family: var(--body);
  font-size: 13.5px;
  color: var(--ink-2);
  cursor: pointer;
  list-style: none;
  user-select: none;
}
.faq-question::-webkit-details-marker { display: none; }
.faq-question::after {
  content: '+';
  font-family: var(--mono);
  font-size: 16px;
  color: var(--muted);
  text-align: right;
  transition: transform .2s;
  display: block;
}
details[open] .faq-question::after {
  content: '−';
}
.faq-answer {
  padding: 0 0 14px;
  animation: faq-open .2s ease;
}
.faq-answer p {
  font-family: var(--body);
  font-size: 13px;
  color: var(--ink-2);
  line-height: 1.65;
  margin: 0;
  max-width: 560px;
}
@keyframes faq-open {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 3: Create script.js** (smooth scroll only — `<details>` handles accordion natively):

```javascript
// Smooth scroll for nav anchor links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
```

- [ ] **Step 4: Commit**

```bash
git add index.html style.css script.js && git commit -m "feat: add FAQ accordion section and smooth scroll"
```

---

## Task 12: Footer

**Files:**
- Modify: `index.html`, `style.css`

- [ ] **Step 1: Add footer HTML** — replace the empty `<footer class="site-footer">` body with:

```html
<footer class="site-footer">
  <div class="footer-inner">
    <span class="footer-brand">Taiyi · <span class="cn" style="font-size:13px">太乙</span> · SG / MY · 2026</span>
    <div class="footer-links">
      <a href="/privacy">privacy</a>
      <a href="/delete">delete my data</a>
      <a href="/contact">contact</a>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Add footer CSS** — append to `style.css`:

```css
/* ── Footer ────────────────────────────────────────────────────────── */
.site-footer {
  background: var(--paper-2);
  border-top: 1px dashed var(--line-soft);
  padding: 16px var(--pad-x);
}
.footer-inner {
  max-width: var(--max-w);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.footer-brand {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 0.06em;
}
.footer-links {
  display: flex;
  gap: 16px;
}
.footer-links a {
  font-family: var(--mono);
  font-size: 10px;
  color: var(--muted);
  text-decoration: none;
  letter-spacing: 0.04em;
}
.footer-links a:hover { color: var(--ink); }
@media (max-width: 420px) {
  .footer-inner { flex-direction: column; align-items: flex-start; gap: 8px; }
}
```

- [ ] **Step 3: Commit**

```bash
git add index.html style.css && git commit -m "feat: add footer"
```

---

## Task 13: Responsive Polish Pass

**Files:**
- Modify: `style.css`

This task adds the remaining mobile breakpoints and any polish that makes the page feel right on a 375px iPhone screen.

- [ ] **Step 1: Append remaining responsive rules** to `style.css`:

```css
/* ── Responsive polish ─────────────────────────────────────────────── */

/* Stack pricing button text on very small screens */
@media (max-width: 360px) {
  .pricing-amount { font-size: 36px; }
  .headline--lg { font-size: 28px; }
}

/* Ensure nav logo doesn't overflow */
@media (max-width: 360px) {
  .nav-logo { font-size: 17px; }
}

/* Newsletter day table: hide "bad" column on tiny screens (already set in Task 9)
   This rule handles medium phones where it should still be visible */
@media (min-width: 481px) and (max-width: 600px) {
  .nl-day { font-size: 8.5px; }
  .nl-day-date { min-width: 28px; }
}

/* Prevent horizontal overflow */
body { overflow-x: hidden; }
img, video, iframe { max-width: 100%; }
```

- [ ] **Step 2: Test on mobile viewport**

In Chrome DevTools (or Safari), switch to iPhone 14 Pro (390×844). Walk through:
- [ ] Nav bar: logo visible, links hidden, no overflow
- [ ] Masthead: right Chinese text hidden, button stacks below input, headline readable
- [ ] Snapshot form: 2-col collapses to 1-col on small screens
- [ ] Newsletter: day table readable, data strip shows 2 of 3 cells
- [ ] Pricing: card fills width cleanly
- [ ] FAQ: question text wraps without overflow
- [ ] Footer: stacks vertically

- [ ] **Step 3: Commit**

```bash
git add style.css && git commit -m "fix: responsive polish pass for mobile"
```

---

## Task 14: Final Integration Check & Memory Save

**Files:**
- No code changes

- [ ] **Step 1: Full page review checklist**

Open `index.html` in browser. Verify each item:
- [ ] All 9 sections render in order: nav → masthead → snapshot → how → why → sample → pricing → faq → footer
- [ ] Sticky nav doesn't cover section headings on anchor scroll (add `scroll-margin-top: 64px` to all `section` and `footer` elements if needed)
- [ ] Stamp "太" appears correctly in nav and newsletter header (Noto Serif SC loaded)
- [ ] Chinese characters in masthead (太乙, 壬寅日), FAQ answers, and newsletter quote all render correctly
- [ ] IBM Plex Mono renders for all monospace/eyebrow text
- [ ] Email input accepts typing, focuses with red border
- [ ] FAQ accordion opens/closes all 5 items cleanly
- [ ] Smooth scroll works for all 4 nav links
- [ ] No horizontal scrollbar at any viewport width

- [ ] **Step 2: Fix scroll-margin if needed** — add to `style.css`:

```css
/* Offset sticky nav height for anchor scroll */
section[id], footer[id] {
  scroll-margin-top: 60px;
}
```

- [ ] **Step 3: Final commit**

```bash
git add -A && git commit -m "feat: taiyi almanac landing page complete"
```

---

## Design Requirements Summary (for handoff)

Any agent picking this up mid-task should know:

| Requirement | Detail |
|---|---|
| **Design source** | `/tmp/taiyi/project/wireframes.jsx` — `WireAlmanac` component |
| **Palette** | Cream: `--paper #f4eee0`, `--seal #b83828`, `--ink #1a1612` |
| **Display font** | Newsreader (Google Fonts, `opsz` variable, wght 300-700) |
| **Body font** | Inter Tight (Google Fonts, wght 400-600) |
| **Chinese font** | Noto Serif SC (Google Fonts, wght 500-900) |
| **Mono font** | IBM Plex Mono (Google Fonts, wght 400-500) |
| **Border radius** | 2px everywhere (buttons, inputs, cards, stamps) |
| **Buttons** | 2px offset box-shadow bottom-right (`2px 2px 0 0`) |
| **Section divider** | `1px dashed var(--line-soft)` |
| **Max content width** | 680px, centered |
| **Mobile breakpoint** | 640px (section padding), 520px (masthead), 480px (newsletter) |
| **Copy** | All copy is in the HTML tasks above — do not change wording |
| **Sections in order** | nav, masthead, snapshot, how-it-works, why-taiyi, newsletter, pricing, faq, footer |
| **No JS framework** | Vanilla JS only, `<details>` for FAQ native accordion |
| **No build step** | Plain HTML/CSS/JS files, open directly in browser |
