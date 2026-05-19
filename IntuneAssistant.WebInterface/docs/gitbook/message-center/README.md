# Message Center

## What Is the Message Center?

The **Message Center** is where the IntuneAssistant platform communicates directly with you. It carries platform-wide announcements from the IntuneAssistant team — scheduled maintenance windows, newly released features, security-related warnings, and general information messages.

Messages are **filtered by your license server-side**. This means you only ever see messages that are relevant to your subscription level and the features you have access to. There is nothing to configure — the right messages arrive automatically.

Read and unread state is tracked **in your browser**. No personal preference data is sent to the server. When you mark a message as read or unread, that choice is stored locally and survives page navigation within the same session and across sessions on the same browser.

---

## Why Would You Use This?

- You want to know whether the platform has scheduled downtime before you run a large bulk operation
- You spotted a new feature in the navigation and want to understand what it does
- You received a warning indicator on your avatar and want to see what it refers to
- You are handing over a tenant to a colleague and want to make sure they are aware of any active notices

---

## How to Get There

Navigate to **Message Center** using any of these routes:

| Entry point | How |
|---|---|
| **Sidebar menu** | Expand the user section at the bottom of the sidebar and click **Message Center** |
| **Avatar badge** | When unread messages exist, a pulsing orange dot appears on your avatar — click it to open the user menu, then click **Message Center** |
| **User dropdown** | Click your name or avatar at the bottom of the sidebar → **Message Center** in the dropdown |

---

## The Unread Indicator

Whenever you have unread messages, IntuneAssistant surfaces a visual indicator in three places simultaneously so you never miss an important notice:

| Location | What You See |
|---|---|
| **Avatar (sidebar trigger)** | A pulsing orange dot at the top-right corner of your avatar circle |
| **Display name row (expanded sidebar)** | A small orange pill showing the unread count next to your name — e.g. `3` |
| **Message Center item in the dropdown** | A `Bell` icon with an orange count badge inline — e.g. `Message Center  3` |

All three indicators disappear as soon as `unreadCount` reaches zero, which happens automatically when you mark all messages as read.

