# Accessibility Statement

## Purpose

This project exists to help people explore HTML, SVG, responsiveness, and accessibility issues in a fast feedback loop.

Because the tool itself is about accessibility testing, accessibility is not a secondary concern. It is a core product requirement.

## Accessibility commitment

We aim to make both the playground interface and the rendered preview workflow as accessible as practical within a lightweight static app.

That means we try to support:

- Keyboard-first interaction
- Clear visible labels and accessible names
- Responsive use on desktop, tablet, and mobile
- Light mode and dark mode exploration
- Accessible status messaging
- Semantic HTML in the app shell
- Sa11y-powered feedback inside the preview

## Scope

This statement applies to:

- The application shell in [index.html](/Users/mike.gifford/html2html/index.html)
- The workflow for editing and previewing HTML/SVG
- The controls for theme and viewport switching
- The use of Sa11y in the preview iframe

It does not guarantee that arbitrary user-supplied HTML pasted into the editor will itself be accessible. That is one of the things this tool is designed to help evaluate.

## Design principles

Changes to this project should follow these principles:

- Accessibility-first over aesthetics-only decisions
- Progressive enhancement over fragile complexity
- Clear interaction patterns over clever hidden behaviors
- Safe isolation for user content
- Honest communication about limitations

## Light and dark mode expectations

This project actively explores light and dark presentation, so accessibility in both modes matters.

When working on theme behavior:

- Do not assume a design that works in light mode also works in dark mode
- Maintain sufficient contrast in both interface states
- Avoid relying on color alone to communicate state
- Ensure focus indicators remain visible in both themes
- Preserve readable typography, spacing, and hierarchy across themes
- Test controls, status messaging, and selected states in light and dark contexts

Dark mode in the preview should be treated as a simulation context, not proof that third-party content is fully dark-mode accessible. User content may still require its own theme-aware CSS.

This repository’s light/dark work should be informed by the best-practice direction referenced by the project owner:

- [Light/Dark Mode Accessibility Best Practices](https://mgifford.github.io/ACCESSIBILITY.md/examples/LIGHT_DARK_MODE_ACCESSIBILITY_BEST_PRACTICES.html)

Inference:
I was not able to reliably retrieve the contents of that page from the browser tool in this session, so this document references it as the guiding external resource rather than quoting it directly.

## Current accessibility approach

The current implementation supports accessibility by:

- Using semantic buttons, headings, labels, and live regions in the UI
- Keeping the preview isolated in an `iframe`
- Blocking user-authored scripts that could destabilize the experience
- Re-running Sa11y on each preview refresh
- Offering responsive preview widths for desktop, tablet, and mobile review
- Allowing light and dark preview testing

## Known limitations

- Sa11y provides useful feedback, but it is not a complete accessibility audit
- The preview can simulate dark mode, but user markup and CSS still determine the final experience
- This tool does not replace screen reader testing, keyboard testing, zoom testing, or real-device testing
- Arbitrary external CSS may create inaccessible combinations that the app cannot automatically correct

## Accessibility review checklist

When making changes, review at least the following:

- Can every interactive control be reached and used with a keyboard?
- Are labels and accessible names still present and accurate?
- Are focus states visible?
- Are status messages exposed clearly?
- Does the interface remain usable at smaller widths?
- Do light and dark shell states remain legible?
- Do preview theme and viewport controls remain understandable?
- Does Sa11y still initialize after preview refreshes?
- Are there new console errors that could break assistive workflows?

## Relationship to AGENTS.md

Agents and contributors should treat this file as a companion to [AGENTS.md](/Users/mike.gifford/html2html/AGENTS.md).

If there is ever a conflict between convenience and accessibility, prefer the more accessible path unless the user explicitly directs otherwise.

Future agent sessions should read both:

- [AGENTS.md](/Users/mike.gifford/html2html/AGENTS.md)
- [ACCESSIBILITY.md](/Users/mike.gifford/html2html/ACCESSIBILITY.md)

before making substantial UI, interaction, theme, preview, or accessibility-related changes.
