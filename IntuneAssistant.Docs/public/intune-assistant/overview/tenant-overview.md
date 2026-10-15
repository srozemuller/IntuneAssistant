# Tenant Overview

## What Is This Page?

The **Tenant Overview** page is the starting point of Intune Assistant. As soon as you sign in, Intune Assistant starts loading every configuration in your Intune tenant in the background — Settings Catalog policies, device configuration profiles, administrative templates, compliance policies, app protection and app configuration policies, scripts and remediations, Windows update profiles, enrollment configurations, Autopilot profiles, disk encryption policies, iOS app provisioning profiles and applications.

While that happens, a small status window in the bottom-right corner shows each resource type being fetched, ticking them off one by one. When it is done, the overview page shows totals, how much of it is assigned, a breakdown per resource type and per platform, and a searchable inventory of everything that was found.

The result is kept for **30 minutes**, so navigating around the app or reloading the page inside that window is instant — nothing is fetched again until you press **Refresh data** or the data goes stale. The **Configuration Assignments (all)** page uses the same data, so it opens already filled in, the **Backup** page uses it to know what exists before it starts exporting, and the **Search tenant** box in the sidebar (or **Ctrl+K** / **⌘K** anywhere) searches all of it without waiting.

***

## Why Would You Use This?

* You want a single, instant answer to "what is in this tenant?" without opening every Intune blade
* You want to spot configuration types that exist but are not assigned to anything
* You are handing over or reviewing a tenant and need a quick shape of it: how many policies, of which types, for which platforms
* You want to search across every configuration type at once by name, description, platform or type

***

## How to Load the Data

{% stepper %}
{% step %}
### Sign in

Loading starts automatically the first time you sign in, and again whenever the data is older than 30 minutes. You do not have to open the overview page for this to happen.
{% endstep %}

{% step %}
### Watch the status window

A panel appears in the bottom-right corner listing every resource type. A spinner means it is still loading, a green check means it is done (with the number of items found), and a red cross means that type could not be loaded. The panel folds itself away a few seconds after a clean run; if something failed it stays open so you can see what.
{% endstep %}

{% step %}
### Open **Intune Assistant → Tenant Overview**

Everything that has already arrived is shown immediately, and the page fills in as the remaining types finish.
{% endstep %}
{% endstepper %}

***

## What You'll See

* **Data collected … ago** in the top-right corner, with a **Refresh recommended** hint once the data is older than 30 minutes, and a **Refresh data** button to fetch everything again.
* **Reset cache** next to it throws away everything collected for this tenant, in memory and on disk (including any backup content kept ready for the Backup page), and collects it again from scratch. Use it when you want to be certain nothing old is left over; **Refresh data** keeps the previous data visible until the new collection completes.
* **Total configurations**, **Assigned** (with the number that is not assigned and the number of built-in tenant defaults), **Configuration types** and **Data loaded** cards.
* **Resource types** — one bar per type showing how many items were found and how many of those are assigned.
* **By platform** — a donut of where your configurations apply (Windows, iOS, macOS, Android, …).
* **All configurations** — every item grouped by type. Expand a type to see each item's name, platform, sub-type, assignment state, last-modified date and how many settings or assignments it has. Use the search box to filter across every type at once; sections that contain a match open automatically.

### Item details

Click any configuration name in the **All configurations** list to open its details on the right:

* **Assignments** - every target with the group name, include or exclude, the filter applied (with its name) and any warning such as a deleted group. Click a group to open its details; **Open in Configuration Assignments** jumps to the assignments page filtered to this item.
* **Configuration** - the item's settings as Intune stores them, shown as readable properties (nested settings fold open) or as raw JSON, with a copy button. For an Autopilot profile, for example, that is the device name template, language, out-of-box experience and enrollment status page settings and the hardware-hash setting; for a compliance policy the rules; for a script its schedule and run context. The configuration is fetched from Intune the first time you open an item and reused afterwards; when the Backup page's **Keep backup content ready** switch is on, it is already there. The small text next to the heading says where it came from, and the refresh icon fetches it again.

Resource kinds without a configuration payload (connectors, roles, categories) show the assignments part only.

### Assignment states

* **Assigned** — at least one assignment an administrator created.
* **Not assigned** — the configuration exists but applies to nobody.
* **Tenant default** — Intune's built-in "All users and all devices" enrollment defaults. They apply everywhere but nobody assigned them and they cannot be removed, so they are not counted as assigned.
* **Not configured** — assigned but switched off (for example a Windows Hello for Business enrollment configuration set to *Not configured*), so it has no effect.

### Searching from anywhere

Press **Ctrl+K** (Windows) or **⌘K** (Mac) on any page, or click **Search tenant…** at the top of the sidebar. Type part of a policy, profile, app, or group name. Results are split into **Configurations** and **Assignments**; picking one opens the page that owns it with the search already filled in. The search runs on the collected data, so it is instant and works offline from Intune until you refresh.

***

## Requirements

* An active Intune Assistant account.
* The same Microsoft Graph read permissions the assignment pages use. If a permission is missing, the consent banner tells you which one; grant it and press **Refresh data**.

***

## Common Questions

**Does the overview show live data?**
It shows what was collected at the time shown in the top-right corner. Press **Refresh data** to fetch the latest state; the 30-minute window exists to keep the rest of the app fast, not because the data cannot be refreshed sooner.

**One resource type shows a red cross — is the rest of the data still correct?**
Yes. Each type is loaded independently. The types that loaded are complete; the failed one is simply missing and listed in the amber notice on the overview page. Press **Refresh data** to try again.

**Is the cached data shared with colleagues?**
The copy in your browser is yours alone, per signed-in account and per tenant, and is cleared when you sign out. Nothing about your tenant is stored on the server: the overview is collected live, and the result is only held in the server's memory for a few minutes so that your colleagues' pages do not collect it again straight away. **Refresh data** always collects anew.

**Can I start from a blank screen, for a demo or a screenshot?**
Open `/overview?demo=1`. That clears everything collected for the tenant (including backup content), switches **Collect automatically at sign-in** off, and shows a **Start collecting** button so you decide when the stream begins. Switch auto-collect back on afterwards using the toggle on that same screen; the setting is remembered per browser.

**I switched tenants and the overview reloaded — why?**
The overview belongs to one tenant. Switching tenants restores that tenant's own cached overview if it is less than 30 minutes old, otherwise it loads it fresh.
