# Customer & Tenant Management

## What Is This Page?

The **Customer Information** page is the central hub for managing your organisation's relationship with Intune Assistant — who you are, which tenants you manage, what licenses are active, and which tenant context is currently selected for all other pages in the application.

For **MSP (Managed Service Provider)** accounts, this page is especially important. It allows you to register and manage **multiple customer tenants**, grant the required admin consent for each, assign licenses, and switch the active **tenant context** so that every other page in Intune Assistant operates against the correct customer environment. This is how an MSP engineer can move between managing one customer's Intune environment and another's without ever logging out.

---

## Account Types — What Is Yours?

When you first open this page, look at the **Account Type** badges in the Customer Details card. There are three independent flags:

| Badge | When It Shows | What It Means |
|---|---|---|
| **MSP** | Your account is registered as an MSP | You can manage multiple tenants and add customer tenants using GDAP |
| **Direct** | Your account is not an MSP | You manage only your own home tenant |
| **Active** | You have a paid license | Full feature access including licensed extensions |
| **Community** | No paid license, or community tier only | Core features available, licensed extensions not accessible |
| **GDAP** | Your account has a GDAP relationship configured | You can use Granular Delegated Admin Privileges to manage customer tenants on their behalf |
| **No GDAP** | No GDAP relationship detected | You can only manage your own home tenant |

> 💡 **MSP + GDAP is the combination that enables full multi-tenant management.** An MSP account with a GDAP relationship means you can add customer tenants, consent on their behalf, and manage their Intune environment through the delegated permissions Microsoft has granted you.

---

## The Page Layout

The page is divided into three main areas:

1. **Customer Details** — your organisation's profile information
2. **License Information + Summary** — your active licenses and tenant counts
3. **Tenant Management table** — all registered tenants with their status and actions

---

## Customer Details Card

The left card shows your organisation's profile:

| Field | What It Shows |
|---|---|
| **Customer Name** | Your organisation's registered name in Intune Assistant |
| **Address** | Your registered address, or `Not provided` if not set |
| **Primary Contact** | The primary contact email for the account |
| **Account Type** | The MSP/Direct, Active/Community, and GDAP/No GDAP badges described above |
| **Home Tenant ID** | The Entra ID tenant ID of your own Microsoft 365 tenant — the one you signed in with |

---

## License Information Card

This card is shown when you hold a **non-community** (paid) license. It lists every active customer-level license with:

| Field | What It Shows |
|---|---|
| **License Type** | `Community`, `Standard`, or `Enterprise` |
| **Active / Inactive** | Whether the license is currently active |
| **Trial** | Shown as an extra badge if the license is a trial |
| **Max Tenants** | The maximum number of customer tenants this license permits |
| **Expires** | The expiry date of the license, or `Never` if it does not expire |

### Tenant Limit Warning

If the total number of registered tenants has reached the maximum allowed by your combined active licenses, an **amber warning banner** appears:

> ⚠️ Maximum tenant limit reached (X/Y tenants) — Contact support to increase your tenant limit or upgrade your license.

The **Add Tenant** button in the Tenant Management section is automatically disabled when this limit is reached.

---

## Summary Card

A two-number summary showing:
- **Total Tenants** (blue) — all tenants registered on your account
- **Enabled Tenants** (green) — tenants with `isActive = true`

---

## Tenant Management Table

The main table lists every tenant registered on your account. The columns shown depend on your account type.

### Columns for Community-Only Accounts

| Column | What It Shows |
|---|---|
| **Display Name** | The tenant's display name |
| **Tenant ID** | The Entra ID tenant GUID in monospace |
| **Domain** | The primary domain of the tenant (e.g., `contoso.onmicrosoft.com`) |
| **Consent Status** | The onboarding readiness of the tenant — see Consent Status States below |

### Columns for Paid (Non-Community) Accounts

| Column | What It Shows |
|---|---|
| **Display Name** | The tenant's display name |
| **Tenant ID** | The Entra ID tenant GUID in monospace |
| **Domain** | The primary domain |
| **Type** | `Primary`, `Trial`, or `Standard` badge |
| **GDAP** | `Enabled` or `Disabled` badge indicating whether a GDAP relationship exists for this tenant |
| **License Status** | Count of licenses assigned to this tenant, with an orange warning icon if any license is awaiting consent |
| **Actions** | A pencil (edit) icon that opens the Tenant Management dialog |

### Consent Status States

For community accounts, the Consent Status column shows one of three states:

| Status | Colour | Meaning | Action Available |
|---|---|---|---|
| **Consent Required** | 🔴 Red | The tenant's community license exists but admin consent has not been granted | **Grant Consent** button appears inline |
| **Onboarding Required** | ⚪ Grey (outlined) | Consent was granted but onboarding has not completed | Complete onboarding |
| **Ready** | 🟢 Green | Consent granted and onboarding complete — tenant is fully usable | No action required |

> 📸 _[Screenshot placeholder: Tenant Management table showing three tenants — one with a red "Consent Required" badge and inline Grant Consent button, one with a grey "Onboarding Required" badge, and one with a green "Ready" badge]_

