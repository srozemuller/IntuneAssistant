# Backup

## What it does

The Backup page exports all supported Intune and Azure AD configuration types to a ZIP archive you download in your browser. Each resource type gets its own folder inside the ZIP, and each item inside is a separate JSON file named after its display name. The format is compatible with the IntuneManagement open-source tool, so a backup created in IntuneAssistant can be imported with that tool.

---

## Backup

### How to use it

1. Open **Backup** in the sidebar. The table already shows, per resource type, how many items exist and how many are ready locally (the **Ready** column) - Intune Assistant collects this in the background from the moment you sign in.
2. Select the resource types you want to export using the checkboxes in the table header or per row, and optionally narrow by platform or scope tag.
3. Click **Download backup**. The text next to the button tells you whether everything is ready (the ZIP is built locally, instantly) or how many items still have to be fetched first. If anything is fetched, the table updates in real time and the ZIP is saved automatically when it is done.
4. Use **Save ZIP again** if you want the same archive a second time, or after retrying failed items.

### What you will see

The status table has one row per resource type. Each row shows the resource type name, the **Ready** count (items available locally versus items that exist; "listed on download" for the few types the overview does not collect), the current status (Not started, Running, Done, or Error), and the item count once the export completes. If a type returns an error (for example because a Graph permission was not consented), the row shows the error and the remaining types continue.

The downloaded file is named `IntuneBackup-YYYY-MM-DD.zip`. Inside, each resource type has its own folder containing one `.json` file per configuration item.

### Where the data comes from

The Backup page works together with the tenant overview that Intune Assistant collects when you sign in:

* **What exists** (the list of items per resource type) comes from that overview, so a backup starts immediately instead of asking Microsoft Graph for each type first. The note above the filters tells you when the overview was collected and offers a refresh.
* **Item content** is fetched live the first time, and kept locally afterwards. A later backup reuses the content of items that have not been modified since, and only fetches what is new or changed. The row shows how many items came from that local copy (for example "312 / 320 · 300 cached").
* **Keep backup content ready** is on by default: the content is collected in the background as soon as the overview has loaded, so pressing **Start Backup** produces the ZIP without waiting for Microsoft Graph. It costs one Graph read per configuration item after every overview refresh; on a very large tenant, or if you rarely back up, switch it off and content is fetched only when you start a backup. The choice is remembered in your browser. **Clear content cache** throws the local copies away; **Reset cache** on the Tenant Overview page does the same as part of a full reset.

The locally kept content lives in your own browser, per signed-in account and per tenant, and is removed when you sign out.

---

## Supported resource types

The following types are included in a backup:

* Settings Catalog
* Device Configuration
* Compliance Policies
* Conditional Access
* Assignment Filters
* Scope Tags
* App Protection (iOS)
* App Protection (Android)
* App Protection (Windows)
* Enrollment Restrictions
* Autopilot Profiles
* Device Health Scripts
* PowerShell Scripts
* macOS Shell Scripts
* Administrative Templates
* Feature Update Profiles
* Driver Update Profiles
* Quality Update Profiles
* Endpoint Security
* App Configuration (Managed App)
* App Configuration (Managed Device)
* Enrollment Status Page
* Notification Templates
* Intune Branding
* Terms of Use
* Named Locations
* Authentication Strengths
* Compliance Scripts
* ADMX Files

---

## Requirements

* An active Intune Assistant account.
* Your Microsoft account must have permission to read the relevant Intune and Azure AD resources. The application prompts for consent if any permission is missing.
