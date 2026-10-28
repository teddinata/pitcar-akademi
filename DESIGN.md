---
name: Akademi Pitcar
description: Internal LMS and competency assessment for the Pitcar workshop network; a frosted-glass workspace by default, and a scoped "lembar ujian" answer-sheet world for participant competency tests.
colors:
  pitcar-red: "#b70000"
  merah-tua: "#8f0000"
  merah-muda: "#fde8e8"
  ink: "#141414"
  ink-soft: "#3a3a3a"
  paper: "#ffffff"
  grid-paper: "#f2f6fd"
  grid-line: "#dbe5f5"
  ruled-line: "#c9d6ee"
  stabilo: "#ffe14d"
  stabilo-wash: "#fffbe0"
  stabilo-fill: "#fff6bf"
  biru-pulpen: "#1d4ed8"
  hijau: "#0f7a43"
  hijau-muda: "#dcf3e6"
  glass-base: "#f4f5f5"
  glass-red-bright: "#e01414"
  glass-text: "#334155"
  glass-pill-text: "#475569"
  app-bg: "#f3f4f6"
  gray-900: "#111827"
  gray-500: "#6b7280"
typography:
  ujian-display:
    fontFamily: "'Bricolage Grotesque Variable', 'Poppins', system-ui, sans-serif"
    fontSize: "1.85rem"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  ujian-headline:
    fontFamily: "'Bricolage Grotesque Variable', 'Poppins', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  ujian-title:
    fontFamily: "'Bricolage Grotesque Variable', 'Poppins', system-ui, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 700
    lineHeight: 1.375
    letterSpacing: "-0.015em"
  ujian-numeral:
    fontFamily: "'Bricolage Grotesque Variable', 'Poppins', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.1
    fontFeature: "tnum"
  body:
    fontFamily: "'Poppins', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "'Poppins', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.33
  button:
    fontFamily: "'Poppins', sans-serif"
    fontSize: "0.9rem"
    fontWeight: 700
    lineHeight: 1.1
  glass-label:
    fontFamily: "'Poppins', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
rounded:
  check: "6px"
  stamp: "10px"
  control: "12px"
  sheet: "14px"
  pill: "999px"
  glass-control: "0.9rem"
  glass-card-sm: "1rem"
  glass-card: "1.25rem"
spacing:
  grid-cell: "24px"
  option-gap: "10px"
  card: "16px"
  card-lg: "24px"
components:
  ujian-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "{spacing.card}"
  ujian-button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0.55rem 1.1rem"
    height: "44px"
  ujian-button-hover:
    backgroundColor: "#f4f4f4"
  ujian-button-merah:
    backgroundColor: "{colors.pitcar-red}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0.55rem 1.1rem"
    height: "44px"
  ujian-button-merah-hover:
    backgroundColor: "{colors.merah-tua}"
  ujian-button-hitam:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0.55rem 1.1rem"
    height: "44px"
  ujian-button-besar:
    rounded: "{rounded.sheet}"
    padding: "0.8rem 1.4rem"
    height: "56px"
  ujian-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.15rem 0.6rem"
  ujian-chip-kuning:
    backgroundColor: "{colors.stabilo}"
  ujian-chip-merah:
    backgroundColor: "{colors.merah-muda}"
    textColor: "{colors.merah-tua}"
  ujian-chip-hijau:
    backgroundColor: "{colors.hijau-muda}"
    textColor: "{colors.hijau}"
  ujian-nomor:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.ujian-numeral}"
    rounded: "{rounded.stamp}"
    size: "2.6rem"
  ujian-bubble:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.pitcar-red}"
    rounded: "{rounded.pill}"
    size: "2.25rem"
  ujian-bubble-filled:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  ujian-opsi:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.8rem 0.9rem"
    width: "100%"
  ujian-opsi-hover:
    backgroundColor: "{colors.stabilo-wash}"
  ujian-opsi-filled:
    backgroundColor: "{colors.stabilo-fill}"
  ujian-ljk:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.pitcar-red}"
    rounded: "{rounded.pill}"
    size: "2.1rem"
  ujian-ljk-filled:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  ujian-timer:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.ujian-numeral}"
    rounded: "{rounded.stamp}"
    padding: "0.3rem 0.7rem"
  ujian-timer-warn:
    backgroundColor: "{colors.stabilo}"
  ujian-timer-danger:
    backgroundColor: "{colors.pitcar-red}"
    textColor: "{colors.paper}"
  ujian-garis:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.biru-pulpen}"
    rounded: "{rounded.control}"
    width: "100%"
  ujian-stempel:
    textColor: "{colors.pitcar-red}"
    rounded: "{rounded.stamp}"
    padding: "0.35rem 1.1rem"
  glass-card:
    backgroundColor: "rgba(255, 255, 255, 0.78)"
    rounded: "{rounded.glass-card}"
  glass-button:
    backgroundColor: "rgba(255, 255, 255, 0.5)"
    textColor: "{colors.glass-text}"
    typography: "{typography.glass-label}"
    rounded: "{rounded.glass-control}"
  glass-button-primary:
    backgroundColor: "{colors.pitcar-red}"
    textColor: "{colors.paper}"
    rounded: "{rounded.glass-control}"
  glass-pill:
    backgroundColor: "rgba(255, 255, 255, 0.5)"
    textColor: "{colors.glass-pill-text}"
    typography: "{typography.glass-label}"
    rounded: "{rounded.pill}"
  glass-pill-active:
    backgroundColor: "{colors.pitcar-red}"
    textColor: "{colors.paper}"
