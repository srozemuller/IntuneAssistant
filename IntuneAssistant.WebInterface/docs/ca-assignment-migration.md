# Conditional Access Assignment Migration

## Overview

The **CA Assignment Migration** tool lets you bulk-manage group assignments on your Microsoft Entra ID Conditional Access policies using a simple CSV file.
The process follows four sequential stages — **Upload → Compare → Migrate → Verify** — so you always know exactly what will change before anything is committed, and you can confirm the result afterwards.

> 🔒 **Access requirement**: This feature is available to **beta testers** with an **Extensions** licence.

---

## Why Use CA Assignment Migration?

When managing Conditional Access at scale (multiple tenants, policy migrations, post-merger consolidations) manually adding or removing group assignments one-by-one is error-prone and time-consuming.

✅ **Bulk operations** — add or remove dozens of group assignments in one go  
✅ **Pre-flight check** — compare your desired state against live Entra ID before touching anything  
✅ **Safe-by-default** — only rows you explicitly select are migrated  
✅ **Full audit trail** — every row has a final status, batch number, and correlation ID  
✅ **Post-migration validation** — a dedicated endpoint re-checks each assignment was actually applied  

---

## The Migration Workflow

```
Upload CSV  →  Compare  →  Select & Migrate  →  Results  →  Verify  →  Summary
```

| Step | What happens |
|------|-------------|
| **Upload** | Parse and validate your CSV locally before any API call |
| **Compare** | POST to `/assignments/ca/compare` — check each row against live Entra ID |
| **Migrate** | POST to `/assignments/ca/migrate` — apply selected changes in batches of 20 |
| **Results** | Review per-row migration outcome (Success / Failed / Skipped) |
| **Verify** | POST to `/assignments/ca/validate` — confirm each assignment exists in Entra ID |
| **Summary** | Collapsible statistics + full row changelog with filter buttons |

---

## CSV Format

Create a plain `.csv` file with the following columns (header row required):

| Column | Required | Allowed values | Description |
|--------|----------|---------------|-------------|
| `PolicyName` | ✅ | Any string | Display name of the Conditional Access policy |
| `GroupName` | ✅* | Any string or empty | Display name of the group to assign. Leave empty only for `Include → All Users` scenarios |
| `AssignmentDirection` | ✅ | `Include` or `Exclude` | Whether the group is in the include or exclude list |
| `AssignmentAction` | ✅ | `Add` or `Remove` | Whether to add the group to, or remove it from, the policy |

> ⚠️ Rows with missing or invalid values are flagged **CSV Invalid** and excluded from all subsequent steps. You can hover over the warning icon (⚠️) in the upload table to see the specific error.

### Minimal example

```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction
CAD001-O365: Grant macOS access for All users when Modern Auth Clients and Compliant-v1.1,AAD_DA_AutoPilot-Devices,Include,Add
Block Legacy Authentication,Sales Team,Include,Add
Block Legacy Authentication,Guest Users,Exclude,Add
Require MFA for All Users,AAD_UA_ConAcc-Breakglass,Exclude,Remove
```

---

## Step-by-Step Guide

### Step 1 — Upload CSV

1. Navigate to **Extensions → Assignment Manager → Conditional Access Assignments**
2. Drag-and-drop your CSV onto the upload zone, or click **Select CSV File**
3. The tool validates every row immediately:
   - ✅ **Green check** — row is valid and will be sent to the API
   - ⚠️ **Orange triangle** — row has a validation error (hover to see details)
4. The upload summary shows the total counts of Add / Remove actions and invalid rows
5. When happy, click **Compare _N_ Valid Rows**

> 📸 **Screenshot Placeholder**: _Upload step showing the drag-drop zone, CSV stats grid (Valid Rows / Add / Remove / Invalid), and the Compare button_

---

### Step 2 — Compare

The Compare step calls `/assignments/ca/compare` with the valid rows and returns a pre-flight result for each one.

Each row gets one of four statuses:

