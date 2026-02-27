# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **Tampermonkey userscript** (`teams-autohide-sidebar.user.js`) that auto-hides the Microsoft Teams left chat panel on `https://teams.microsoft.com/*`. No build system — vanilla JS + CSS injected via `GM_addStyle()`.

**GitHub**: `git@github.com-salkawakami:salkawakami/teams-autohide-sidebar.git` (personal account)

## Development Workflow

**No build step.** Edit the `.user.js` file directly.

**Install/test loop:**
1. Edit `teams-autohide-sidebar.user.js`
2. Tampermonkey Dashboard → paste updated script (or use file import under Utilities tab)
3. Reload `https://teams.microsoft.com` → open DevTools Console → check for `[Teams AutoHide]` logs

**DOM investigation (required before coding selectors):**
```javascript
// Run in DevTools Console on teams.microsoft.com to find stable selectors
[...document.querySelectorAll('[data-tid]')]
  .map(el => el.getAttribute('data-tid'))
  .filter((v, i, a) => a.indexOf(v) === i).sort()
  .forEach(v => console.log(v));
```

## Script Architecture

The script follows this structure (see `PROJECT_CHECKLIST.md` Section 4.6):
1. Tampermonkey metadata block (`@match`, `@grant GM_addStyle`, `@run-at document-idle`)
2. `'use strict'` + constants/config
3. `GM_addStyle()` — CSS for collapsed/hover states
4. Helper functions: `waitForElement()`, `log()`
5. Main init via `waitForElement` callback
6. Optional: URL-change observer for SPA navigation re-init

**Key technical constraints:**
- Use `data-tid` attributes as selectors (not class names — Teams uses hashed React classes that change with updates)
- CSS-first approach: hover/collapse via CSS, JS only for toggle button state and SPA re-init
- `MutationObserver` required — Teams renders the panel asynchronously after `document-idle`
- May need `!important` to override Teams' inline styles

**Phase 1 (DOM investigation) must be completed before coding** — selector values need to be verified live in DevTools as they change with Teams updates. See `PROJECT_CHECKLIST.md` Section 3 for the investigation steps and Section 7.5 for known `data-tid` patterns.

## Selector Fallback Strategy

Teams updates break selectors. Always use a fallback list:
```javascript
const SELECTORS = [
  '[data-tid="chat-pane-list"]',
  '[data-tid="app-layout-area--main"]',
  '[aria-label="Chat"]',
];
```

## Git

```bash
git remote add origin git@github.com-salkawakami:salkawakami/teams-autohide-sidebar.git
git branch -M main && git push -u origin main
```

Commit format: `fix: update selector after Teams update (v0.1.x)`
