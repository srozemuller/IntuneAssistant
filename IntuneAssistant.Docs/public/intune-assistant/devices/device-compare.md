# Device Compare

## What it does

Device Compare lets you pick two Intune-managed devices and see exactly where their configuration differs. It's built for the situation where two devices in the same fleet behave differently — for example, one has a shorter screensaver timeout, a different update ring, or a policy the other doesn't have — and nobody is sure why.

The comparison covers:

- **Configuration policies** — Settings Catalog, Device Configuration, Administrative Templates and Endpoint Security policies applied to each device, with their per-device status.
- **Compliance policies** — assigned compliance policies and their compliance state.
- **Enrollment configurations** — enrollment restrictions and Enrollment Status Page profiles applied to each device.
- **Installed applications** — required apps and their install state.
- **Group memberships** — which Entra groups each device belongs to.
- **Assignment filters** — which assignment filters are in play for each device.
- **Health scripts (proactive remediations)** — assigned scripts and their detection state.
- **Windows Update Ring membership** — which Feature, Quality and Driver update rings each device falls under, resolved from group membership.
- **Scope tags** — scope tags assigned to each device.

## How to use it

1. Navigate to **Devices > Device Compare** in the sidebar.
2. Use the **Left device** and **Right device** search boxes to find and select the two devices you want to compare — search by device name, user, or serial number.
3. Once both devices are selected, the comparison runs automatically.
4. Click **Export as documentation** to download the comparison as a Markdown file you can share with your team.

## What you'll see

Each device gets a summary card showing its name, primary user, and scope tags. Below that, every comparison area (Configuration Policies, Compliance Policies, Applications, and so on) is shown as its own table with one row per item and four columns: the item name, the value on the left device, the value on the right device, and a status:

- **Same** — present on both devices with the same value.
- **Different** — present on both devices but with a different status or value.
- **Only left device** / **Only right device** — assigned to one device but not the other.

Each table is searchable and sortable, so you can quickly filter down to just the differences.

For Configuration Policies and Compliance Policies, the left/right values are one of: **Compliant**, **Non-compliant**, **Error**, **Conflict**, **Remediated**, **Not applicable**, **Not assigned**, or **Unknown**. A **Conflict** status usually means the device is targeted by two overlapping policies of the same type (for example, two Windows Update Rings) — worth checking group assignments for that policy.

## Requirements

Device Compare is available to any active IntuneAssistant account. Your account needs read access to Intune devices, configuration, compliance, apps, and Entra group membership; IntuneAssistant will prompt for consent if a permission is missing.

## Common questions and tips

**Why does a policy show as "Different" instead of "Same" even though I think they're identical?**
The status reflects Intune's own per-device deployment status (for example, whether the policy has been successfully applied), not a deep diff of the policy's settings. Two devices can have the same policy assigned but be in different states if one hasn't checked in recently.

**Why do I see Update Ring entries that aren't in the Configuration Policies section?**
Update Ring membership (Feature, Quality, and Driver update profiles) is resolved separately by checking whether each device belongs to one of the groups assigned to those profiles, since Intune does not report update ring assignment per device the same way it does for other policy types.

**Can I compare more than two devices at once?**
Not yet — Device Compare is built for side-by-side, two-device comparisons. If you need to compare more devices, run multiple comparisons.

**What does the exported documentation look like?**
It's a Markdown file with a summary table for both devices followed by one table per comparison area, matching what you see on screen. You can open it in any Markdown viewer or paste it into a wiki page.
