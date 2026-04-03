# AGENTS.md

## Project overview

This repository contains a single-file web app: a Live Accessibility Playground for experimenting with HTML and inline SVG.

The main app lives in [index.html](/Users/mike.gifford/html2html/index.html).

The project is intentionally lightweight:

- No framework
- No build step
- No package manager
- No test runner
- Designed to work as a static file and on GitHub Pages

## Primary goals

When working in this repository, optimize for:

- Fast iteration in a single HTML file
- Accessibility-first decisions
- Clear, resilient vanilla JavaScript
- Safe iframe-based preview behavior
- GitHub Pages compatibility
- Minimal dependencies and minimal complexity

## Setup and run

There is no install step.

Open the app directly:

- Open `index.html` in a browser

Or serve it locally with any static server if needed.

## Important files

- [index.html](/Users/mike.gifford/html2html/index.html): complete app UI, styles, and JavaScript
- [README.md](/Users/mike.gifford/html2html/README.md): human-facing project overview and use cases
- [AGENTS.md](/Users/mike.gifford/html2html/AGENTS.md): agent-facing workflow and project instructions
- [ACCESSIBILITY.md](/Users/mike.gifford/html2html/ACCESSIBILITY.md): accessibility statement and project-specific accessibility expectations

## Code style

- Keep everything framework-free unless the user explicitly asks otherwise
- Prefer straightforward vanilla JS over abstractions
- Keep the app self-contained in `index.html` unless the user asks to split files
- Preserve accessibility labels, keyboard support, and semantic HTML
- Prefer small, targeted edits over broad rewrites
- Use ASCII unless the file already needs Unicode

## Preview and security rules

The iframe preview is central to the app.

When changing preview behavior:

- Preserve iframe isolation between the editor shell and rendered content
- Keep user-authored JavaScript blocked unless the user explicitly asks to allow it
- Preserve support for external user stylesheets
- Preserve Sa11y injection and reinitialization on each refresh
- Be careful with generated `<script>` strings inside the app script; escape closing tags as `<\/script>`
- Be careful with CSP changes because they can silently break the preview

## Accessibility expectations

This project is about accessibility tooling, so changes should reflect that.

Read [ACCESSIBILITY.md](/Users/mike.gifford/html2html/ACCESSIBILITY.md) before making substantial accessibility, theme, UI, preview, or interaction changes.

- Keep controls keyboard accessible
- Maintain visible labels or accessible names
- Preserve `aria-live` messaging where useful
- Avoid introducing color-only state cues
- Keep responsive behavior usable on desktop, tablet, and mobile
- Preserve usable light and dark mode behavior in both the shell and the preview experience

## Continuity and lost-thread recovery

Assume future agent sessions may start without full conversation history.

Before making changes, recover context from the repository itself:

1. Read [README.md](/Users/mike.gifford/html2html/README.md), [AGENTS.md](/Users/mike.gifford/html2html/AGENTS.md), and [ACCESSIBILITY.md](/Users/mike.gifford/html2html/ACCESSIBILITY.md)
2. Inspect `git status`
3. Review the latest commits with `git log --oneline -n 5`
4. Open [index.html](/Users/mike.gifford/html2html/index.html) and find the current feature set before editing
5. Preserve any unfinished user-facing work already present in the working tree

If the request seems related to recent work, check whether the feature already exists in partial form before rebuilding it.

## Change strategy

For most requests:

1. Inspect the current file first
2. Make the smallest useful change
3. Re-read the affected sections for parse errors or broken HTML/JS strings
4. If possible, verify with lightweight checks
5. Summarize any limitations honestly

## Verification guidance

There is no automated test suite right now.

Useful manual checks include:

- Confirm the page still opens as a static file
- Confirm the editor updates the preview after debounce
- Confirm Sa11y still initializes after preview refresh
- Confirm theme and viewport controls still work
- Confirm no obvious console errors were introduced
- Confirm GitHub Pages compatibility is preserved

## Git and deployment notes

- The repository uses GitHub and may be published via GitHub Pages
- Avoid breaking the static-file deployment model
- If pushing changes, prefer clear commit messages describing the user-visible fix

## When unsure

Prefer preserving:

- Simplicity
- Accessibility
- Static hosting compatibility
- Safe preview behavior

If a requested change would weaken isolation or allow unsafe script execution, call that out clearly before proceeding.
