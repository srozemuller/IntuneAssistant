# Service Announcements

Service Announcements shows the M365 Message Center announcements for your tenant directly inside IntuneAssistant — the same messages you'd see in the Microsoft 365 admin center, filterable by service, severity, category, and tag.

## Viewing announcements

1. Sign in to **Intune Assistant** at [community.intuneassistant.cloud](https://community.intuneassistant.cloud/)
2. In the left navigation, under **Check**, click **Service announcements**

You'll see a table of all current Message Center announcements for your tenant, including:

* **Title** — with a **Major** badge for changes Microsoft flags as significant
* **Category** — Prevent or fix issue, Plan for change, or Stay informed
* **Severity** — Normal, High, or Critical
* **Services** — which Microsoft 365 services the announcement affects
* **Tags** — e.g. Admin impact, User impact, Retirement
* **Rollout** — for messages tracking a staged feature rollout, where it currently stands for your tenant (see [Tenant rollout status](#tenant-rollout-status) below)
* **Last Updated** — when Microsoft last modified the announcement

Click any row to open the full message, including the complete announcement text as published by Microsoft. Up to 1,000 matching messages are loaded at once; if your tenant has more than that, narrow your filters to see the rest.

## Filtering

Use the **Filters** panel to narrow the list:

| Filter | Description |
|--------|-------------|
| **Service** | Show only announcements affecting a specific service (e.g. `Microsoft Entra`) |
| **Severity** | Normal, High, or Critical |
| **Category** | Prevent or fix issue, Plan for change, or Stay informed |
| **Tag** | Free-text tag match, e.g. `Admin impact` |
| **Rollout status** | Scheduled, In Rollout, or Launched (see below) — only matches messages that track a staged rollout |
| **Only major changes** | Show only announcements Microsoft has flagged as a major change |

Filters apply immediately and can be combined. Use **Clear filters** to reset.

## Tenant rollout status

Some announcements — typically ones tied to a Microsoft 365 Roadmap feature — track exactly where the rollout stands for **your** tenant specifically, not just when Microsoft announced it generally:

* **Scheduled** — the feature is planned but hasn't started rolling out to your tenant yet
* **In Rollout** — actively rolling out, often shown with a release ring (e.g. Standard Release)
* **Launched** — fully rolled out to your tenant

Open a message with a **Rollout** badge to see the breakdown per platform (e.g. iOS, Android, All) — a feature can be further along on one platform than another. Messages with no rollout badge don't track a staged rollout; the vast majority of Message Center posts fall into this category.

## Requirements

* An active Intune Assistant account
* The signed-in user must have consented to the `ServiceMessage.Read.All` Graph permission (you'll be prompted automatically the first time you open this page if it's missing)
