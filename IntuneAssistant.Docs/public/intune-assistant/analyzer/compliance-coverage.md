# Compliance Coverage

## What it does

If your tenant has the Intune setting **"Mark devices with no compliance policy assigned as"** set to **Not compliant**, a device that no compliance policy reaches becomes noncompliant through a built-in rule. Intune tells you *that* a device has no compliance policy, not *why*.

Compliance Coverage answers the why. For every device Intune reports as missing a compliance policy, it works through each compliance policy in your tenant the way you would by hand: does the policy's assignment reach the device or its user, does an exclusion apply, does an assignment filter let the device through? Every result rests on evidence (a matched or unmatched group, an exclusion, a filter outcome), never on a guess.

It covers Windows, iOS, Android and macOS devices.

## How to use it

1. Go to **Check > Compliance coverage**.
2. Select **Run Analysis**. This starts Intune's own "devices without a compliance policy" report, waits for it and then checks every device it lists. The page shows progress; depending on the number of devices and policies this takes a few seconds to a few minutes. **Cancel** stops the run and removes everything gathered so far.
3. When it finishes, you see how many devices were found, a count per result and the list of devices. Filter by result or platform, or search for a device or user.
4. Select a device row to unfold the reasoning for every compliance policy that was checked against it.

## What you'll see

Each device gets one overall result and a result per compliance policy:

| Result | What it means |
|--------|--------------|
| **ShouldApplyButMissing** | A policy's assignment reaches this device, with no exclusion or filter in the way, yet Intune does not apply it. This is the case to escalate: check the device's check-in history, enrollment state or recent assignment changes. |
| **NotTargeted** | Neither the device nor its user is in scope of any compliance policy's assignment. Usually the real explanation: nothing assigns a compliance policy to this device or user yet. |
| **Excluded** | An assignment would apply, but the device or user is in an exclusion group of that policy. |
| **FilteredOut** | An assignment would apply, but its assignment filter does not let this device through. |
| **Unknown** | Something could not be verified, usually a group whose members could not be read or a filter rule this analysis does not support yet. It is never treated as "not applicable". |

A device without a primary user gets an extra note: an assignment to a user group never reaches a device nobody signs in to. A shared device needs a device-based assignment (a device group, or All Devices).

## Requirements

It needs permission to read managed devices, device configuration and groups in Intune, which Intune Assistant already asks for. There is nothing to set up.

## Common questions

**Why does a run take a while?** It reads every compliance policy with its assignments, every assignment filter, and the group memberships of every device (and its user) in the report. Policies, assignments and filters are read once per run, not once per device.

**A device shows Unknown for a policy. What now?** Most often one of the policy's groups has hidden membership, which needs a permission Intune Assistant does not ask for. Check that group's members in Intune.

**Does it change anything?** No. It only reads: it never changes an assignment, group, filter or device.

**Is my device data kept afterwards?** No. The result is shown while you look at the page and is then discarded; nothing about which devices were found, or why, is stored. Cancelling a run removes what was gathered so far.