| Status badge | Meaning | Can be migrated? |
|---|---|---|
| 🟢 **Ready** | Policy found, group found, assignment compatible | ✅ Yes |
| 🔵 **Already Migrated** | Assignment already exists in Entra ID | ❌ No (skip) |
| 🔴 **Not Ready** | Validation failure (see Details column) | ❌ No |
| 🟡 **Warning** | Assignment exists but has warnings | Review first |

Use the filter buttons (**All / Ready / Already Migrated / Compare Failed / Warnings**) to focus on specific subsets.

The **Policy State** column shows whether the CA policy is `enabled`, `disabled`, or `Report Only` — useful for spotting policies that are not yet enforced.

> 📸 **Screenshot Placeholder**: _Migrate step showing the comparison table with Status / Policy Name / Group / Direction / Action / Policy State / Details columns and the filter bar_

---

### Step 3 — Select & Migrate

1. All **Ready** rows are pre-selected automatically
2. Use the **Select All Ready** button or the header checkbox to adjust your selection
3. You can also individually check/uncheck rows
4. Click **Migrate _N_ Selected**

Rows are sent in **batches of 20**. A live progress bar shows:
- Current chunk / total chunks
- Items processed / total items
- Running count of Successful / Failed / Skipped results

You can click **Cancel Migration** at any time — already-processed batches are not rolled back.

> 📸 **Screenshot Placeholder**: _Chunk progress bar with spinner, percentage, processed/total counter, and the three live stat tiles_

---

### Step 4 — Results

After all batches complete you land on the **Results** step. Five stat cards give an instant overview:

| Card | Colour | Meaning |
|------|--------|---------|
| **Successful** | Green | API returned `Success` |
| **Failed** | Red | API returned an error — check the Message column |
| **Skipped** | Grey | API returned `Skipped` (already exists / no-op) |
| **Not Started** | Yellow | Sent to API but never processed (check portal) |
| **Total** | Blue | Total rows sent in this migration run |

Use the filter buttons above the table to narrow to any status, then click **Proceed to Verification**.

---

### Step 5 — Verify

Verification calls the dedicated `/assignments/ca/validate` endpoint — this does a live re-check in Entra ID, not just a compare, so it confirms the assignment is genuinely present.

| Verification badge | Meaning |
|---|---|
| ✅ **Verified ✓** | `hasCorrectAssignment: true` — assignment confirmed in Entra ID |
| ❌ **Failed** | `hasCorrectAssignment: false` — assignment not found; check the Reason column |

The **Reason** column shows the `message.reason` field from the API (e.g. `"Post-migration validation passed"` or a specific failure reason).

> 📸 **Screenshot Placeholder**: _Verification table showing Status / Policy Name / Group / Direction / Action / Policy State / Reason columns_

When done, click **View Summary**.

---

### Step 6 — Summary

The Summary page has two cards:

**Card 1 — Migration Statistics**
- Attention boxes highlight any issues (CSV invalid / compare failed / migration failed / not verified / skipped)
- A collapsible **Migration Statistics** panel shows the full funnel: Uploaded → Ready → Migrated → Verified

**Card 2 — Row Changelog**
- Every CSV row is listed with its **Final Status**
- Filter buttons let you jump straight to any category
- Columns: Batch #, Policy, Action, Group, Direction, Final Status, Notes

> 📸 **Screenshot Placeholder**: _Summary page showing attention boxes, collapsed statistics panel, and the row changelog table with filter buttons_

---

## API Reference

### Compare — `POST /assignments/ca/compare`

**Request body** (array):
```json
[
  {
    "policyName": "Block Legacy Authentication",
    "groupName": "Sales Team",
    "assignmentDirection": "Include",
    "assignmentAction": "Add"
  }
]
```

**Key response fields per item**:

