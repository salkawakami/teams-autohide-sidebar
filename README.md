# Teams Auto-Hide Left Sidebar

A Tampermonkey userscript that auto-hides the Microsoft Teams left chat panel to save screen space.

## How it works

| State | Trigger | Result |
|-------|---------|--------|
| Hidden | Page load | Panel collapses to a 4px sliver |
| Revealed | Hover over left edge | Panel slides open (320px) |
| Auto-hides | Mouse leaves panel | Panel collapses back |
| Pinned | Click 📍 button | Panel stays open permanently |
| Unpinned | Click 📌 button | Back to hover mode |

## Installation

1. Install [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) for Chrome
2. Open Tampermonkey Dashboard → click the **+** tab
3. Delete the placeholder code and paste the contents of [`teams-autohide-sidebar.user.js`](./teams-autohide-sidebar.user.js)
4. Press `Cmd+S` to save
5. Refresh `https://teams.microsoft.com`

## Requirements

- Chrome + Tampermonkey extension
- Microsoft Teams web app (`https://teams.microsoft.com`)

## Known limitations

- Selectors are based on Teams DOM as of **2026-02-27**. If Teams updates and breaks the script, re-investigate the `data-tid` attributes via DevTools and update the selector in the script.
- Desktop Teams app is not supported — web app only.

## License

MIT
