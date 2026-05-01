# Configuration Management

## What Is This Section?

The **Configuration Management** section of Intune Assistant gives you a complete, unified workspace to understand every configuration policy in your Microsoft Intune environment. It goes far beyond what the native Intune portal shows you — surfacing not just what policies exist, but what settings they contain, whether those settings are duplicated across policies, and whether any of them actively conflict with each other.

This section is built for everyone who needs to understand the configuration state of a managed environment:

- **IT Administrators** who manage day-to-day Intune operations and need quick answers about which policies do what
- **Architects** who design the policy structure and need to verify it is clean, consistent, and optimised
- **Security Engineers** who need to audit that the correct settings are enforced and that no two policies are fighting each other
- **CISOs and Compliance Officers** who need evidence that the right controls are in place, across all platforms and policy types

---

## Why Does This Section Exist?

Microsoft Intune has grown to support several different ways of configuring devices: the modern **Settings Catalog**, the older **Device Configuration** profiles, and **Group Policy** ingested via ADMX or Group Policy Analytics. Over time, most organisations accumulate policies across all three of these systems — often without a clear overview of how they relate to each other.

The result is a configuration landscape that is hard to audit:

- The same setting might be configured in a Settings Catalog policy and again in an old Device Configuration profile — possibly with different values
- Policies may have no assignments, meaning they exist in the tenant but apply to nobody
- New policies may be created without checking whether a setting is already covered elsewhere

Intune Assistant solves this by pulling all policies and their settings into a single view, running automated duplicate and conflict detection, and giving you the filters and export tools to act on what you find.

---

## What Is Available

### [Intune Policy Overview](./policies.md)

A full inventory of every configuration policy in your tenant. See the policy name, type, platform, assignment status, number of settings, and all assignment targets — including which groups are included and which are excluded. You can select multiple policies and export or delete them in bulk.

**Use this when you want to know:** What policies exist? Are they all assigned? When were they last changed?

---

### [Policy Settings Overview](./settings.md)

A granular, setting-by-setting breakdown across all three policy types: Settings Catalog, Device Configuration, and Group Policy. Each setting is shown with its name, value, source policy, platform, and assignment status. The page automatically detects **duplicate settings** (the same setting configured in multiple policies with the same value) and **conflicting settings** (the same setting configured with different values across policies that target overlapping groups).

**Use this when you want to know:** What does each individual setting do? Are there any settings I have configured twice? Are any settings set to different values in different policies?

---

## How the Two Pages Work Together

Think of the two pages as two layers of the same information:

| Layer | Page | What It Answers |
|---|---|---|
| **Policy layer** | Policy Overview | Which policies exist, what type they are, whether they are assigned |
| **Setting layer** | Settings Overview | What is inside each policy, and whether any settings clash |

Start with the **Policy Overview** for a broad inventory. Drill into the **Settings Overview** when you need to understand what is actually being configured and whether it is consistent.

---

## Getting Started

1. Navigate to **Configuration** in the sidebar
2. Click **View Policy Overview** to load your policy inventory, or
3. Click **Explore Now** on the Settings card to load the granular settings view
4. Use the filter and export options on each page to work with the data

> 💡 **Tip:** Both pages fetch data in real time from Microsoft Graph. If you have a large number of policies, the settings page shows a progress bar with three steps — Settings Catalog, Device Configuration, and Group Policy — so you can see exactly what is loading.

---

## Related Sections

- [Assignments](../assistant/assignments/README.md) — see which groups your configuration policies are assigned to
- [Conditional Access](../conditional-access/README.md)
- [Devices Overview](../devices/README.md)

