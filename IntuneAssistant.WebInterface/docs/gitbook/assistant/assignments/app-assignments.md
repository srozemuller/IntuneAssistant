# App Assignments

## What Is This Page?

The **App Assignments** page focuses exclusively on **application deployments** in your Intune tenant. It shows every app that is in your Intune environment, it finds who it is assigned to, how it is installed, and on which platform.

---

## Why Would You Use This?

- Verify which apps are deployed (or not) and which target it has
- Check the install type (Required, Available, Uninstall) for a specific app
- Investigate why a user does or does not have an app on their device
- Audit app assignments across platforms (Windows, iOS, Android, macOS)
- Produce a report of all deployed applications for a compliance review

---

## How to Load the Data

1. Navigate to **Assistant > Assignments > App Assignments**
2. Click **Load Data**
3. Data is fetched from Microsoft Graph in pages
4. A progress counter shows how many pages have been loaded

> **Paged loading:** Data loads in batches. You will see a counter like `Fetched 3 pages (300 records)` while loading is in progress.

> **Cancel:** You can stop loading at any point. Records already fetched remain visible.

---

## Understanding the Table

| Column | What It Means |
|---|---|
| **Resource** | The application name as it appears in Intune |
| **Type** | App type (Win32App, iOS Store App, Android Enterprise App, etc.) |
| **Assignment** | Targeting method: Entra ID Group, All Users, All Devices |
| **Target** | The specific group or built-in target |
| **Platform** | Device platform (Windows, iOS, Android, macOS) |
| **Install Type** | How the app is deployed: Required, Available, Uninstall |
| **Status** | Whether the app is Assigned or Not Assigned |
| **Filter** | Assignment filter name applied (if any) |
| **Filter Type** | Whether the filter is Include or Exclude |

### Install Types Explained

| Install Type | Meaning |
|---|---|
| **Required** | App is automatically installed on matching devices — no user interaction needed |
| **Available** | App appears in the Company Portal — users can choose to install it |
| **Uninstall** | App is actively removed from matching devices |

> 📸 _[Screenshot placeholder: App Assignments table showing Win32 apps with Required and Available install types across different groups]_

---

## Filtering the Data

Expand the **Filters** panel to narrow results:

| Filter | What It Does |
|---|---|
| **Resource Type** | Limit to a specific app type (Win32, iOS, Android, etc.) |
| **Assignment Type** | Show only group, All Users, or All Devices assignments |
| **Status** | Show only Assigned or Not Assigned apps |
| **Platform** | Focus on a specific device platform |
| **Install Type** | Filter by Required, Available, or Uninstall |
| **Filter Type** | Show assignments using Include filters, Exclude filters, or no filter |

> 📸 _[Screenshot placeholder: Filter bar expanded with Install Type dropdown open]_

---

## Clicking on Groups

Group names in the **Target** column are clickable. A **Group Details** dialog opens showing membership type, member counts (users, devices, nested groups), and the group description.

---

## Clicking on Filters

Filter names open a **Filter Details** dialog showing the filter rule expression and platform scope — so you know exactly which devices within the group will actually receive the app.

---

## Exporting the Data

Click **Export** to download visible rows as a CSV file.

**Filename:** `app-assignments.csv`

The export includes all table columns.

---

## Common Use Cases

**Find all apps required on Windows devices**
Set Platform to `Windows`, Install Type to `Required`.

**Which apps are available in Company Portal?**
Set Install Type to `Available`.

**Apps with no assignment at all?**
Set Status to `Not Assigned`.

**Audit all iOS app deployments**
Set Platform to `iOS/iPadOS`.

---

## Related Pages

- [All Assignments](./all-assignments.md)
- [User App Assignments](./user-assignments-apps.md)
- [Group Assignments](./group-assignments.md)