---

# Design System: Akademi Pitcar

## Overview

**Creative North Star: "The Answer Sheet"**

Akademi Pitcar runs two visual systems, and both are real in the shipped code. The **app default** is the incumbent **Frosted Workspace**: translucent white glass cards over a pale grey backdrop with a faint Pitcar-red bloom in the corners, Poppins throughout, Tailwind's grey scale for text, and soft blue-tinted ambient shadows. Admin pages, LMS course pages and dashboards use it (`src/style.css`, 30+ views). It is the default for any new screen outside the participant test flow.

The **participant competency test** (the `.ujian` scope: task list, test sheet, join-by-link page) is a separate, deliberately scoped world: **The Answer Sheet**. It is the exam paper every Indonesian worker knows from school (an LJK answer sheet on squared paper) working as a phone app: white paper cards with thick black rules on a pale blue grid, flat black block shadows with no blur, red-ink answer bubbles that fill with graphite when chosen, a yellow highlighter for emphasis and time warnings, and blue ballpoint ink for written answers. Headings set in a heavy Bricolage Grotesque, body text in Poppins. It is dense with real information (counts, minutes, rules, progress) and built for thumbs: 44px minimum targets, sticky bottom navigation on phones, one question per screen. The driver.js onboarding popover (`src/styles/tour.css`) speaks the same paper-and-ink dialect wherever the tour runs, including the admin competency pages.

The two worlds share exactly one thing, the Pitcar red (`pitcar-red`) as the action color, which is a brand commitment. Everything else (material, depth, type, radius) belongs to one world or the other and is not mixed.

**Key Characteristics:**
- App default: frosted glass cards, blurred ambient shadows, Poppins, Tailwind grey text, gradient red primary buttons.
- Answer Sheet scope: paper on a 24px squared grid, 2.5px ink borders, hard offset block shadows, no blur.
- LJK signature: red-ink circles that fill solid ink when answered, used for both options and the question navigator.
- Highlighter yellow marks emphasis, the selected option, the current question and the 5-minute warning.
- Blue ballpoint ink is reserved for the participant's own written answer.
- Pitcar red is the one action color in both worlds.

## Colors

The Answer Sheet palette is stationery: black ink, white paper, blue grid, red marking ink, yellow highlighter, blue pen. The Frosted Workspace palette is neutral grey glass with a red accent.

### Primary
- **Pitcar Red / LJK Marking Ink** (`pitcar-red`): the brand action color in both worlds. In the Answer Sheet it is the primary button ("Mulai mengerjakan", "Periksa & kirim", "Kirim jawaban"), the unanswered bubble and navigator outline, the minutes tile on the cover, the under-1-minute timer, error text, and the TERKIRIM stamp. In the glass world it is the end stop of the primary button gradient and active pill.
- **Pressed Red** (`merah-tua`): hover state of the red button and text on the red chip.
- **Red Wash** (`merah-muda`): background of the red "belum dikerjakan" / period-closed chip.

