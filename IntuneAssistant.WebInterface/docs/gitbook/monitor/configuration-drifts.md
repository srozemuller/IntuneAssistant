# Configuration Drifts

## What Is This Page?

The **Configuration Drifts** page is a complete, filterable view of every configuration drift that has been detected across all your monitors. A drift is recorded each time the live state of a monitored resource differs from the baseline that you or your team defined as correct.

The page shows both **active** drifts (deviations that still exist in your environment) and **fixed** drifts (deviations that have since been corrected, either by reverting the change or by accepting the new state as the baseline). It also gives you the ability to **accept** a drift directly from this page — promoting the current state to become the new desired baseline with a recorded justification.

---

## Why Would You Use This?

- You want to know at a glance whether any monitored resources have deviated from their desired configuration
- You received an alert that a drift was detected and want to investigate the specific properties that changed
- A change was made intentionally and you want to formally accept the new state as the baseline so the drift no longer appears as an issue
- You are preparing a compliance review and need a record of all configuration changes and how they were handled
- You want to filter drifts by a specific monitor, resource type, or status to focus on a subset of your environment

---

## How to Get There

Navigate to **Monitor → Configuration Drifts** in the sidebar.

---

## How to Load the Data

1. Navigate to **Monitor → Configuration Drifts**
2. Click **Load Drifts**
3. Intune Assistant fetches all monitor configurations and all drifts simultaneously
4. The statistics cards and drift list populate once both data sources have responded

> ❌ **Cancel:** A **Cancel** button appears while loading is in progress. Clicking it stops the request immediately and shows a retry card.

> 🔄 **Refresh:** Once data is loaded, the **Load Drifts** button is replaced by a **Refresh** button. Clicking it re-fetches both monitors and drifts without clearing the current view first.

> 📸 _[Screenshot placeholder: Page in initial state showing the welcome card with a database icon, a description, and the Load Drifts button]_

---

## Statistics Cards

Once data is loaded, five summary cards appear at the top of the page. These give you an instant overview without needing to read the full list.

| Card | What It Shows |
|---|---|
| **Total Drifts** | Total number of drifts across all monitors and all statuses |
| **Active Drifts** | Number of drifts with `active` status — deviations that still exist in your environment |
| **Fixed Drifts** | Number of drifts with `fixed` status — deviations that have been resolved |
| **Total Monitors** | Total number of configuration monitors configured in your tenant |
| **Monitors with Drifts** | Number of distinct monitors that have at least one drift recorded against them |

> 📸 _[Screenshot placeholder: Five gradient statistics cards in a row — amber (Total Drifts: 8), red (Active Drifts: 5), green (Fixed Drifts: 3), blue (Total Monitors: 4), orange (Monitors with Drifts: 3)]_

---

## Filters

Three filters are available to narrow the drift list. They are hidden by default behind a collapsible **Filters** panel — click the **Filters** header to expand them.

| Filter | What It Does |
|---|---|
| **Monitor** | Multi-select — show only drifts belonging to one or more specific monitors |
| **Status** | Multi-select — show only `Active` drifts, only `Fixed` drifts, or both |
| **Resource Type** | Multi-select — show only drifts for a specific resource type (e.g. `microsoft.entra.group`) |

A badge next to the Filters header shows how many filters are currently active. A **Clear All** button appears whenever at least one filter is set; clicking it resets all three filters at once.

The result count updates live: `Showing X of Y drifts`.

> 📸 _[Screenshot placeholder: Filters panel expanded showing three multi-select dropdowns — Monitor with two items selected, Status dropdown open showing Active checked, Resource Type empty — and the Clear All button at the top right of the card]_

---

## Drift Cards

Each drift is rendered as an expandable card. The card header is always visible; the property diff section expands on demand.

### Card Header (always visible)