| Field | Type | Description |
|-------|------|-------------|
| `isReadyForMigration` | `boolean` | `true` if all checks pass |
| `isMigrated` | `boolean` | Assignment already exists |
| `migrationCheckResult.policyExists` | `boolean` | Policy found by name |
| `migrationCheckResult.policyIsUnique` | `boolean` | No duplicate policy names |
| `migrationCheckResult.groupExists` | `boolean` | Group found by name |
| `migrationCheckResult.assignmentIsCompatible` | `boolean` | No conflicting assignments |
| `policy.state` | `string` | `enabled` / `disabled` / `enabledForReportingButNotEnforced` |
| `warnings` | `string[]` | Non-blocking warnings |

---

### Migrate — `POST /assignments/ca/migrate`

**Request body** — same shape as Compare.

**Key response fields per item**:

| Field | Type | Description |
|-------|------|-------------|
| `status` | `string` | `Success` / `Failed` / `Skipped` / `NotStarted` |
| `errorMessage` | `string \| null` | Failure detail when `status = Failed` |
| `processedAt` | `ISO datetime` | When the item was processed |
| `assignmentDirection` | `number` | `1 = Include`, `2 = Exclude` |
| `assignmentAction` | `number` | `0 = Add`, `1 = Remove` |

---

### Validate — `POST /assignments/ca/validate`

**Request body** — same shape as Compare.

**Key response fields per item**:

| Field | Type | Description |
|-------|------|-------------|
| `hasCorrectAssignment` | `boolean` | `true` if the assignment is confirmed in Entra ID |
| `message.status` | `string` | `Valid` or `Invalid` |
| `message.reason` | `string` | Human-readable explanation |
| `policy.state` | `string` | Current policy enforcement state |
| `policy.conditions` | `object` | Full policy conditions snapshot at validation time |

---

## Scenarios & Examples

### Scenario 1 — Onboarding a new group to multiple policies

**Context**: A new department group `AAD_Dept_Finance` needs to be included in three existing CA policies.

**CSV**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction
CAD001-O365: Grant macOS access for All users when Modern Auth Clients and Compliant-v1.1,AAD_Dept_Finance,Include,Add
Require MFA for All Users,AAD_Dept_Finance,Include,Add
Block Legacy Authentication,AAD_Dept_Finance,Include,Add
```

**Expected Compare result**: All three rows show 🟢 **Ready** (assuming the group exists and none of the assignments already exist).

**Expected Migrate result**: All three rows show **Success**.

---

### Scenario 2 — Replacing one group with another

**Context**: `AAD_DA_AutoPilot-Devices` is being decommissioned and replaced by `AAD_DA_AutoPilot-Devices-v2`. You need to add the new group and remove the old one.

**CSV**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction
CAD001-O365: Grant macOS access for All users when Modern Auth Clients and Compliant-v1.1,AAD_DA_AutoPilot-Devices-v2,Include,Add
CAD001-O365: Grant macOS access for All users when Modern Auth Clients and Compliant-v1.1,AAD_DA_AutoPilot-Devices,Include,Remove
```

**What to watch**: On Compare, confirm `AAD_DA_AutoPilot-Devices` shows `assignmentExists: true` (otherwise Remove is a no-op). Then migrate and verify both rows.

---

### Scenario 3 — Adding a break-glass exclusion

**Context**: Your `Require MFA for All Users` policy needs to exclude the break-glass account group so emergency access is never blocked.

