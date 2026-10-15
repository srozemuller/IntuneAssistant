# Group to Filter Analyzer

## What It Does

The Group to Filter Analyzer helps you identify which Azure AD dynamic groups used in Microsoft Intune can be replaced — or supplemented — by Intune Assignment Filters.

Assignment Filters are a more efficient way to target devices than dynamic groups. They evaluate at policy assignment time rather than requiring device group membership to update, which means faster targeting and less infrastructure overhead.

This tool scans all your device-based dynamic groups, compares their membership rules against Intune filter properties, and tells you which ones are candidates for conversion.

---

## How to Use It

1. Navigate to **Analyzer → Group to Filter Analyzer** in the left sidebar.
2. The page loads automatically and fetches all device-based dynamic groups alongside your existing assignment filters.
3. Review the results table. Each row represents one dynamic group.
4. Use the **search bar** to filter by group name or membership rule text.
5. Use the **Convertibility** dropdown to show only groups that are fully convertible, partially convertible, or not convertible.
6. Use the **Filter match** dropdown to show only groups that already have a matching filter, or only those that don't.
7. Click any group name to open a detail panel showing the full analysis.

---

## What You'll See

### Summary Cards

At the top of the page, five cards give you an at-a-glance overview:

| Card | Meaning |
|------|---------|
| Dynamic Groups | Total device-based dynamic groups found |
| Convertible | Groups whose full membership rule maps to filter properties |
| Partial | Groups where only part of the rule can be expressed as a filter |
| Not Convertible | Groups with no mappable properties |
| Filter Match Found | Groups where a matching filter already exists in your tenant |

### Table Columns

| Column | Meaning |
|--------|---------|
| Group Name | Clickable — opens the detail panel |
| Convertibility | Badge showing Convertible / Partial / Not Convertible |
| Existing Filter Match | Any existing filters that match, with Exact or Partial match type |
| Mappable Properties | Which group rule properties can be expressed as filter properties |
| Membership Rule | The full AAD dynamic group rule |

### Detail Panel

Clicking a group name opens a dialog showing:
- The full membership rule
- The suggested Intune filter rule (if one can be built)
- Each mappable property and its filter equivalent
- Any unmappable properties and why they can't be converted
- All existing filters that match, with their platform and match type

---

## Convertibility Explained

| Status | What It Means |
|--------|--------------|
| **Convertible** | Every clause in the membership rule maps to a supported Intune filter property. You can create a filter with an equivalent rule. |
| **Partial** | Some clauses map to filter properties, but others don't. You can create a filter for the mappable part, but it won't fully replace the group. |
| **Not Convertible** | None of the membership rule properties exist as Intune filter properties. The group cannot be converted. |

### Supported Property Mappings

| AAD Group Property | Intune Filter Property |
|--------------------|----------------------|
| `device.displayName` | `device.deviceName` |
| `device.deviceManufacturer` | `device.manufacturer` |
| `device.deviceModel` | `device.model` |
| `device.deviceOSVersion` | `device.osVersion` |
| `device.deviceOwnership` | `device.deviceOwnership` |
| `device.enrollmentProfileName` | `device.enrollmentProfileName` |
| `device.deviceTrustType` | `device.deviceTrustType` |
| `device.deviceCategory` | `device.deviceCategory` |

---

## Filter Match Types

When an existing filter in your tenant matches the suggested rule:

| Match Type | Meaning |
|------------|---------|
| **Exact** | The filter rule is identical to the suggested rule (after normalizing whitespace and casing) |
| **Partial** | The filter rule contains at least one of the suggested rule's clauses |

---

## Requirements

- **Account**: An active Intune Assistant account
- **Permissions required**: `Group.Read.All` and `DeviceManagementConfiguration.Read.All` — both delegated, admin-consented
- The page only shows **device-based** dynamic groups (membership rules that reference `device.` properties). User-based dynamic groups are excluded because Intune Assignment Filters are device-scoped.

---

## Common Questions

**Why don't I see all my dynamic groups?**
Only groups whose membership rule references device properties are shown. User-based dynamic groups (e.g. `user.department -eq "IT"`) are not relevant to Intune assignment filters and are excluded.

**Can I apply the suggested filter automatically?**
Not yet — the analyzer is read-only. Use the suggested filter rule shown in the detail panel to manually create a filter in the Intune portal.

**What if a filter already exists?**
The **Existing Filter Match** column and detail panel show you any filters that already match. If there's an exact match, you may be able to switch your assignment to use that filter immediately.

**Why is my group showing as Partial?**
Part of the membership rule uses a property that Intune filters don't support (e.g. `device.extensionAttribute1`). You'd need to keep the group for that part of the targeting, or re-evaluate whether that clause is necessary.