### Secondary
- **Stabilo Yellow** (`stabilo`): the highlighter. Choice-question chip, profile chip, the multiple-choice count tile, the "sedang dikerjakan" status, the current-question ring in the navigator, the essay field focus ring, the timer under 5 minutes, text selection, and the tour's progress pill.
- **Highlighter Wash** (`stabilo-wash`): hover on answer options and on task-list rows.
- **Highlighter Fill** (`stabilo-fill`): background of a chosen answer option.

### Tertiary
- **Ballpoint Blue** (`biru-pulpen`): the participant's written essay text, and the 3px focus-visible outline across the scope and the tour.
- **Done Green** (`hijau`) with **Green Wash** (`hijau-muda`): submitted / all-done states only (chip, "Sudah diisi", "Semua soal sudah dijawab", the recording level meter).

### Neutral
- **Ink** (`ink`): text, every border, block shadows, filled bubbles, question number blocks, the dark secondary button.
- **Soft Ink** (`ink-soft`): supporting text (meta lines, helper copy).
- **Paper** (`paper`): cards, buttons, sticky header and bottom bars.
- **Grid Paper** (`grid-paper`) and **Grid Line** (`grid-line`): the page background, a 24px squared grid of 1px lines.
- **Ruled Line** (`ruled-line`): the 2rem-pitch ruling on the essay sheet.
- **Glass Base** (`glass-base`) and **App Background** (`app-bg`): the Frosted Workspace backdrop and plain body background.
- **Glass Red Bright** (`glass-red-bright`): start stop of the glass primary gradient only.
- **Slate Text** (`glass-text`, `glass-pill-text`): glass button and pill text.
- **Tailwind Grey** (`gray-900`, `gray-500`): headings and secondary text in the glass world, used directly as Tailwind utilities.

### Named Rules
**The One Red Rule.** Pitcar red is the only action color in either world. A second accent never carries a primary action.

**The Stationery Roles Rule.** Inside `.ujian`, each ink has one job: red marks what still needs doing, graphite (ink) marks what is done, yellow highlights, blue is the participant's own handwriting, green confirms submission. Do not swap roles.

## Typography

**Display Font (Answer Sheet only):** Bricolage Grotesque Variable (with Poppins, system-ui), self-hosted via `@fontsource-variable/bricolage-grotesque`, imported only by the participant views.
**Body Font (both worlds):** Poppins (Google Fonts, 300–700), set on `body`.

**Character:** In the Answer Sheet, a heavy, slightly quirky grotesque for headings and numerals against a friendly geometric body face reads like a printed exam header over plain instructions. The glass world is Poppins alone, hierarchy carried by weight and Tailwind grey.

### Hierarchy
- **Display** (Bricolage 800, 1.85rem, stepping to 2.4rem from the `sm` breakpoint; line-height 1.08, -0.015em): the case title on the test cover; the page title on the task list (1.9rem to 2.3rem, line-height 1).
- **Headline** (Bricolage 800, 1.25rem to 1.5rem): section titles ("Tes studi kasus", "Periksa sebelum kirim", "Situasi"), empty and error states.
- **Title** (Bricolage 700, 1.2rem to 1.35rem, line-height 1.375): the question text.
- **Numeral** (Bricolage 800, tabular figures): timer (1.25rem), question number block (1.25rem), cover fact tiles (1.875rem to 2.25rem), the TERKIRIM stamp (1.8rem, 0.06em tracking).
- **Body** (Poppins 400, 15px, line-height 1.625): scenario, options, rules, explanations; the scenario is capped at `max-w-prose`.
- **Label** (Poppins 700, 0.75rem): chips; helper and meta lines use Poppins 400 at 0.75–0.875rem in soft ink.
- **Button** (Poppins 700, 0.9rem; 1.05rem on the large button).
- **Glass world:** Poppins only; buttons and pills 600 (primary 700); headings bold in `gray-900`, secondary text `gray-500`/`gray-600`; markdown prose capped at 65ch.

### Named Rules
**The Scoped Display Rule.** Bricolage Grotesque appears only inside `.ujian` and the tour popover title. Glass-world screens stay Poppins-only.

**The Tabular Clock Rule.** Every number that changes or is compared (timer, navigator, fact tiles, recording time) uses tabular figures so it does not jitter.

## Layout

