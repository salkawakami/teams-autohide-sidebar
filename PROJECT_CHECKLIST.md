# Microsoft Teams Left Sidebar Auto-Hide — Userscript Project Checklist

**Project**: `teams-autohide-sidebar`
**Account**: `salkawakami` (personal GitHub)
**Target URL**: `https://teams.microsoft.com/*`
**Tool**: Tampermonkey userscript (Chrome)
**Status**: [x] DOM Investigation COMPLETE (2026-02-27)

## ✅ CONFIRMED FINDINGS (Live DOM Investigation via Chrome DevTools MCP)

| Item | Value |
|------|-------|
| **Target selector** | `[data-tid="app-layout-area--mid-nav"]` |
| **Default width** | `320px` (left: 68px, after icon nav bar) |
| **CSS to hide** | `width: 0 !important; min-width: 0 !important; overflow: hidden !important;` |
| **CSS to restore on hover** | `[data-tid="app-layout-area--mid-nav"]:hover { width: 320px !important; }` |
| **Transition** | `transition: width 0.25s ease !important;` |
| **Main content selector** | `[data-tid="app-layout-area--main"]` — auto-expands 1067px → 1387px |
| **Icon nav bar** | `[data-tid="app-layout-area--nav"]` — 68px, do NOT hide |
| **JS required?** | **No — pure CSS injection works** |
| **Layout parent** | `[data-tid="experience-layout"]` (flex container, 13 children) |

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Prerequisites Checklist](#2-prerequisites-checklist)
3. [Phase 1 — DOM Investigation](#3-phase-1--dom-investigation)
4. [Phase 2 — Development](#4-phase-2--development)
5. [Phase 3 — Testing](#5-phase-3--testing)
6. [Phase 4 — GitHub Setup](#6-phase-4--github-setup)
7. [Technical Reference](#7-technical-reference)
8. [Troubleshooting Guide](#8-troubleshooting-guide)
9. [Future Enhancements](#9-future-enhancements)

---

## 1. Project Overview

### Problem Statement

Microsoft Teams (both desktop app and web app at `teams.microsoft.com`) does not offer a native auto-hide feature for the left chat list panel. The panel — showing the conversations/chat list — is always visible and occupies a fixed portion of horizontal screen space.

On smaller screens or when focused on a single conversation, this wastes valuable real estate. Users cannot collapse, auto-hide, or pin/unpin this panel natively.

### Solution

A **Tampermonkey userscript** injected into `https://teams.microsoft.com/*` that implements **Option C — Hybrid (hover + pin)**:

1. **Default mode (hover)**: Panel is always hidden (collapsed to 0px). Mouse over the left edge → panel slides out. Mouse away → panel auto-hides.
2. **Pin mode**: A `📌` button appears inside the panel when hovering. Click it → panel stays open permanently. Click again → back to hover mode.
3. State is toggled intentionally — the panel only stays open when the user explicitly pins it.

### UX Behavior (Option C — CONFIRMED CHOICE)

| State | Trigger | Result |
|-------|---------|--------|
| Hidden (default) | Page load | Panel collapsed to `0px` |
| Revealed | Mouse enters left edge | Panel slides to `320px` with smooth transition |
| Auto-hides | Mouse leaves panel | Panel collapses back to `0px` |
| Pinned open | Click `📌` button inside panel | Panel stays at `320px`, hover has no effect |
| Unpinned | Click `📌` button again | Back to hover mode |

### Approach Summary

- **No framework** — vanilla JS + CSS injection via `GM_addStyle()`
- **Stable selectors only** — `data-tid` attributes confirmed via live DOM investigation (NOT hashed class names)
- **CSS-first for hover** — hover/transition handled purely in CSS
- **JS only for pin state** — toggle button and pinned class managed in JS
- **No MutationObserver needed** — `data-tid="app-layout-area--mid-nav"` is present at DOM load

---

## 2. Prerequisites Checklist

### Browser & Extensions

- [ ] Chrome installed and up to date (check: `chrome://settings/help`)
- [ ] Tampermonkey extension installed from Chrome Web Store
  - URL: https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
  - [ ] Verify: Tampermonkey icon visible in Chrome toolbar
  - [ ] Verify: Settings → Developer Mode is ON (required to install from file)
- [ ] Open Teams web app: https://teams.microsoft.com — confirm it loads and you can log in

### Development Tools

- [ ] Text editor ready (VS Code recommended)
  - [ ] Install extension: **Tampermonkey** syntax highlighter (optional but useful)
- [ ] Chrome DevTools familiarity — you will use:
  - Elements panel (DOM inspection)
  - Console panel (live JS execution)
  - Sources panel (breakpoints, optional)
- [ ] Git installed: `git --version`
- [ ] SSH key for `salkawakami` account configured
  - Key path: `/Users/zz_Backup-2025-04-08/vs_code/talaria/salomaowk_git_private_nopass_20260108V1558`
  - SSH alias: `github.com-salkawakami`
  - Test: `ssh -T git@github.com-salkawakami` → should return "Hi salkawakami!"

### Local Project Directory

- [ ] Directory created: `/Users/zz_Backup-2025-04-08/vs_code/teams_auto_hide_left_bar/`
- [ ] Main script file planned: `teams-autohide-sidebar.user.js`
- [ ] This checklist file is present: `PROJECT_CHECKLIST.md`

---

## 3. Phase 1 — DOM Investigation

> ✅ **COMPLETE** — Performed via Claude Code Chrome DevTools MCP on 2026-02-27
> No manual investigation needed. All findings confirmed live.

### ✅ Confirmed Findings

| Property | Confirmed Value |
|----------|----------------|
| **Target selector** | `[data-tid="app-layout-area--mid-nav"]` |
| **Full panel width** | `320px` |
| **Collapsed width** | `0px` (with `overflow: hidden`) |
| **Panel left offset** | `68px` (sits right of icon nav bar) |
| **Icon nav bar** | `[data-tid="app-layout-area--nav"]` — 68px — **do NOT touch** |
| **Main content** | `[data-tid="app-layout-area--main"]` — auto-expands to 1387px when panel hidden |
| **Layout parent** | `[data-tid="experience-layout"]` — flex container |
| **CSS override needed** | `width: 0 !important; min-width: 0 !important; overflow: hidden !important;` |
| **Hover restore** | `width: 320px !important;` |
| **Transition** | `width 0.25s ease` confirmed smooth |
| **Teams version tested** | teams.microsoft.com/v2/ (2026-02-27) |

### ✅ Layout Structure (confirmed)

```
[data-tid="experience-layout"]  ← flex container (full width)
  ├── [data-tid="app-layout-area--nav"]      68px   ← icon rail, DO NOT HIDE
  ├── [data-tid="app-layout-area--mid-nav"]  320px  ← TARGET: chat list panel
  └── [data-tid="app-layout-area--main"]    1067px  ← main content (auto-expands)
```

### ✅ Live Tests Performed

- [x] `width: 0 !important; min-width: 0 !important` → panel collapses to 0px ✅
- [x] Main content expands from 1067px → 1387px automatically ✅
- [x] CSS `:hover` rule restores panel width ✅
- [x] `transition: width 0.25s ease` smooth animation confirmed ✅
- [x] Pure CSS injection (no JS) sufficient for hover behavior ✅

---

## 4. Phase 2 — Development

### 4.1 Create the Script File

- [ ] Create file: `/Users/zz_Backup-2025-04-08/vs_code/teams_auto_hide_left_bar/teams-autohide-sidebar.user.js`
- [ ] Add the Tampermonkey metadata block:

```javascript
// ==UserScript==
// @name         Teams Auto-Hide Left Sidebar
// @namespace    https://github.com/salkawakami/teams-autohide-sidebar
// @version      0.1.0
// @description  Auto-hides the Teams chat list panel. Hover to reveal, click pin to keep open.
// @author       salkawakami
// @match        https://teams.microsoft.com/*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==
```

### 4.2 Add CSS Injection (Core Hover Behavior)

> ✅ Selectors confirmed via live DOM investigation — use exactly as shown.

- [ ] Add `GM_addStyle()` with confirmed selectors:

```javascript
GM_addStyle(`
  /* HIDE: collapse chat list panel by default */
  [data-tid="app-layout-area--mid-nav"] {
    width: 0 !important;
    min-width: 0 !important;
    overflow: hidden !important;
    transition: width 0.25s ease !important;
  }

  /* HOVER: reveal panel when mouse enters */
  [data-tid="app-layout-area--mid-nav"]:hover {
    width: 320px !important;
    overflow: visible !important;
  }

  /* PINNED: keep panel open, disable hover hide */
  [data-tid="app-layout-area--mid-nav"].teams-autohide-pinned {
    width: 320px !important;
    overflow: visible !important;
  }

  /* PIN BUTTON: visible only when panel is hovered */
  #teams-autohide-pin-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 9999;
    background: rgba(98, 100, 167, 0.85);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  [data-tid="app-layout-area--mid-nav"]:hover #teams-autohide-pin-btn,
  [data-tid="app-layout-area--mid-nav"].teams-autohide-pinned #teams-autohide-pin-btn {
    opacity: 1;
  }
`);
```

### 4.3 Add Pin Button JS (Option C — Hybrid)

> This is the JS-only piece. CSS handles hover; JS handles the pin state toggle.

- [ ] Add pin state and button logic:

```javascript
(function () {
  'use strict';

  const PANEL_SELECTOR = '[data-tid="app-layout-area--mid-nav"]';
  const PIN_CLASS = 'teams-autohide-pinned';
  let isPinned = false;

  function addPinButton(panel) {
    if (document.getElementById('teams-autohide-pin-btn')) return; // already added

    // Ensure relative positioning for absolute button placement
    if (getComputedStyle(panel).position === 'static') {
      panel.style.position = 'relative';
    }

    const btn = document.createElement('button');
    btn.id = 'teams-autohide-pin-btn';
    btn.textContent = '📍';
    btn.title = 'Pin panel open';

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      isPinned = !isPinned;
      panel.classList.toggle(PIN_CLASS, isPinned);
      btn.textContent = isPinned ? '📌' : '📍';
      btn.title = isPinned ? 'Unpin (auto-hide on)' : 'Pin panel open';
      console.log('[Teams AutoHide] isPinned:', isPinned);
    });

    panel.appendChild(btn);
    console.log('[Teams AutoHide] Pin button added.');
  }

  function init() {
    const panel = document.querySelector(PANEL_SELECTOR);
    if (panel) {
      addPinButton(panel);
    } else {
      // Panel not in DOM yet — wait for it
      const observer = new MutationObserver(() => {
        const p = document.querySelector(PANEL_SELECTOR);
        if (p) {
          observer.disconnect();
          addPinButton(p);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 15000); // safety timeout
    }
  }

  init();
})();
```

### 4.4 Full Script Structure Review

- [ ] Final file order:
  1. `// ==UserScript==` metadata block
  2. `GM_addStyle(...)` — all CSS (hover, pinned, button)
  3. IIFE `(function() { ... })()` — pin button JS logic
- [ ] Set `DEBUG` logs to `false` before publishing
- [ ] Target line count: ~100 lines for v1

---

## 5. Phase 3 — Testing

### 5.1 Install Script in Tampermonkey

- [ ] Open Tampermonkey Dashboard: click Tampermonkey icon → Dashboard
- [ ] Click "+" (Create new script) tab
- [ ] Paste your entire script content
- [ ] Click Save (`Ctrl+S` or File → Save)
- [ ] Verify script appears in the Installed Scripts list with status "Enabled"

**Alternative — Install from file:**
- [ ] Go to Tampermonkey Dashboard → Utilities tab
- [ ] Under "Import from file", select your `.user.js` file
- [ ] Confirm installation

### 5.2 Initial Load Test

- [ ] Navigate to https://teams.microsoft.com (or refresh if already open)
- [ ] Open Chrome DevTools Console
- [ ] Look for `[Teams AutoHide] Panel found` log message
  - If missing: check for JS errors, verify selector is correct
- [ ] Visually confirm the panel is collapsed to the sliver width

### 5.3 Hover Behavior Test

- [ ] Move mouse over the collapsed sliver
  - [ ] Panel expands smoothly
  - [ ] Transition animation is visible (not instantaneous)
- [ ] Move mouse away from the panel
  - [ ] Panel collapses back to sliver smoothly
- [ ] Repeat several times to verify consistency

### 5.4 Navigation Test

Teams is a SPA — navigating between sections (Chat, Calendar, Files) can re-render the DOM.

- [ ] Click between "Chat", "Calendar", "Teams", "Files" in the left nav rail
- [ ] Return to "Chat" — confirm the panel still auto-hides correctly
- [ ] If broken after navigation: MutationObserver needs to re-run; see Troubleshooting 8.3

### 5.5 Toggle Button Test (if implemented)

- [ ] Hover over the panel — toggle button (📌) should appear
- [ ] Click the toggle button — panel should pin open
- [ ] Move mouse away — panel should NOT collapse while pinned
- [ ] Click toggle again — panel should return to auto-hide behavior
- [ ] Move mouse away — panel should collapse

### 5.6 Regression / Side Effects Test

- [ ] Confirm you can still click on conversations in the panel (when expanded)
- [ ] Confirm the main conversation view is not affected
- [ ] Confirm the narrow left navigation rail (icons) is not affected
- [ ] Confirm no Teams functionality appears broken

### 5.7 Disable/Re-enable Script Test

- [ ] Go to Tampermonkey Dashboard
- [ ] Toggle the script off — reload Teams — confirm panel behaves normally (no auto-hide)
- [ ] Toggle the script back on — reload Teams — confirm auto-hide resumes

### 5.8 Version & Update Resilience Note

- [ ] Teams updates periodically. Record the date of your DOM investigation:
  - Date tested: __________
  - Teams web app build (check Teams → `...` menu → About if available): __________
- [ ] Mark this test as passed:
  - [ ] All hover behaviors working
  - [ ] Toggle button working (if implemented)
  - [ ] No side effects on Teams functionality

---

## 6. Phase 4 — GitHub Setup

### 6.1 Verify SSH Access for salkawakami Account

- [ ] Test SSH: `ssh -T git@github.com-salkawakami`
  - Expected: `Hi salkawakami! You've successfully authenticated...`
  - If failing: check key path in `~/.ssh/config` under `Host github.com-salkawakami`

### 6.2 Initialize Local Git Repo

```bash
cd /Users/zz_Backup-2025-04-08/vs_code/teams_auto_hide_left_bar
git init
git config user.name "salkawakami"
git config user.email "YOUR_GITHUB_EMAIL"
```

- [ ] `git init` completed successfully
- [ ] Local git config set (use `--local`, not `--global`, to avoid interfering with other repos)

### 6.3 Create .gitignore

- [ ] Create `.gitignore` file:

```
# OS
.DS_Store

# Editor
.vscode/
*.swp
*~

# Node (if any tooling added later)
node_modules/
```

- [ ] `.gitignore` committed to prevent junk files

### 6.4 Create GitHub Repository

- [ ] Go to https://github.com/new (logged in as salkawakami)
- [ ] Repository name: `teams-autohide-sidebar`
- [ ] Description: "Tampermonkey userscript to auto-hide the Microsoft Teams left chat panel on hover"
- [ ] Visibility: **Public** (so others can use it) — or Private if preferred
- [ ] Do NOT initialize with README (you will push your own)
- [ ] Click "Create repository"
- [ ] Copy the SSH remote URL shown: `git@github.com:salkawakami/teams-autohide-sidebar.git`

### 6.5 Add Remote Using SSH Alias

Use the `github.com-salkawakami` SSH alias (NOT `github.com`) to ensure the correct key is used:

```bash
cd /Users/zz_Backup-2025-04-08/vs_code/teams_auto_hide_left_bar
git remote add origin git@github.com-salkawakami:salkawakami/teams-autohide-sidebar.git
```

- [ ] Remote added: verify with `git remote -v`
  - Should show: `origin  git@github.com-salkawakami:salkawakami/teams-autohide-sidebar.git`

### 6.6 First Commit

- [ ] Stage files:
  ```bash
  git add teams-autohide-sidebar.user.js .gitignore PROJECT_CHECKLIST.md
  git status  # Review before committing
  ```
- [ ] Commit:
  ```bash
  git commit -m "feat: initial Tampermonkey userscript for Teams sidebar auto-hide"
  ```
- [ ] Push:
  ```bash
  git branch -M main
  git push -u origin main
  ```
- [ ] Verify: open https://github.com/salkawakami/teams-autohide-sidebar in browser

### 6.7 Add README.md (Optional but Recommended)

- [ ] Create `README.md` with:
  - What the script does
  - Installation instructions (Tampermonkey + paste script)
  - Screenshot (if captured)
  - Known limitations (Teams DOM may change)
  - License

---

## 7. Technical Reference

### 7.1 Tampermonkey Metadata Block Reference

```javascript
// ==UserScript==
// @name         Human-readable script name
// @namespace    URL namespace (conventionally your GitHub URL)
// @version      Semantic version (MAJOR.MINOR.PATCH)
// @description  One-line description
// @author       Your name or GitHub handle
// @match        URL pattern where script runs (supports wildcards)
// @exclude      URL pattern to exclude (optional)
// @grant        GM_addStyle       — inject CSS into page
// @grant        GM_setValue       — persistent storage (key-value)
// @grant        GM_getValue       — read persistent storage
// @grant        GM_notification   — desktop notifications
// @grant        none              — no special permissions (cannot use GM_*)
// @run-at       document-start    — before DOM loaded (risky)
//               document-end      — after DOM fully parsed (DOMContentLoaded)
//               document-idle     — after page fully loaded (default, safest)
// @updateURL    URL to .meta.js for update checking
// @downloadURL  URL to .user.js for auto-update
// ==/UserScript==
```

**For this project, minimum needed:**

```javascript
// ==UserScript==
// @name         Teams Auto-Hide Left Sidebar
// @namespace    https://github.com/salkawakami/teams-autohide-sidebar
// @version      0.1.0
// @description  Auto-hides the left chat list panel in Microsoft Teams web app
// @author       salkawakami
// @match        https://teams.microsoft.com/*
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==
```

### 7.2 GM_* API Quick Reference

| Function | Purpose | Example |
|---|---|---|
| `GM_addStyle(css)` | Inject CSS into page | `GM_addStyle('div { color: red; }')` |
| `GM_setValue(key, val)` | Store persistent value | `GM_setValue('pinned', true)` |
| `GM_getValue(key, default)` | Read persistent value | `GM_getValue('pinned', false)` |
| `GM_log(msg)` | Log to Tampermonkey console | `GM_log('hello')` |
| `GM_notification(opts)` | Desktop notification | `GM_notification({text: 'Done'})` |

**Note**: Each `@grant` must be declared in metadata or the function will be undefined.

### 7.3 CSS Transition Patterns

**Width-based hide/show (most compatible):**

```css
.panel {
  width: 8px;
  min-width: 0;
  overflow: hidden;
  transition: width 0.3s ease;
}

.panel:hover {
  width: 320px;
  overflow: visible;
}
```

**Transform-based hide/show (smoother on GPU):**

```css
.panel {
  width: 320px;
  transform: translateX(calc(-320px + 8px));
  transition: transform 0.3s ease;
}

.panel:hover {
  transform: translateX(0);
}
```

**Opacity + width combo (visual fade):**

```css
.panel {
  width: 8px;
  opacity: 0.3;
  transition: width 0.3s ease, opacity 0.2s ease;
}

.panel:hover {
  width: 320px;
  opacity: 1;
}
```

**Recommended for Teams**: Width-based, as the layout likely uses flexbox and `transform` could cause overlap issues.

### 7.4 MutationObserver Pattern

```javascript
function waitForElement(selector, callback, maxWaitMs = 15000) {
  // Check if already exists
  const existing = document.querySelector(selector);
  if (existing) { callback(existing); return; }

  const observer = new MutationObserver((mutations, obs) => {
    const el = document.querySelector(selector);
    if (el) {
      obs.disconnect();
      callback(el);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  setTimeout(() => {
    observer.disconnect();
    console.warn('[Teams AutoHide] Timed out waiting for:', selector);
  }, maxWaitMs);
}
```

**Why needed**: Teams is a React SPA. When the page first loads, `document-idle` may fire before the React component tree renders the chat panel. `MutationObserver` watches for DOM changes and fires the callback when the element finally appears.

### 7.5 Teams DOM Structure Notes

> These are general patterns — verify in DevTools as Teams updates frequently.

```
<body>
  └── [Teams app root — check for id="app" or data-tid="app"]
      └── Layout wrapper (flex row)
          ├── Left navigation rail (narrow icon bar)
          │   └── data-tid="app-layout-left-rail" or similar
          ├── Chat list panel  ← THIS IS YOUR TARGET
          │   └── data-tid="app-layout-area--main" or similar
          └── Main conversation view (right side)
```

**Attributes to look for (as of 2024-2025):**

| Attribute | Likely Values |
|---|---|
| `data-tid` on panel | `chat-pane-list`, `app-layout-area--main`, `conv-list` |
| `data-tid` on rail | `app-layout-left-rail`, `rail-nav` |
| `aria-label` | `"Chat"`, `"Conversation list"` |
| `role` | `"complementary"`, `"navigation"`, `"region"` |

**Important**: Always reverify with `document.querySelectorAll('[data-tid]')` before coding. Teams changes these values with major updates.

### 7.6 CSS Specificity and !important

Teams injects inline styles and high-specificity selectors. You may need `!important` to override them:

```css
/* Without !important — may lose to Teams' own styles */
[data-tid="panel"] { width: 8px; }

/* With !important — forces override */
[data-tid="panel"] { width: 8px !important; }
```

Use `!important` sparingly — only on the specific properties being overridden.

---

## 8. Troubleshooting Guide

### 8.1 Panel Selector Not Found

**Symptom**: Console shows timeout warning, panel does not collapse.

**Diagnosis**:
```javascript
// Run in DevTools Console to check all data-tid values
[...document.querySelectorAll('[data-tid]')]
  .map(el => el.getAttribute('data-tid'))
  .filter((v, i, a) => a.indexOf(v) === i)  // unique
  .sort()
  .forEach(v => console.log(v));
```

**Fixes**:
- [ ] Teams updated and changed `data-tid` values → re-run Phase 1 investigation
- [ ] Script runs before Teams renders → increase `maxWaitMs` in `waitForElement`
- [ ] Use a fallback selector strategy (try multiple selectors in sequence):
  ```javascript
  const SELECTORS = [
    '[data-tid="chat-pane-list"]',
    '[data-tid="app-layout-area--main"]',
    '[aria-label="Chat"]',
  ];
  const panel = SELECTORS.reduce((found, sel) =>
    found || document.querySelector(sel), null);
  ```

### 8.2 CSS Override Not Working (Width Not Changing)

**Symptom**: Script runs, panel found, but panel width does not change visually.

**Diagnosis**:
- [ ] In DevTools → Elements → select panel → Styles tab
- [ ] Check if your rule appears (search for `teams-autohide` or your selector)
- [ ] If rule appears but is crossed out: specificity conflict → add `!important`
- [ ] If rule does not appear: `GM_addStyle` may not be injecting — check Tampermonkey `@grant` line

**Fix**:
```javascript
// Verify GM_addStyle is working
GM_addStyle(`body { outline: 5px solid red !important; }`);
// If red outline appears, GM_addStyle is working
// Then narrow down your selector issue
```

### 8.3 Auto-Hide Breaks After SPA Navigation

**Symptom**: After clicking "Calendar" or another section and returning to "Chat", the panel no longer collapses.

**Cause**: Teams unmounts and remounts the chat panel React component, removing your JS modifications.

**Fix**: Re-observe after navigation using a URL-change watcher:

```javascript
let lastUrl = location.href;

new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    log('URL changed, re-initializing...');
    // Re-run your waitForElement logic
    waitForElement('[data-tid="YOUR_PANEL_TID"]', (panel) => {
      log('Panel re-found after navigation');
      // Re-apply JS behavior
    });
  }
}).observe(document.body, { childList: true, subtree: true });
```

**Note**: CSS injected via `GM_addStyle` is persistent and should re-apply automatically. Only JS-applied behaviors (event listeners, classes) need re-attachment.

### 8.4 CSP (Content Security Policy) Blocking Script

**Symptom**: DevTools Console shows `Content Security Policy: The page's settings blocked the execution of an inline script`.

**Context**: Teams may have CSP headers that block inline script injection.

**Diagnosis**: Check DevTools Console for CSP errors after page load.

**Tampermonkey workaround**: Tampermonkey scripts run in a privileged sandbox and are generally NOT blocked by page-level CSP. If errors appear:
- [ ] Verify Tampermonkey is using the correct injection mode (Settings → General → Script Injection Mode → `Instant`)
- [ ] Try `@run-at document-start` instead of `document-idle`
- [ ] Report to Tampermonkey GitHub if behavior persists — this is a known category of issues

### 8.5 Toggle Button Not Visible

**Symptom**: Toggle button does not appear on hover.

**Diagnosis**:
- [ ] Confirm `createToggleButton(panel)` is called inside the `waitForElement` callback
- [ ] Check if `#teams-autohide-toggle` exists in DOM: `document.getElementById('teams-autohide-toggle')`
- [ ] Check z-index conflicts: Teams may overlay the button area
  - Fix: increase `z-index` to `99999`
- [ ] Check if panel `position` is `relative` or `absolute` (button uses `position: absolute`)
  - Fix: explicitly set `panel.style.position = 'relative'`

### 8.6 Script Causes Teams Layout to Break

**Symptom**: Main conversation area is misaligned, overlapping, or the page looks broken.

**Cause**: Collapsing the panel width may affect the parent flexbox layout, pushing the main view into unexpected positions.

**Diagnosis**: Open DevTools with script disabled vs. enabled, compare layout.

**Fix options**:
- [ ] Instead of setting `width: 8px`, use `transform: translateX(-Npx)` to move off-screen without affecting layout flow
- [ ] Set `position: absolute` on the panel to take it out of flow (risky — may cause other issues)
- [ ] Add CSS to the parent container to compensate:
  ```css
  [data-tid="PARENT_CONTAINER"] {
    transition: padding-left 0.3s ease;
  }
  ```

### 8.7 Microsoft Teams Update Breaks Selectors

**Symptom**: Script worked before but stops working after Teams auto-updates.

**This will happen** — Teams updates frequently.

**Mitigation**:
- [ ] Use `data-tid` attributes (most stable) over class names
- [ ] Maintain a fallback selector list (see 8.1)
- [ ] Add a `@version` update mechanism — bump version and re-test after major Teams updates
- [ ] Watch for Teams update announcements: https://support.microsoft.com/en-us/office/what-s-new-in-microsoft-teams

**When it breaks**:
1. Open Teams web app in Chrome
2. Run Phase 1 DOM investigation again (Section 3)
3. Update the selector in the script
4. Bump version in metadata (`0.1.0` → `0.1.1`)
5. Re-test, re-commit

---

## 9. Future Enhancements

### v1.1 — Persistence

- [ ] Remember pin/unpin state across page reloads using `GM_setValue`/`GM_getValue`
  ```javascript
  // Save state
  GM_setValue('panelPinned', isPinned);
  // Restore state
  const savedPin = GM_getValue('panelPinned', false);
  ```
- [ ] Save preferred panel width (in case user resizes it manually)

### v1.2 — Keyboard Shortcut

- [ ] Add keyboard shortcut to toggle pin state (e.g., `Alt+P` or `Ctrl+Shift+H`):
  ```javascript
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'p') {
      togglePin();
    }
  });
  ```
- [ ] Show brief visual notification when shortcut is triggered

### v1.3 — Settings Panel

- [ ] Add a small settings UI (accessible via button or keyboard shortcut) allowing user to configure:
  - [ ] Sliver width (default: 8px)
  - [ ] Expanded width (default: 320px)
  - [ ] Transition duration (default: 0.3s)
  - [ ] Transition easing (ease, linear, ease-in-out)
  - [ ] Hover delay (ms before collapse/expand triggers)
- [ ] Store settings with `GM_setValue`

### v1.4 — Hover Delay

- [ ] Add configurable delay before collapsing (prevents accidental collapse when mouse briefly leaves):
  ```javascript
  let collapseTimer;

  panel.addEventListener('mouseleave', () => {
    collapseTimer = setTimeout(() => {
      if (!isPinned) panel.classList.add('collapsed');
    }, 500); // 500ms delay
  });

  panel.addEventListener('mouseenter', () => {
    clearTimeout(collapseTimer);
    panel.classList.remove('collapsed');
  });
  ```

### v2.0 — Firefox / Greasemonkey Support

- [ ] Test script with Greasemonkey on Firefox
- [ ] Adjust metadata for cross-browser compatibility:
  ```javascript
  // @grant        GM.addStyle    // Greasemonkey 4+ async API
  // @grant        GM_addStyle    // Tampermonkey / older Greasemonkey
  ```
- [ ] Add polyfill for `GM_addStyle` fallback:
  ```javascript
  if (typeof GM_addStyle === 'undefined') {
    function GM_addStyle(css) {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    }
  }
  ```

### v2.1 — Right Panel Support

- [ ] Extend the script to optionally hide the right-side "People" or "Details" panel as well
- [ ] Separate toggle controls for left and right panels

### v2.2 — Auto-Detection of Selector

- [ ] On script startup, try a list of known selectors in priority order
- [ ] Log which selector was matched
- [ ] If none match, show a DevTools warning with troubleshooting instructions

### v2.3 — Greasy Fork / OpenUserJS Publication

- [ ] Create account on https://greasyfork.org
- [ ] Publish script publicly so others can benefit
- [ ] Add `@updateURL` and `@downloadURL` pointing to raw GitHub URL
- [ ] Set up GitHub releases for versioned updates

---

## Completion Checklist

- [ ] Phase 1 complete — stable selectors identified and documented
- [ ] Phase 2 complete — script written and structured correctly
- [ ] Phase 3 complete — all tests passing, no side effects
- [ ] Phase 4 complete — GitHub repo created, code pushed
- [ ] Script is working in daily use
- [ ] Version `0.1.0` tagged in git

---

*Last updated: 2026-02-27*
*Teams tested on: (fill in date)*
*Script version: 0.1.0 (planned)*