| Element | What It Shows |
|---|---|
| **Resource name** | The display name of the resource in the baseline (e.g. `AADGroup-AAD_Teams_rooms`) |
| **Status badge** | `Active` in red with a warning icon, or `Fixed` in green with a check icon |
| **Monitor name** | The name of the monitor that detected this drift, shown in muted text below the resource name |
| **Accept Drift button** | Shown only for active drifts — opens the [Accept Drift dialog](#accepting-a-drift) |
| **Expand / Collapse** | A chevron button at the far right toggles the detail section |

### Card Summary Row (always visible)

Below the header, four summary cells show the most important facts at a glance:

| Cell | What It Shows |
|---|---|
| **Resource Type** | The type string from the API (e.g. `microsoft.entra.group`) |
| **Properties Changed** | The number of drifted properties within this drift record |
| **Detected** | The date the drift was first reported, formatted as a local date |
| **Show / Hide Details** | An inline button to toggle the expanded diff view |

### Expanded Property Diffs

Clicking **Show Details** or the chevron expands the card to show a full diff for each drifted property.

Each property is displayed in a labelled box with two columns side by side:

| Column | Label | What It Shows |
|---|---|---|
| Left | **Current Value** | The actual live value of the property at the time the drift was detected |
| Right | **Desired Value** | The value the baseline says this property should have |

Both values are displayed as formatted code. If a value is a list (array), each item is rendered as a code-formatted string. This makes it easy to read multi-item properties such as group membership lists or policy setting arrays.

> 📸 _[Screenshot placeholder: Expanded drift card for `AADGroup-AAD_Teams_rooms` showing one drifted property `MemberOf`. Left column Current Value shows four group name badges; right column Desired Value shows one group name badge. The card has an amber Accept Drift button in the top right]_

---

## Accepting a Drift

Accepting a drift tells Intune Assistant that the **current state is correct** and the baseline should be updated to match it. This is appropriate when a change was intentional — for example, a group membership was updated as part of a planned rollout — and you no longer want the monitor to report it as a deviation.

> ⚠️ **This action is irreversible through the UI.** Once accepted, the baseline is updated on the server and the drift will no longer appear as active. A new drift will only be raised if the resource changes again in the future.

### How to Accept a Drift

1. Locate the active drift you want to accept in the drift list
2. Click the **Accept Drift** button (amber, with a shield icon) on the card header
3. The **Accept Drift** dialog opens
4. Review the property changes shown in the dialog
5. Enter a justification (required, minimum 10 characters)
6. Click **Accept Drift** to submit

### The Accept Drift Dialog

The dialog is divided into three sections:

#### 1 — Resource Summary Banner

A highlighted amber banner at the top of the dialog shows the resource name, a resource type badge, and the number of properties that will be updated in the baseline. This is a read-only confirmation of what is about to change.

| Element | What It Shows |
|---|---|
| **Resource name** | The display name from the baseline (e.g. `AADGroup-AAD_Teams_rooms`) |
| **Resource type badge** | A human-readable label — e.g. `microsoft.entra.group` renders as `Entra Group` |
| **Property count** | `N properties will be updated in the baseline` |

#### 2 — Property Changes

Each drifted property is shown as a diff panel with three columns:

| Column | Colour | What It Shows |
|---|---|---|
| **Desired (baseline)** | Green | The value currently stored in the baseline — what was previously considered correct |
| **→** | Amber arrow | Direction of change |
| **Current (actual) → new baseline** | Amber | The live value that will become the new baseline after accepting |

Values are rendered intelligently:
- **Array values** are shown as individual pill badges (e.g. group names, policy settings)
- **Simple values** are shown as monospace text
- **Null / empty** values are shown as a greyed-out italic label

#### 3 — Justification (required)

| Element | Detail |
|---|---|
| **Field type** | Multi-line text area |
| **Required** | Yes — the Accept Drift button is disabled until the justification has at least 10 characters |
| **Maximum length** | 500 characters |
| **Character counter** | Live counter shows `N / 500` in the bottom right of the field |
| **Validation** | If you attempt to submit with fewer than 10 characters, an inline error appears: _"Justification is required (min 10 characters)"_ |
| **Placeholder** | `Describe why this drift is being accepted as the new desired state...` |

The justification text is stored verbatim in the platform's **audit log** under the acceptance event. Write something meaningful — for example, _"MemberOf list updated as part of planned CAP003 rollout on 12 June 2026. Reviewed and approved in change #CHG-4421."_ — so the audit record is useful months later.

> 📸 _[Screenshot placeholder: Accept Drift dialog open. Top amber banner shows resource name and type badge. Below: two property diff panels side by side — left panel green background showing one group name badge (desired), right panel amber background showing four group name badges (current/new baseline). Separator. Justification textarea with placeholder text and character counter showing 0 / 500. Footer with Cancel (outline) and Accept Drift (destructive red) buttons]_

### After Accepting

| Outcome | What Happens |
|---|---|
| **Success** | The dialog closes, a green toast notification appears: `Baseline updated — drift accepted successfully`, and the drift list is automatically refreshed |
| **API error** | The dialog stays open and an inline error banner appears below the justification field with the error message from the server. The justification text is preserved so you do not have to re-enter it |
| **Network error** | The dialog stays open and shows: `Network error — please check your connection and try again.` |

> 📸 _[Screenshot placeholder: Success toast notification at the bottom right of the screen showing a green check icon and the message "Baseline updated — drift accepted successfully"]_

---

## Resource Type Labels

The API returns resource type strings in a machine-readable format. Intune Assistant automatically translates these into human-readable labels in the Accept Drift dialog and elsewhere:

| API value | Displayed as |
|---|---|
| `microsoft.entra.group` | Entra Group |
| `microsoft.graph.group` | Entra Group |
| `microsoft.intune.deviceconfiguration` | Device Config |
| `microsoft.intune.configurationpolicy` | Config Policy |
| Any other value | Displayed as-is |

---

## Audit Log Integration

Every accepted drift creates two audit log entries automatically on the server:

| Event | When It Is Written | What It Contains |
|---|---|---|
| `BaselineDriftAcceptanceStarted` | When the acceptance process begins | The drift ID, monitor ID, and the justification provided |
| `BaselineDriftAcceptanceCompleted` | When the baseline has been successfully updated | Same identifiers plus confirmation of which properties were updated |

These entries appear in the **Audit Events** section of Intune Assistant and can be searched, filtered, and exported like any other audit event. The justification text is stored as the `reason` field on the completed event.

---

## Empty and Error States

| State | What You See |
|---|---|
| **Before loading** | A welcome card with a database icon, a description, and the **Load Drifts** button |
| **Loading** | A spinning icon and the text `Loading Drifts — Fetching drift data...` |
| **Load error** | A red error banner with the error message and a **Try Again** button |
| **Cancelled** | A cancel card with a **Load Drifts** retry button |
| **No drifts after filters** | The drift list is empty — adjust or clear the active filters |
| **No drifts at all** | The welcome card is shown again (no monitors have detected any drifts) |

---

## Permissions Required

To use the Configuration Drifts page you need:
- An active Intune Assistant session (signed in with a Microsoft 365 work account)
- Access to the Monitor feature (available on licensed plans — see [Plans](https://intuneassistant.cloud/plans))
- Delegated Graph permissions to read configuration in the selected tenant (granted during the Intune Assistant consent flow)

---

_Back to: [Monitor](./README.md)_

