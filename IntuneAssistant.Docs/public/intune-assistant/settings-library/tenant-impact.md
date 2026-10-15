# Tenant impact

## What it does

Tenant impact turns the Settings Library into an early-warning system for your own configuration. It answers: *which settings in my policies are deprecated or removed, what does that mean, is there a replacement, what changed since I last looked, which policies do nothing, and which settings can't apply to my devices?*.

Intune itself tells you none of this until something breaks on a device.

## How to use it

1. Open **Settings Library → Tenant Impact**. The box at the top right shows when your tenant was last harvested and how many devices it covers. **Harvest again** starts a new harvest and brings you back here when it is done. The first time, the same button harvests your tenant (see [Tenant usage](tenant-usage.md)).
2. Start with **severity**. Click **High**, **Medium** or **Low** to keep only those findings. High means something is already gone or broken, Medium means it will break or deviates, Low is worth a look.
3. Click a **rule tile** to focus on one kind of finding. The numbers on the tiles follow your other filters, so you always see what is left.
4. Narrow down with the toolbar: search by setting or policy name, pick a platform or a single policy, and switch on **Assigned only** (skip policies that reach nobody), **Replacement known** (what you can fix today) or **New since harvest**.
5. Change the angle with **Group by**:
   - **Rule** — what kind of problem it is.
   - **Policy** — which policy needs work, worst first. This is the view to plan your changes from.
   - **Severity** — what to do first.
6. Click a group to open it and a finding to see the detail: Microsoft's own explanation, the replacement, the affected policies with their assignments, and a link to the setting.
7. **Export these** downloads exactly what you filtered as a CSV file, for a change ticket or a colleague.

## What you'll see

- **Deprecated settings in use** — with Microsoft's own sentence about what happens ("will be removed in a future release", "doesn't work after Edge 109") and, where Microsoft names one, a green **Use instead** box linking to the replacement setting. The same box appears on the deprecated setting's own page.
- **Removed / missing settings in use** — settings that are gone from the catalog but still sit in your policies.
- **Changed since your harvest** — a setting you use that Microsoft changed after you last harvested, with the changed properties.
- **Baseline gap** — settings a Microsoft baseline recommends that you set differently or in no policy at all. Only for baselines you follow (see [Baseline coverage](baseline-coverage.md)) and only for platforms you have devices on. Following a baseline with your own Settings Catalog policies is fine and never rates above Low; a deviation inside a baseline you adopted rates Medium.
- **Unassigned policies** — policies whose settings reach no device or user.
- **Devices below the minimum build / above the maximum build** — a setting that needs a newer (or older) Windows build than some of your devices run, with the count and the offending versions. Those devices silently ignore the setting while the policy reports success.
- **Baselines not fully applied** — for each Microsoft security baseline: how many of its settings you don't configure and how many you set differently from the recommendation, with a link to the setting-by-setting view on the baseline's page. When Microsoft publishes a new baseline version, this is the gap against *your* configuration, not against the previous version.

Each finding lists the policies involved with their assignments and links to the policy in the Intune admin center.

## Requirements

- Any active Intune Assistant account.
- The harvest additionally reads your managed devices' OS versions (device names and identities are not stored — only how many devices run each version). If that read is not permitted, the build-version rules are skipped and the page says so.

## Common questions

**Why does a finding say "since your harvest"?** Microsoft deprecated or changed the setting after you last harvested. Harvest again to refresh the rest of the picture.

**Where does the replacement come from?** From Microsoft's own description of the deprecated setting. It is shown with *High* confidence because the sentence is Microsoft's while the match to a catalog setting is automatic — check it before you migrate.

**Why is a baseline I never rolled out not in the list?** Baseline gaps are only reported for baselines you follow, with a baseline policy or with your own Settings Catalog policies, and for platforms you have devices on. See [Baseline coverage](baseline-coverage.md) for how that is decided and what it cannot see yet.
