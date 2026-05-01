# User App Assignments

## What Is This Page?

The **User App Assignments** page shows every Intune **application** that is targeted at a specific user — resolved automatically through all their group memberships, including All Users targeting and nested groups. You enter a name or email address, and Intune Assistant works out the complete app entitlement picture for that person.

---

## Why Would You Use This?

- A user says an app is missing from their Company Portal — you need to find out why it is not appearing
- You want to confirm that all required apps will be automatically installed for a new employee
- You are doing an access review and need to document which apps a specific person can install
- An app is installing on a user's device unexpectedly and you need to trace which group is responsible
- You need to report on app entitlements for audit or compliance purposes
- You want to verify that an app marked for uninstall is correctly targeted at a user

---

## How to Use This Page

### Search by User

1. Navigate to **Assistant > Assignments > User Assignments > Application Assignments**
2. The page opens with a welcome card and a search area
3. Make sure **Search for a User** mode is active
4. Type the user's display name or UPN (email address) — partial names work
5. Press **Enter** or click **Search**
6. If multiple users match, a list of user cards is displayed — each showing the display name, UPN, and account status
7. Click **View Assignments** on the correct user
8. Intune Assistant fetches all app assignments for that user
9. The results table appears

> You can paste a user Object ID (GUID) directly into the search field.

> 📸 _[Screenshot placeholder: Welcome card showing the user search mode with a filled-in search field, search results displaying three user cards with display name, UPN, and an "Enabled" status badge]_

---

## User Info Panel

After a user is selected and assignments are loaded, a summary card appears above the table:

| Field | What It Shows                                            |
|---|----------------------------------------------------------|
| **Display Name** | The user's full name as it appears in Entra ID |
| **UPN** | The user principal name — their email / login address    |
| **Account Status** | Enabled or Disabled                                      |
| **User Type** | Member (internal user) or Guest (external / B2B user)    |
| **Created** | When the Entra ID account was created                    |

> 📸 _[Screenshot placeholder: User info panel above the results table, showing name, UPN, green Enabled badge, Member type, and creation date]_

---

## Understanding the Table

| Column | What It Means |
|---|---|
| **Resource** | The application name as it appears in Intune. The app type (Win32App, iOS Store App, etc.) is shown in smaller text below the name |
| **Platform** | Device platform the app targets — shown as a coloured badge: blue for Windows, grey for iOS, green for Android, purple for macOS |
| **Assignment** | How the app reaches the user — e.g., `Entra ID Group`, `All Users`. Shown as a badge. Exclude assignments are highlighted in red |
| **Target** | The specific group or built-in target (`All Users`, `All Devices`). For group assignments, member counts (users / devices / nested groups) are shown below the group name. The group name is clickable |
| **Install Type** | How the app is deployed — `Required`, `Available`, or `Uninstall` |
| **Status** | **Assigned** (green badge) or **Not Assigned** (grey badge) |
| **Filter** | The assignment filter applied (if any). Clickable to view the filter rule. Shows a green **Inc** badge for Include filters and a red **Exc** badge for Exclude filters |

### Install Types — What They Mean for the User

| Install Type | What Happens on the User's Device |
|---|---|
| **Required** | The app is **automatically pushed** to the user's enrolled device(s). No action needed from the user |
| **Available** | The app appears in the **Company Portal** app. The user can choose to install it at any time |
| **Uninstall** | The app is **actively removed** from the user's enrolled device(s) |

> Understanding the difference between Required and Available is key when troubleshooting why an app is or is not present on a device. Required apps install silently; Available apps only install if the user requests them.

---

> 📸 _[Screenshot placeholder: App Assignments results table showing rows with Required and Available install type labels, platform badges, group names in the Target column with member count sub-text, and a green Inc filter badge on one row]_

---

## Dynamic Groups

When a group in the **Target** column has a small **purple block icon** next to its name, it is a **dynamic group**. Dynamic groups are automatically maintained by Entra ID based on a membership rule (e.g., all devices with a certain OS version, or all users in a specific department).

