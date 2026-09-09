# Test 1 & Test 2 — Dawn theme build

This is stock Shopify **Dawn** with one addition: the sections, snippets, and
assets listed below, built from the Figma file (`Test 1` and `Test 2`
frames). Nothing in Dawn itself was modified — everything new is additive
and namespaced so it can be told apart from Dawn's own files at a glance.

## What was added

```
sections/
  test1-hero.liquid            Test 1.1 — Hero
  test1-drop-teaser.liquid     Test 1.2 — Drop teaser (countdown + email capture)
  test1-display-text.liquid    Test 1.3 — Display text (image-filled letterforms)
  test2-product-grid.liquid    Test 2 — collection grid that renders the card below

snippets/
  product-card-swatch.liquid   Test 2 — the reusable product card itself
  test1-fonts.liquid           shared Google Fonts <link>, rendered by all four sections above

assets/
  component-test1-shared.css        shared design tokens + pill button, used by all Test 1 sections
  section-test1-hero.css
  section-test1-drop-teaser.css
  section-test1-display-text.css
  component-product-card-swatch.css
  test1-countdown.js                 <countdown-timer> custom element
  product-card-swatch.js             <product-card-swatch> / <product-card-quick-add> custom elements
  test1-hero-bg.jpg, test1-hero-wordmark.svg,
  test1-drop-pattern.png, test1-drop-right.jpg,
  test1-display-text-fill.jpg        default images (exported from Figma, optimised for web),
                                      used only when a merchant hasn't picked their own image

templates/index.json             updated so all four sections render on the home page
```

Everything above is a normal Shopify section/snippet/asset — nothing needs
build tooling, and `shopify theme dev` / `shopify theme push` work as-is.

## Seeing both tests

All four sections are already on the home page (`templates/index.json`), in
the order Hero → Drop teaser → Display text → Product grid, so the home page
*is* the one page the brief asks for. Each section is also independently
addable/removable/reorderable from the theme editor — they don't depend on
one another.

For the Product grid to show anything meaningful, point its **Collection**
setting at a collection containing test products that cover the states
below (the section falls back to "All products" if left empty).

## Test data you'll want in the store

To see every state the grid handles, add products covering:

- A product with a **Color** option with 1 value, and one with **12** values (swatch overflow → "+N").
- A product that's **entirely sold out**, and a product with **one sold-out colour** among available ones (that swatch is disabled, the rest work).
- A product with **no compare-at price**, and one with a **compare-at price** higher than its price (shows the "was" price).
- A product tagged `clearance` and one tagged `final-sale` (both tag names are editable in the section's schema, under "Badges").
- A product with a **very long title** (clamps to 2 lines) and one with **no image** ("Image coming soon" placeholder).
- A product with a **vendor** set and one without — the vendor line only renders when the data has one.

## Judgment calls worth knowing about

The Figma file was the spec, but a few things needed a real decision rather
than a literal reading:

- **Countdown units.** The drop teaser countdown shows **Days : Hours :
  Minutes** (two-digit tiles), with no Seconds group. The frame's tile
  layout only really supports three groups at that spacing, and a
  once-a-second-ticking tile felt at odds with the calm, editorial tone of
  the rest of the section — so I built the version that reads well and
  actually finishes counting down, and I'm flagging the omission here rather
  than leaving it to be found. At zero, the countdown hides and an "ended"
  message shows in its place; optionally a merchant can also set a button +
  collection to give the ended state a real call to action.
- **No native date/time setting in Shopify.** Theme settings schema has no
  date-time picker, so the countdown target is a text field
  (`YYYY-MM-DDTHH:MM`, documented inline in the setting). One real
  limitation worth knowing: the initial (no-JS) render is computed in
  Liquid using the **shop's** timezone, while the live countdown ticks in
  the **visitor's browser** timezone — for stores whose customers are far
  from the shop's own timezone this can show a brief, small offset before
  JS takes over on first paint. This is an inherent trade-off of not having
  a first-class datetime setting type, not a bug in the countdown math.
- **Hero "Reviews" tab.** Nothing in the file defines what this opens (no
  reviews app is in scope for this assignment), so rather than ship a fake
  button that does nothing, it's a real `<a>` that a merchant points at
  their reviews app or an on-page anchor via the section's "Reviews tab
  link" setting. It can also be turned off entirely, per the brief.
- **Display text: image fill only, no video.** The brief's own
  "merchant-editable" list for this component only lists "the text itself
  and the fill image," so that's what's built: a real, selectable `<h2>`
  painted with `background-clip: text` against a merchant-editable image.
  Browsers without `background-clip: text` support get the same real text
  in a solid ink colour via an `@supports` fallback — the text is never
  invisible either way.
- **Clearance / Final sale badges.** Shopify has no native field for
  either, so both are **product-tag driven** (tag names are editable in the
  Product grid section settings, defaulting to `clearance` / `final-sale`).
  Sold out always wins over both when a product has no available variants.
- **Swatch colours use Shopify's native option-value swatches** (the
  colour-pattern metafield you configure under Settings → Custom data /
  option values) when present, and fall back to a neutral grey dot when a
  merchant hasn't configured one — swatches are never wired to hardcoded
  hex values.