### Clicking a Tenant Row

Clicking anywhere on a tenant row **sets that tenant as the active context** for the entire application. A brief blue shimmer animation confirms the selection. After clicking, all other pages (Assignments, Configuration, Audit Events, etc.) operate against that tenant's data.

The currently selected tenant is remembered in the application context and displayed in the tenant selector in the sidebar.

---

## Adding a Tenant (MSP Accounts Only)

The **Add Tenant** button is visible in the Tenant Management card header only when:
- Your account is an **MSP** (`isMsp = true`)
- Your account is **Active** (`isActive = true`)
- You have **not reached your tenant limit**

Clicking it opens the **Tenant Onboarding Modal** — a guided flow for registering a new customer tenant. See [Tenant Onboarding](../onboarding/tenant-onboarding.md) for the full walkthrough.

After successful onboarding, the page automatically refreshes and the new tenant appears in the table.

---

## Editing a Tenant

For paid accounts, clicking the **pencil icon** in the Actions column opens the **Tenant Management dialog** — a full-screen modal with a two-column layout covering all settings and licenses for that tenant in one place.

### Left Column — Tenant Settings

**Display Name** — an editable text field for the tenant's friendly name in Intune Assistant.

**Tenant Information** (read-only summary):
- Tenant ID (GUID)
- Domain name
- Status badge (Active / Inactive)
- GDAP badge (Enabled / Disabled)

Click **Save Settings** to apply the display name change.

### Left Column — Quick Actions

Three action buttons below the settings form:

#### Set as Context / Active Context

Sets this tenant as the active context for the entire application. When already selected, the button shows a green **Active Context** label with a checkmark. Clicking it again when already active has no effect.

> 💡 This is the primary way to switch between customer environments in MSP workflows. Set the context here, then navigate to any other section — all data will be scoped to that tenant.

#### Add New License

Opens the **License Onboarding Wizard** for this tenant. See the License Onboarding Wizard section below.

#### Delete Tenant

Opens a confirmation dialog before permanently removing the tenant from the system. See Deleting a Tenant below.

### Right Column — License Management

Lists every license currently assigned to this tenant. Each license card shows:

| Element | What It Shows |
|---|---|
| License type badge | `Assistant` (type 0) or `Assignments Manager` (type 1) |
| Consent status | Green checkmark (`Consented & Onboarded` / `Consented & Pending`) or orange warning (`Consent Required`) |
| **Grant Consent** button | Appears only when consent has not been granted — opens the consent URL in a new tab |
| **Active** toggle | Enable or disable this specific license. Changes are saved immediately via PATCH API |
| **Trial** toggle | Mark or unmark this license as a trial. Changes are saved immediately |
| Created date | When the license was created |
| Expires date | When the license expires, or `Never` |
| Delete (trash icon) | Opens a confirmation dialog to permanently delete the license |

> 📸 _[Screenshot placeholder: Tenant Management dialog open, showing the two-column layout. Left column has Display Name field, Tenant Information summary, and three Quick Action buttons. Right column shows two license cards — one with a green checkmark and Active/Trial toggles, one with an orange Consent Required warning and a Grant Consent button]_

---

## License Onboarding Wizard

When you click **Add New License** from the Quick Actions section, a three-step wizard opens.

### Step 1 — Select License Type

Choose the license type to add to this tenant:

| Option | License Type | Notes |
|---|---|---|
| **Assistant** | Type 0 | Grants access to core Intune Assistant features for this tenant |
| **Assignments Manager** | Type 1 | Grants access to the licensed Assignments Manager extension |

License types already assigned to the tenant are shown as **disabled** in the dropdown with `(Already assigned)` to prevent duplicates.

Click **Start Consent Process** to proceed.

### Step 2 — Grant Consent

A **consent popup window** opens automatically (600×700 px). The popup is opened synchronously before any network calls to ensure the browser does not block it as a script-initiated popup.

Behind the scenes:
1. The license is created in the backend via a POST request
2. The consent URL is extracted from the response
3. The popup is navigated to the Microsoft admin consent URL

While the popup is open, the wizard shows:

> 🔗 Consent window is open — Please complete the consent process in the popup window