**CSV**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction
Require MFA for All Users,AAD_UA_ConAcc-Breakglass,Exclude,Add
```

**Key point**: `AssignmentDirection` is `Exclude` — the group goes into the **Exclude users** list, not the include list.

---

### Scenario 4 — Post-merger tenant consolidation

**Context**: After a merger you have 40 policies across two tenants. You export the desired assignment state from the source tenant and apply it to the destination tenant.

**Approach**:
1. Export current assignments from the source tenant as a CSV (via your own tooling or a PowerShell export)
2. Review the CSV — remove any rows for assignments that already exist in the destination
3. Upload, compare (confirm all group names exist in the destination), migrate, verify
4. Use the **Row Changelog** on the Summary page to document what was applied

**Tip**: Run the Compare step first with the entire file. Use the **Compare Failed** filter to identify groups that need to be created in the destination tenant before migration.

---

### Scenario 5 — Partial rollback after a failed migration

**Context**: You migrated 30 rows but 5 came back as **Failed** due to a permissions issue. You fix the permissions, then re-run only the failed rows.

**Approach**:
1. On the **Results** step, filter to **Failed** and note the policy/group/direction/action combinations
2. Export or recreate a CSV with only those 5 rows
3. Start a new migration session, upload the smaller CSV, compare and migrate again
4. The previously successful 27 rows will show **Already Migrated** on Compare — do not re-select them

---

## Troubleshooting

### "Policy not found" on Compare

- Verify the exact display name in the Entra ID portal — names are **case-sensitive**
- If the policy was recently renamed, update your CSV

### "Group not found" on Compare

- Confirm the group display name in Entra ID
- Groups created via Azure AD Connect may take 15–30 minutes to sync
- Ensure the service account has `Group.Read.All` permission

### "Duplicate policy name" on Compare

- Two CA policies share the same display name — the API cannot determine which one to target
- Rename one policy in the Entra ID portal to make names unique

### "Assignment is not compatible" on Compare

- The requested assignment type conflicts with an existing assignment (e.g. trying to add a group that is already excluded as a conflicting rule)
- Review the `compatibilityErrors` array in the Compare response for details

### Verification shows "Failed" after a successful migration

- Entra ID replication can take up to 60 seconds after a change
- Wait a moment and click **Run Verification** again
- If it continues to fail, check the Entra ID audit log for the policy

### Migration was cancelled mid-run

- Batches already processed are **not rolled back** — those assignments are live
- Use the **Row Changelog** to see which rows were processed (`migration_success`) and which were not started (`migration_notstarted`)
- Re-run with only the unprocessed rows

---

## Status Reference

### Row final statuses (Row Changelog)

| Status | Colour | Description |
|--------|--------|-------------|
| `CSV Invalid` | 🔴 Red | Row failed local CSV validation |
| `Compare Failed` | 🔴 Red | Pre-flight check failed — not migratable |
| `Ready (Not Migrated)` | ⚪ Grey | Passed compare but was not selected or not yet migrated |
| `Already Migrated` | 🔵 Blue | Assignment already existed before this run |
| `Migrated` | 🔵 Blue | Successfully migrated, not yet verified |
| `Migrated (Verified)` | 🟢 Emerald | Successfully migrated and confirmed by validation |
| `Migration Failed` | 🔴 Red | API returned an error during migrate |
| `Skipped` | ⚪ Grey | API returned Skipped (no-op) |
| `Not Started` | 🟠 Orange | Sent to API but never processed |
| `Verify Failed` | 🔴 Red | Assignment not found after migration |

---

## Permissions Required

The service principal / app registration used by Intune Assistant needs the following Microsoft Graph permissions:

| Permission | Type | Purpose |
|------------|------|---------|
| `Policy.Read.All` | Delegated | Read CA policies |
| `Policy.ReadWrite.ConditionalAccess` | Delegated | Modify CA policy assignments |
| `Group.Read.All` | Delegated | Look up groups by display name |
| `Directory.Read.All` | Delegated | Resolve group IDs |

> 💡 If you see `403 Forbidden` errors during migration, ask your tenant administrator to grant the missing permissions and retry.

---

## Best Practices

1. **Always run Compare first** — never skip straight to Migrate. Use the pre-flight result to catch naming errors and missing groups.
2. **Start small** — on a new tenant, test with 2–3 rows before uploading a 100-row CSV.
3. **Verify after every migration** — the Verify step is your receipt that changes landed correctly.
4. **Keep your CSV** — save the original CSV alongside the Row Changelog export for audit purposes.
5. **Use report-only policies for testing** — set policies to `enabledForReportingButNotEnforced` in Entra ID to test assignment changes safely before enabling enforcement.
6. **Unique policy names** — ensure all CA policy display names are unique. Duplicate names will cause a Compare failure.
7. **Check group existence first** — if you're adding brand-new groups created as part of the same change window, wait for Entra ID to finish provisioning before running Compare.

