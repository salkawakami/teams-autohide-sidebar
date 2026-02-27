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

(function () {
  'use strict';

  GM_addStyle(`
    /* HIDE: collapse chat list panel by default */
    [data-tid="app-layout-area--mid-nav"] {
      width: 4px !important;
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

    /* PIN BUTTON: visible only when panel is hovered or pinned */
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

  const PANEL_SELECTOR = '[data-tid="app-layout-area--mid-nav"]';
  const PIN_CLASS = 'teams-autohide-pinned';
  let isPinned = false;

  function addPinButton(panel) {
    if (document.getElementById('teams-autohide-pin-btn')) return;

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
    });

    panel.appendChild(btn);
  }

  function init() {
    const panel = document.querySelector(PANEL_SELECTOR);
    if (panel) {
      addPinButton(panel);
    } else {
      const observer = new MutationObserver(() => {
        const p = document.querySelector(PANEL_SELECTOR);
        if (p) {
          observer.disconnect();
          addPinButton(p);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => observer.disconnect(), 15000);
    }
  }

  init();

  // Re-init on SPA navigation (Teams unmounts/remounts components)
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      isPinned = false;
      setTimeout(init, 500);
    }
  }).observe(document.body, { childList: true, subtree: true });

})();