- **Newsletter form.** The email capture is a genuine `{% form 'customer' %}`
  posting to Shopify's own `/contact` endpoint (the same mechanism Dawn's
  own newsletter block uses) — not a JSON/AJAX shim, because Shopify's
  customer form has no JSON endpoint the way `/cart/add.js` does. Shopify
  redirects back to this same page after submitting, and the section
  renders the real success/error state from `form.posted_successfully?` /
  `form.errors` — genuinely working, just a full navigation rather than a
  fetch call.
- **Swatch buttons use `aria-pressed`,** not a native radio group, since the
  card has no wrapping `<form>` around just the swatches. They're fully
  keyboard operable and labelled with the colour name; a native
  `role="radiogroup"` would be the more textbook pattern if this card ever
  grows a real form around it.

## Fonts

Read directly from the Figma file — Prata, Playfair Display (italic),
Caveat, Inter, and DM Mono. All five are free, web-licensed Google Fonts, so
no substitution was necessary. They're loaded from a single shared snippet
(`test1-fonts.liquid`) so the four sections above only ever trigger one
network request between them.

## Responsive behaviour

The Figma file is desktop-only (1440px), so breakpoints below are a
deliberate call, not a literal spec:

- **749px** is the single breakpoint used throughout (matches Dawn's own
  mobile/desktop split, so it stays consistent with the rest of the theme
  rather than introducing a second breakpoint system).
- **Hero** and **Drop teaser** are built on `aspect-ratio`, so they scale
  fluidly at every width down to 749px, then switch to a taller mobile
  aspect ratio and stack the Drop teaser's two panels vertically below it.
- **Display text** scales its font-size with `clamp()` the whole way down —
  no breakpoint needed.
- **Product grid** uses `grid-template-columns: repeat(auto-fill,
  minmax(214px, 1fr))`, so it reflows the column count continuously at
  every width instead of jumping at fixed breakpoints — a 320px phone shows
  1 column, a tablet shows 2–3, desktop shows as many 214px cards as fit.

## Accessibility

Keyboard-reachable interactive elements throughout (swatches, quick add,
reviews link, notify form), visible `:focus-visible` states, meaningful
`alt` text (empty/decorative where an image is purely atmospheric and the
real heading already conveys the content), sensible heading order (one
`<h1>` in the Hero, `<h2>`/`<h3>` elsewhere), and `prefers-reduced-motion`
is honoured by wrapping every non-essential `transition` in a
`(prefers-reduced-motion: no-preference)` query.

## Theme check

`shopify theme check` passes with **0 errors**. The remaining warnings are
all pre-existing in stock Dawn 16.0.0 (`UndefinedObject` on
`scheme_classes`/`continue`/etc., a couple of `UnusedAssign`s, two
`VariableName` casing notices) and are unrelated to anything added here.

## What's not finished / out of scope

- The Hero's "Reviews" tab is a real link with no destination wired up (see
  judgment calls above) — a merchant needs to point it at whatever reviews
  app they install.
- No automated test suite; this was verified with `shopify theme check`,
  manual review against the Figma file, and by reasoning through the
  documented data cases in Liquid.