**What happens after consent:**
- If you complete consent in the popup, the browser sends a `postMessage` back to the wizard confirming success
- If the popup closes without a postMessage (e.g., you close the window after completing consent on Microsoft's side), the wizard detects the popup closure via a polling interval and automatically calls the consent callback to verify with the backend
- Either path leads to Step 3

If the popup is blocked by the browser:

> ❌ Failed to open consent window. Please allow popups for this site and try again.

> 📸 _[Screenshot placeholder: License Onboarding Wizard at Step 2 showing the three-step progress bar with Step 1 (Select License) and Step 2 (Grant Consent) highlighted, and a central area showing the ExternalLink icon with "Consent window is open" message]_

### Step 3 — Complete

A green checkmark confirms the license was successfully added.

> ✅ **Assistant** license has been successfully added to **Contoso Ltd**.

Click **Complete** or **Close** to dismiss the wizard. The tenant management dialog and tenant list refresh automatically.

---

## Granting Consent for Community Tenants

For community-only accounts, consent is managed directly from the **Consent Status column** in the main tenant table rather than through the License Onboarding Wizard.

When a tenant shows a red **Consent Required** badge:
1. Click the **Grant Consent** button that appears next to the badge
2. A consent popup opens (600×700 px)
3. Complete the Microsoft admin consent flow in the popup
4. The popup closes and the consent callback is processed automatically
5. The tenant's status updates to **Ready** (green) after a successful refresh

> ⚠️ **Popups must be allowed** for the Intune Assistant domain. If your browser blocks the popup, you will see an error message. Add the site to your browser's allowed popups list and try again.

---

## Deleting a Tenant

Clicking **Delete Tenant** in the Quick Actions section opens a confirmation dialog:

> ⚠️ Are you sure you want to delete **"Tenant Name"**?
> This action cannot be undone and will permanently remove the tenant from the system.

Two buttons: **Cancel** (safe) and **Delete Tenant** (red, destructive).

After deletion:
- The tenant is removed from the backend
- The tenant table refreshes automatically
- The scroll position is preserved so you return to the same place in the list

> ⚠️ **Deletion is permanent.** There is no soft-delete or recovery option. Only delete tenants you are certain should be removed.

---

## Deleting a License

Inside the License Management section of the Tenant Management dialog, clicking the trash icon on a license opens a confirmation dialog:

> ⚠️ Are you sure you want to delete the **"Assistant"** license?
> This action cannot be undone and will remove access to features provided by this license.

After confirming, the license is deleted and the dialog refreshes with the updated license list.

---

## The Tenant Context — Why It Matters

**Setting tenant context is the most important action on this page for MSP users.**

Every other section of Intune Assistant — Assignments, Configuration, Audit Events, Compare, Devices, Conditional Access — scopes all its data to the **currently selected tenant context**. When you change context here, you are effectively switching which customer's Intune environment you are working in.

The flow for an MSP engineer managing multiple customers is:

1. Come to the Customer page
2. Find the customer you need to work on
3. Click the tenant row (or use **Set as Context** in the edit dialog)
4. Navigate to whichever section you need (Assignments, Configuration, etc.)
5. All data on those pages now comes from that customer's tenant via the GDAP permissions you hold
6. Return to the Customer page to switch to a different customer

> 📸 _[Screenshot placeholder: Tenant Management table with one row highlighted in blue showing the currently selected tenant, and the sidebar tenant selector showing the same tenant name]_

---

## GDAP — How It Enables MSP Management

**GDAP (Granular Delegated Admin Privileges)** is the Microsoft framework that allows an MSP to manage a customer's Microsoft 365 and Intune environment without needing a user account in that tenant.

When GDAP is configured between your MSP tenant and a customer tenant:
- Your admin credentials in your own tenant gain delegated permissions in the customer's tenant
- The specific permissions available depend on the GDAP roles your customer has granted you
- Intune Assistant uses these delegated permissions to call Microsoft Graph on behalf of the customer tenant when that tenant is set as the active context

In the tenant table, the **GDAP** column shows `Enabled` (filled badge) or `Disabled` (outlined badge) for each registered tenant.

For GDAP to work correctly in Intune Assistant, admin consent must also be granted for the application in the customer tenant — which is what the consent flow in this page handles.

---

## Common MSP Workflows

### Onboard a new customer tenant

1. Ensure your account is MSP + Active
2. Click **Add Tenant**
3. Complete the Tenant Onboarding Modal — enter the customer's tenant ID or domain
4. The tenant appears in the table with a **Consent Required** or **Onboarding Required** status
5. Grant consent if prompted
6. Once **Ready**, click the tenant row to set it as context
7. Navigate to any section to start managing the customer's Intune environment

### Switch between customer environments

1. Come to Customer Information
2. Click the tenant row for the customer you want to work on
3. The context switches immediately
4. Navigate to the desired section — all data is now scoped to that customer

### Add a licensed extension to a customer tenant

1. Click the pencil icon on the customer's tenant row
2. In Quick Actions, click **Add New License**
3. Select the license type in the wizard (e.g., Assignments Manager)
4. Complete the consent step in the popup
5. The license appears in the License Management section with Active status

### Review all tenants at a glance

The tenant table gives you a complete inventory at a glance. For paid accounts, use the **GDAP** column to verify which tenants have an active GDAP relationship, and the **License Status** column to spot any tenants that need consent attention.

---

## Related Pages

- [Tenant Onboarding](../onboarding/tenant-onboarding.md) — the full onboarding modal walkthrough
- [Audit Events Dashboard](../audit-events/dashboard.md) — after setting context, view that tenant's audit events
- [Configuration](../configuration/README.md) — after setting context, manage that tenant's policies
- [Assignments](../assistant/assignments/README.md) — after setting context, review that tenant's assignments