**Answer Sheet.** Mobile-first, single column on phones. The page background is a fixed 24px squared grid. Content columns: task list and cover `max-w-4xl`/`max-w-3xl`, result and join cards `max-w-xl`/`max-w-md`, the working sheet `max-w-6xl`. Page padding 16px, 24px from `md`. Cards pad 16px (24px from `sm`; cover 20px to 28px). During the test a sticky white header carries back, short title, save status and the timer, with the LJK navigator scrolling horizontally beneath it. On phones the Previous/Next bar (and the cover's start button) is fixed to the bottom edge with a 2.5px top rule and safe-area padding; from `lg` the navigation moves inside the question card and the layout splits into a sticky scenario column (0.9fr) and a question column (1.1fr). The scenario collapses to a "Baca lagi" toggle on phones. Options stack with a 10px gap; tap targets are 44px minimum (56px for the large start button).

**Frosted Workspace.** Tailwind spacing scale, HR-style full-width pages over the `glass-base` backdrop (fixed attachment); cards on a soft gradient surface.

## Elevation & Depth

The two worlds use opposite depth models.

**Answer Sheet: flat paper, block shadows.** Depth is a solid ink offset with zero blur, like a sheet lifted off the desk. Pressing a control removes the shadow and translates the element by the same offset, so it lands flat. The grid background and the essay ruling are drawn with linear gradients; these are paper markings, not lighting.

**Frosted Workspace: ambient glass.** Translucent white with `backdrop-filter: blur()` and saturate, a 1px white edge, an inset top highlight, and diffuse blue-tinted shadows.

### Shadow Vocabulary
- **Sheet block** (`box-shadow: 4px 4px 0 #141414`): sheet cards and the large start button.
- **Control block** (`box-shadow: 2px 2px 0 #141414`): buttons, timer, chosen option.
- **Tour block** (`box-shadow: 5px 5px 0 #141414`): the onboarding popover only.
- **Current ring** (`box-shadow: 0 0 0 3px #ffe14d, 0 0 0 5px #141414`): current question in the navigator and focused essay sheet.
- **Glass card** (`box-shadow: 0 10px 34px rgba(31, 38, 135, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)`): default glass container.
- **Glass modal** (`box-shadow: 0 24px 60px rgba(31, 38, 135, 0.30)`): near-opaque modal panel.
- **Glass primary** (`box-shadow: 0 8px 22px rgba(183, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35)`): red glass button.

### Named Rules
**The Press-Flat Rule.** In the Answer Sheet, an active control translates by its own shadow offset and drops the shadow (2px for buttons, 1px for options). Disabled controls have no shadow.

**The No-Blur Paper Rule.** Inside `.ujian` no shadow has blur. Hard block shadows belong to this world and the tour popover only; glass screens keep their ambient shadows.

## Shapes

**Answer Sheet.** Softly rounded rectangles under heavy rules: sheets 14px, buttons, options and the essay field 12px, the question number block, timer and stamp 10px, checkbox 6px. Circles are reserved for LJK marks (answer bubbles, navigator, numbered rules) and pill chips. Borders are 2.5px ink on cards, buttons, timer, checkbox and bars; 2px on chips, options, the essay field and the navigator; 4px on the stamp. Dashed 2px rules mark non-graded or secondary zones (the practice example box, the question-card footer). The stamp is the one rotated element (-6deg).

**Frosted Workspace.** Larger, softer radii (1.25rem cards, 1rem small cards, 0.9rem buttons, full pills) with 1px translucent white edges.

## Components

### Buttons
Tactile, chunky, pressable.
- **Shape:** 12px radius (14px on the large variant), 2.5px ink border, control block shadow (sheet block on the large variant).
- **Paper (default):** white with ink text, 44px minimum height, Poppins 700. Used for Back, Previous, secondary actions.
- **Red:** Pitcar red with white text; the forward commitment on a screen (start, open test, check and send, send).
- **Ink:** solid ink with white text; Next, Continue, Retry, Back-to-list after completion.
- **Large:** 56px minimum, full width on phones; the cover start button only.
- **Hover / Active / Focus:** hover darkens (paper `#f4f4f4`, red to pressed red, ink to `#000`); active presses flat (Press-Flat Rule); focus-visible is a 3px ballpoint-blue outline offset 2px. Disabled drops to 45% opacity with no shadow.
- **Glass world:** translucent white glass button with slate text; primary is a 135deg red gradient (`glass-red-bright` to `pitcar-red`) with a red-tinted glow.

### Chips
- **Style:** pill, 2px ink border, Poppins 700 at 0.75rem, white.
- **Variants:** yellow (choice question, profile, in progress, pending count), red (not started, closed, recording), green (submitted, all done). Chips carry real metadata or state, never decorative labels.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** paper on the grid.
- **Shadow Strategy:** sheet block (see Elevation).
- **Border:** 2.5px ink. Lists inside a card divide with 2px ink rules.
- **Internal Padding:** 16px, 24px from `sm`.
- **Fact tiles (cover):** 12px-radius bordered boxes in a three-up grid, each a big numeral over a short label, colored yellow (multiple choice), white (essay), red (minutes).
- **Glass card:** 78% white, 18px blur, 1.25rem radius, ambient shadow.

### Inputs / Fields
- **Essay sheet:** a ruled exam page. White, 2px ink border, 12px radius, 2rem ruling in `ruled-line`, a red margin line at 1.75rem, text in ballpoint blue at 1rem/2rem. Focus replaces the outline with the yellow-and-ink current ring.
- **Checkbox:** 24px square, 2.5px ink border, 6px radius; checked fills ink with a white stroke check (inline SVG).
- **Answer mode switch:** bordered segmented control; the active segment is solid ink with white text.

### Navigation
- **LJK navigator:** a horizontal row of numbered circles in the sticky header. Unanswered: red ink outline and numeral. Answered: solid ink, white numeral. Current: yellow ring inside an ink ring. The same marks reappear larger (44px) on the review screen.
- **Bottom bar (phones):** white, 2.5px top rule, two equal buttons (Previous paper, Next ink, or Check-and-send red on the last question).

### Answer Option (signature)
A full-width pressable row: 2px ink border, 12px radius, a 36px red-ink letter bubble (A, B, C...) and the option text. Hover washes yellow; choosing it fills the row with highlighter fill, adds the control block shadow, and fills the bubble with graphite (ink) with a short scale-in. Exposed to assistive tech as a radio group.

### Timer Stamp
A bordered block in the sticky header with a clock icon and a tabular Bricolage countdown. White normally, highlighter yellow at 5 minutes or less, Pitcar red with white text at 1 minute or less.

### TERKIRIM Stamp
A red rubber stamp: 4px red border, 10px radius, Bricolage 800 with wide tracking, rotated -6deg, landing with a scale-down from 1.9x over 0.42s (disabled under reduced motion). Appears only on the submitted screen.

### Tour Popover
A paper card for driver.js: white, 2.5px ink border, 14px radius, tour block shadow, Bricolage title, yellow progress pill, paper buttons with a red Next, a line-icon close button drawn by CSS mask, no arrow, overlay `rgba(20, 20, 20, 0.62)`.

## Do's and Don'ts

### Do:
- **Do** use the Frosted Workspace (glass cards, Poppins, Tailwind grey) for any new screen outside the participant competency-test flow.
- **Do** wrap participant test screens in the `.ujian` scope and build them from its tokens and components rather than ad hoc Tailwind colors.
- **Do** keep Pitcar red as the single action color in both worlds (One Red Rule).
- **Do** keep tap targets at 44px or more on participant screens, with primary navigation fixed to the bottom on phones.
- **Do** use LJK circles (red outline, ink when done) for any answered/unanswered status in the Answer Sheet.
- **Do** use tabular figures for any live or compared number.
- **Do** honor `prefers-reduced-motion`: the stamp and bubble animations and control transitions turn off.

### Don't:
- **Don't** put blurred or soft shadows, glass blur, or translucent surfaces inside `.ujian` (No-Blur Paper Rule).
- **Don't** use color gradients for fills or buttons inside `.ujian`; gradients there only draw paper markings (the grid, the ruling, the margin line).
- **Don't** carry hard block shadows, 2.5px ink borders or Bricolage into glass-world screens; the Answer Sheet is a scoped surface system, not the app default.
- **Don't** use blue ink for anything but the participant's own answer text and focus outlines.
- **Don't** use green for anything other than a done or submitted state.
- **Don't** use the rotated stamp anywhere except the submitted confirmation.