If the target group has **nested groups** inside it, a small **amber question mark icon** appears in the member count area. This means some devices or users in that group may themselves be groups. To fully understand the reach of that assignment, use the [Group Assignments](./group-assignments.md) page to drill into the specific group.

---

## Filters Panel

Click **Filters** to expand the filter controls:

| Filter | What It Does |
|---|---|
| **Resource Type** | Focus on a specific app type (Win32App, iOS Store App, Android Enterprise App, etc.) |
| **Assignment Type** | Show only specific targeting methods (e.g., only Entra ID Group, only All Users) |
| **Status** | Show only Assigned or only Not Assigned apps |
| **Platform** | Limit to a specific device platform |
| **Install Type** | Show only Required, Available, or Uninstall assignments |
| **Filter Type** | Show only assignments with an Include filter, an Exclude filter, or no filter |

Use **Clear Filters** to reset everything at once.

> 📸 _[Screenshot placeholder: Filters panel expanded showing six multi-select dropdowns, with Install Type dropdown open and showing Required, Available, Uninstall options]_

---

## Clicking on Groups

Group names in the **Target** column are clickable (highlighted in amber). Clicking opens a **Group Details** dialog showing:

- Group display name and description
- Membership type (Assigned or Dynamic)
- Dynamic membership rule (if applicable)
- Member counts: users, devices, and nested groups

---

## Clicking on Filters

Filter names in the **Filter** column are clickable. A **Filter Details** dialog opens showing:

- Filter display name and description
- Platform scope
- Management type (MDM or MAM)
- The filter rule expression (e.g., `(device.manufacturer -eq "Microsoft")`)

---

## Stats Bar

Above the results table, a stats strip shows:

| Stat | What It Shows |
|---|---|
| **Total Assignments** | Number of rows in the current filtered view |
| **Assigned** | How many apps are actively assigned to the user |
| **Not Assigned** | Apps that exist in the tenant but are not targeted at this user |
| **Resource Types** | Number of distinct app types in the results |
| **Platforms** | Number of distinct platforms represented |

---

## Exporting the Data

Two export options are available via the **Export** button:

### Standard Export
Exports all visible rows to CSV, PDF, or HTML. Includes:
- Resource type and name
- Assignment type and target
- Platform
- Install type
- Status
- Filter name and filter type

**Filename:** `user-assignments-overview.csv` (or `.pdf` / `.html`)

### Export for Bulk Assignments
A structured CSV for use in bulk assignment workflows. Includes:
- PolicyName (the app name)
- GroupName
- AssignmentDirection
- AssignmentAction (pre-filled as `Add`)
- Filter name and filter type

**Filename:** `rollouts-overview.csv`

> 💡 The bulk export is useful when you want to replicate a user's app assignment set to a new group or test environment.

---

## Common Use Cases

**Why does a user not see an app in Company Portal?**
Search for the user. If the app is not in the results with Install Type = `Available`, no group is targeting the user for that app — check group memberships or add the user to the correct group.

**Confirm a required app will install on a new hire's device**
Search for the user after they have been added to onboarding groups. Look for the app with Install Type = `Required` — if it appears as Assigned, it will install automatically at next device check-in.

**An app is installing on a device unexpectedly**
Search for the user. Find the app with Install Type = `Required`. The **Target** column shows which group is pushing it — this is the group to investigate.

**Access review: what apps can this user install from Company Portal?**
Filter Install Type to `Available` and export the Standard Export to share with a reviewer.

**Verify no apps are being uninstalled that should not be**
Filter Install Type to `Uninstall` and review the list.

**Pre-offboarding or licence review**
Export the full Standard Export before the account is disabled — gives you a complete record of app entitlements.

---

## Related Pages

- [User Configuration Assignments](./user-assignments-configuration.md)
- [User Assignments Overview](./user-assignments.md)
- [App Assignments](./app-assignments.md)
- [Group Assignments](./group-assignments.md)
- [All Assignments](./all-assignments.md)