> 📸 _[Screenshot placeholder: Sidebar bottom section showing an avatar with a pulsing orange dot, the user's display name with an orange count pill reading "2", and below it the open dropdown showing the Bell icon and "Message Center  2" menu item]_

---

## Page Layout

The Message Center page is divided into three areas: the page header, the filter tabs, and the message list.

### Page Header

The header shows the page title and the total unread count. When unread messages exist, an orange pill appears directly after the title text — for example, **Message Center `4`**.

A **Refresh** button on the right re-fetches messages from the API immediately. This is useful if you have been told that a new message has been published and it has not appeared yet.

---

## Filter Tabs

Six tabs let you narrow the list to exactly the messages you are interested in:

| Tab | What It Shows |
|---|---|
| **All** | Every message available to your account, regardless of read state or type |
| **Unread** | Only messages you have not yet marked as read — the orange count matches the avatar badge |
| **Maintenance** | Only scheduled maintenance notices |
| **Feature** | Only feature announcements |
| **Warning** | Only warning messages requiring your attention |
| **Information** | Only general information messages |

Each tab shows a live count badge next to the label. The **Unread** count badge is orange; all others are muted grey. Switching tabs clears any active selection.

> 📸 _[Screenshot placeholder: Tab bar showing All (12), Unread with orange badge (4), Maintenance (2), Feature (3), Warning (1), Information (6) — with the Unread tab active and underlined in the primary colour]_

---

## Message Cards

Each message is displayed as a card with a coloured left border that immediately communicates its type. The colour coding is consistent across the entire application:

| Type | Left border | Background tint | Icon |
|---|---|---|---|
| **Information** | Blue | Light blue | ℹ️ Info circle |
| **Warning** | Amber | Light amber | ⚠️ Alert circle |
| **Maintenance** | Purple | Light purple | 🔧 Wrench |
| **Feature** | Green | Light green | ⚡ Zap |

### What Each Card Shows

| Element | Description |
|---|---|
| **Title** | The message headline in bold |
| **Type badge** | Small inline badge showing `Information`, `Warning`, `Maintenance`, or `Feature` |
| **Description** | The full message body — multi-line text is preserved as written |
| **Timestamp** | Relative time — e.g. `3 hours ago`, `2 days ago` |
| **Expiry date** | If the message has an expiry, shown as `Expires 25 May 2026`. Warning expiry dates are highlighted in amber to draw attention |
| **Unread dot** | A small filled orange circle at the top-right corner — present on unread messages, absent once read |

> 📸 _[Screenshot placeholder: Three message cards stacked vertically — a purple Maintenance card titled "Scheduled Maintenance Sunday 02:00 UTC" with expiry in amber, a green Feature card titled "New: Snapshot-based Monitor Creation", and a blue Information card — each with its left border, type badge, description, and relative timestamp]_

---

## Selecting Messages

Click anywhere on a card to select it. Click again to deselect. There is no separate checkbox — the entire card surface is the selection target.

**Selected state** — a primary-coloured ring wraps the card and a small animated checkmark circle appears at the top-left corner. The unread orange dot is hidden while a card is selected to avoid visual conflict.

**Select all** — a small square toggle in the toolbar (visible when the list is not empty) selects or deselects all currently visible messages at once. It reflects the current selection state: filled when all are selected, empty otherwise.

> 📸 _[Screenshot placeholder: Two cards — one selected (with blue ring and ✓ circle at top-left, no orange dot) and one unselected (with orange unread dot at top-right)]_

---

## Toolbar Actions

The toolbar appears below the filter tabs whenever the message list is not empty. It shows the selection toggle, a selection count, and the available actions.

| Button | When It Is Enabled | What It Does |
|---|---|---|
| **Mark as read** | At least one selected message is currently *unread* | Adds the selected IDs to the read list — their orange dots disappear |
| **Mark as unread** | At least one selected message is currently *read* | Removes the selected IDs from the read list — their orange dots reappear |
| **Mark all as read** | `unreadCount > 0` (regardless of selection) | Marks every message in the current list as read in one action |

Both **Mark as read** and **Mark as unread** can be enabled at the same time when your selection contains a mix of read and unread messages. After either action the selection is cleared automatically.

> 📸 _[Screenshot placeholder: Toolbar showing the select-all toggle (partially filled), the text "3 selected", and three buttons — "Mark as read" (active), "Mark as unread" (active), and "Mark all as read" (ghost, muted)]_

---

## States

### Loading

While the first fetch is in progress, four placeholder cards are shown. Each placeholder pulses with a gentle animation so you know data is on its way.

> 📸 _[Screenshot placeholder: Four skeleton cards with grey animated bars in place of title, description, and timestamp text]_

### Error

If the API returns an error, an inline red banner appears below the page header. The banner shows the error message text and a **Retry** button that re-triggers the fetch immediately.

The rest of the page (tabs, toolbar) is not shown until data has loaded successfully at least once.

> 📸 _[Screenshot placeholder: Red error banner reading "Failed to load messages" with a Retry button on the right]_

### Empty List

When there are no messages in the active tab, an illustration is shown with context-aware text:

| Active tab | Heading | Sub-text |
|---|---|---|
| **Unread** | All caught up! | You have no unread messages. |
| Any other tab | No messages | There are no messages in this category. |

When on a filtered tab (anything other than All), a **View all messages** link appears below the empty state text to help you navigate back without using the tabs.

> 📸 _[Screenshot placeholder: Empty state on the Unread tab — a large megaphone icon, "All caught up!" heading, "You have no unread messages." sub-text, and a "View all messages" ghost button below]_

---

## How Read State Works

Read and unread state is stored entirely in your browser's `localStorage` under the key `ia_message_center_read_ids`. The value is a JSON array of message UUID strings.

**What this means in practice:**

- Marking a message as read on your laptop does not affect how it appears on your phone or in another browser
- Clearing your browser data resets all read state — all messages will appear unread again
- The platform never knows which messages you have or have not read

The unread count shown on your avatar, in your display name row, and in the Message Center dropdown item is always calculated live from this local list against the messages currently returned by the API.

