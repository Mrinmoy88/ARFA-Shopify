# Architecture note

## Structure, and why

Each of the three Test 1 components is its own section with its own schema,
its own `section-*.css`, and (where it needs behaviour) its own `*.js`
custom element — because the brief requires them to be addable, removable,
and reorderable independently in the theme editor, not shipped as one fixed
block. What *is* shared lives in exactly one place:
`component-test1-shared.css` holds the design tokens (colours, font stacks)
and the one repeated UI primitive (the pill CTA button), and
`test1-fonts.liquid` is the single Google Fonts include all four sections
render (the browser only fetches it once, since the URL is identical every
time). Everything else — layout, copy, imagery — is deliberately kept
per-section, because collapsing three visually unrelated components into
one shared stylesheet is exactly how unrelated sections start fighting over
class names six months later.

Test 2 is a snippet, not a section-only block, on purpose: the brief asks
for a card that "can be dropped into any grid, not hard-wired to one page,"
so `product-card-swatch.liquid` takes only `card_product` and a few
settings as parameters and knows nothing about the grid section that calls
it — the same relationship Dawn's own `card-product.liquid` has with
`main-collection-product-grid.liquid`. Wherever Dawn already solves a
problem — cart add/update via `global.js`'s `fetchConfig`, `pubsub.js`'s
`publish`/`PUB_SUB_EVENTS`, and `cart-notification`/`cart-drawer`'s
`renderContents`; colour swatches via the native option-value swatch
metafield; the newsletter via `{% form 'customer' %}` — this build reuses
it instead of adding a second, competing way to do the same thing.

## What I'd standardise for three developers working in parallel

- **File naming**, matching the convention already in this repo:
  `section-<name>.css` for styles used by exactly one section,
  `component-<name>.css` for anything shared by two or more, one custom
  element per `<name>.js` file. A developer who's only ever touched Dawn
  should be able to guess where a new component's files go without asking.
- **One CSS class prefix and custom-property prefix per feature area**
  (`test1-*`, `test2-*` here), all defined once in the shared tokens file.
  This is the single biggest source of collisions when three people ship in
  parallel — someone will eventually reach for `.card` or `--color-ink`,
  and if two features both did that independently, the last one to merge
  wins by accident. A prefix per feature makes that impossible instead of
  relying on code review to catch it.
- **One custom element per file**, each guarded with
  `customElements.get('x') || customElements.define(...)` — already Dawn's
  own pattern — so re-renders from the theme editor never throw on
  double-registration, and two developers editing different components
  never touch the same JS file.
- **Cross-cutting concerns stay in Dawn's existing globals**
  (`fetchConfig`, `publish`/`subscribe`, `routes`, `PUB_SUB_EVENTS`) instead
  of each new component rolling its own fetch wrapper or event bus. One
  source of truth for "how do I add to cart" means three developers'
  add-to-cart code stays interchangeable instead of diverging.
- **Every snippet gets Dawn's own Accepts/Usage comment header.** It's a
  small thing, but it's the difference between a developer reading a
  snippet's internals to know how to call it, and just reading four lines
  at the top — worth enforcing everywhere, not just where it's convenient.
- **Settings schema is merchant language, and any "magic" data convention
  is documented in the setting's own `info` text** (the badge tag names,
  the countdown date format), not in a README a merchant will never open.
  That's also the cheapest insurance against a developer three months from
  now inventing a second, incompatible tag convention for the same badge.

## What I'd push back on before it reached a developer

1. **The Hero's "Reviews" tab has no defined destination.** It reads as a
   toggle (there's an `aria-expanded` in the original markup) but nothing
   in the file says what it expands — a reviews app drawer, an on-page
   anchor, something else. That's a different build depending on the
   answer, so I'd ask before estimating it rather than guessing. I shipped
   it as a real, configurable link so it's genuinely functional either way.
2. **The countdown has no Seconds group.** For a live "drop" countdown,
   visitors will stare at an unchanging Minutes tile for up to 59 seconds
   with nothing on screen confirming time is moving. I'd confirm that's
   actually the intended, calmer read before a developer builds it — it's
   an easy thing to add later, but worth a deliberate yes rather than an
   assumption.
3. **Clearance / Final Sale have no defined data source.** The layers exist
   in the file but nothing says how a merchant is meant to mark a product
   as either one in Shopify admin — there's no native field for it. That's
   a data-modelling decision (tags vs. metafields vs. a collection), not a
   styling one, and it changes how support/ops teams manage it later. I'd
   raise it before a developer picks one unilaterally — I went with tags,
   with the tag names configurable in the section, but a merchant with an
   existing tag taxonomy might prefer metafields instead.
4. **No documented interaction pattern for the swatch row.** Is it a radio
   group, a set of toggle buttons, something with its own focus-management
   spec? Three developers asked to build "colour swatches" independently
   will produce three different keyboard/screen-reader behaviours unless
   that's written down once. I'd want that decided centrally rather than
   discovered as an inconsistency during QA.
