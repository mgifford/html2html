# Live Accessibility Playground

Live Accessibility Playground is a single-file HTML tool for testing raw HTML and inline SVG in real time.

It gives you:

- A code editor for writing or pasting HTML and SVG
- A live preview rendered inside an isolated `iframe`
- Instant accessibility feedback from [Sa11y](https://sa11y.netlify.app)
- Automated accessibility checks with axe for the shipped app states
- Theme controls for light and dark preview modes
- Viewport controls for desktop, tablet, and mobile testing

## Why this is useful

A lot of accessibility and frontend work happens before a full app or CMS integration exists. Sometimes you just need a fast place to answer questions like:

- Does this markup structure make sense?
- Does this SVG expose a useful accessible name?
- What does this component look like on mobile?
- Does this content still work in dark mode?
- Will this external CSS file behave the way I expect?
- Does Sa11y flag obvious issues before I ship this into a larger system?

This project makes those checks fast.

Instead of setting up a framework, a build step, or a design system sandbox, you can paste markup directly into the editor and see the result immediately. That makes it useful for prototyping, debugging, audits, demos, and accessibility training.

## Who it can help

- Frontend developers testing components in isolation
- Accessibility specialists reviewing sample markup
- Designers validating light and dark presentation
- CMS teams experimenting with author-generated HTML
- Trainers teaching semantic HTML and common accessibility issues
- Anyone debugging SVG, forms, headings, images, or content structure

## What it does

- Renders HTML and inline SVG live as you type
- Debounces updates to avoid excessive rerenders
- Injects Sa11y into the preview and reruns checks on refresh
- Lets external stylesheet links in the editor apply to the preview
- Blocks user-authored scripts for safer experimentation
- Supports swapping the editor and preview chrome between dark and light surfaces
- Lets you test the preview at desktop, tablet, and mobile widths
- Includes copy, clear, and download actions

## Example use cases

### 1. Accessibility QA for fragments

Paste a heading structure, form, table, card, or article snippet and see whether Sa11y catches obvious issues such as missing labels, heading problems, or weak content patterns.

### 2. SVG testing

Drop in inline SVG and verify how titles, roles, and accessible names behave while keeping the visual output visible beside the source.

### 3. CSS framework experiments

Link to Bootstrap, Tailwind, or another stylesheet CDN in the editor and quickly test how a content block behaves without creating a full project.

### 4. Responsive review

Switch between desktop, tablet, and mobile preview widths to spot layout issues early.

### 5. Light and dark mode checks

Toggle preview theme modes to see whether your markup and CSS still read clearly across different presentation contexts.

## How it works

The app uses a sandboxed `iframe` as the preview surface. That matters because:

- User CSS is isolated from the editor UI
- The preview can be rebuilt cleanly on each change
- Sa11y can run against the rendered document
- User-provided JavaScript can be stripped while internal checking logic still runs

The editor content is sanitized before rendering. Script tags, inline event handlers, and unsafe URL patterns are removed before the preview is generated.

## Quick start

### Open locally

Because this is a single HTML file, you can open it directly in a browser:

1. Clone the repository
2. Open `index.html`

You can also serve it from a local static server if you prefer.

### Use the hosted version

If GitHub Pages is enabled for the repository, the app can be accessed from the published Pages URL.

## Accessibility verification

This project uses both Sa11y and axe:

- Sa11y provides in-page feedback inside the live preview
- axe is used as an automated check for the shipped interface and key preview states

To run the automated scan locally:

1. Run `npm install`
2. Run `npx playwright install chromium`
3. Run `npm run test:a11y`

## Project structure

- [index.html](/Users/mike.gifford/html2html/index.html) - the complete application in one file

## Notes and limitations

- Dark mode preview sets a dark page context, but a full dark-mode result still depends on the user’s own CSS
- External CSS links are allowed in the preview, but third-party user JavaScript is intentionally blocked
- This is a lightweight playground, not a full replacement for browser testing, screen reader testing, or production security review

## Future directions

Possible enhancements include:

- Side-by-side dual previews for light and dark mode at the same time
- Saving and loading example snippets
- More explicit sanitization reporting
- Additional accessibility testing integrations
- Shareable URLs for saved examples

## License

Add the license that matches how you want to share or reuse this project.
