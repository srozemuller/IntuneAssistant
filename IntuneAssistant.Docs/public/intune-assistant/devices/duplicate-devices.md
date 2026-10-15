# Duplicate Devices

## What it does

Duplicate Devices scans your Intune-managed device fleet and flags devices that are actually the same physical hardware enrolled more than once. This commonly happens after a device is re-imaged, re-enrolled, or renamed — Intune ends up with two (or more) managed device records that both belong to one laptop or phone.

Detection is based on hardware identity, not the device name — a device can be renamed at any point without breaking detection. Devices are grouped together when they share the same:

* **Serial number**
* **Wi-Fi MAC address**

Placeholder or blank values (for example a virtual machine's default serial number, or an all-zero MAC address) are ignored so they don't get lumped together as false duplicates.

## How to use it

1. Navigate to **Devices > Duplicate Devices** in the sidebar.
2. Click **Scan for Duplicates** to run the scan across your device fleet.
3. Devices that were matched to another device are tagged **Duplicate** in the list. Use the **Show duplicates only** toggle to hide everything else.
4. Click **View Duplicates** on a tagged device to open its duplicate group — a side-by-side view of every device that matched.
5. From the group view, click the trash icon next to a device to remove it.

{% hint style="danger" %}
Removing a device deletes its record from both **Intune** and **Entra ID**. This cannot be undone — make sure you're removing the stale duplicate, not the device that's actually still in use.
{% endhint %}

## What you'll see

The scan shows three summary numbers: total devices scanned, how many are duplicates, and how many duplicate groups were found.

Each duplicate device is tagged with a **Duplicate** badge and a **Matched On** indicator showing whether it was grouped by serial number, Wi-Fi MAC address, or both. Opening a group shows every device in it with its compliance state, last sync time, serial number, and Wi-Fi MAC address, so you can tell which one to keep before removing the others.

## Requirements

Scanning and viewing duplicate devices is available to any active IntuneAssistant account.


## Common questions and tips

**Why isn't a device I know is duplicated showing up?**
Detection relies on the device reporting a serial number or Wi-Fi MAC address to Intune. Devices without either — or with only a placeholder value — can't be matched and won't be flagged, even if they're the same hardware.

**Why is a device grouped with others that don't look related?**
Matching is based purely on serial number and Wi-Fi MAC address, not device name. If two seemingly unrelated device names share a group, it usually means the same physical machine was re-enrolled under a different name.

## Related Pages

* [Device Compare](device-compare.md)
