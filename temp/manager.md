# Assignment Migration Tool - User Documentation

## Overview

The Assignment Migration Tool allows you to manage Microsoft Intune policy assignments in bulk using CSV files. You can add, remove, or replace assignments for policies across different tenants.

---

## Table of Contents

1. [Supported Operations](#supported-operations)
2. [CSV File Format](#csv-file-format)
3. [Assignment Types](#assignment-types)
4. [Assignment Actions](#assignment-actions)
5. [Filters](#filters)
6. [Common Scenarios](#common-scenarios)
7. [Validation Rules](#validation-rules)
8. [Best Practices](#best-practices)

---

## Supported Operations

The tool supports three primary actions:

- **Add** - Add new assignments to existing policies
- **Remove** - Remove specific assignments from policies
- **Replace** - Replace all existing assignments with new ones

---

## CSV File Format

### Required Columns

| Column Name | Description | Required | Example |
|------------|-------------|----------|---------|
| `PolicyName` | Name of the Intune policy | Yes | "Windows Security Baseline" |
| `GroupName` | Azure AD group name or special target | Yes | "All Users", "All Devices", "Finance Team" |
| `AssignmentAction` | Action to perform | Yes | "Add", "Remove", "Replace" |
| `FilterName` | Name of assignment filter (optional) | No | "Windows 11 Devices" |
| `FilterType` | Filter direction (optional) | No | "Include", "Exclude" |

### CSV Example

```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Windows Security Baseline,Finance Team,Add,,
Windows Security Baseline,All Users,Replace,,
Compliance Policy 1,Sales Team,Add,Windows 11 Devices,Include
Compliance Policy 1,Marketing Team,Add,Test Devices,Exclude
Old Policy,Finance Team,Remove,,
```

---

## Assignment Types

### 1. Group Assignments

Assign policies to specific Azure AD groups.

**CSV Format:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
My Policy,Finance Department,Add,,
```

**Result:** Policy is assigned to all members of "Finance Department" group.

---

### 2. All Users

Assign policies to all licensed users in your tenant.

**CSV Format:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Security Policy,All Users,Add,,
```

**Result:** Policy applies to every user with an Intune license.

---

### 3. All Devices

Assign policies to all devices enrolled in Intune.

**CSV Format:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Device Compliance,All Devices,Add,,
```

**Result:** Policy applies to all enrolled devices regardless of user.

---

## Assignment Actions

### Add Action

Adds new assignments **without removing** existing ones.

#### Scenario: Add Group Assignment

**CSV:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Security Baseline,IT Admins,Add,,
```

**Before:**
- Policy has "All Users" assignment

**After:**
- Policy has "All Users" assignment
- Policy has "IT Admins" group assignment

---

#### Scenario: Add Assignment with Exclusion Group

**CSV:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
App Protection,All Users,Add,,
App Protection,Test Users,Add,,
```

**Result:**
- Policy assigned to all users
- Test Users group included separately (can be excluded via filters)

---

### Remove Action

Removes specific assignments **without affecting** others.

#### Scenario: Remove Group Assignment

**CSV:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Old Policy,Finance Team,Remove,,
```

**Before:**
- Policy assigned to: "Finance Team", "Sales Team", "All Devices"

**After:**
- Policy assigned to: "Sales Team", "All Devices"
- "Finance Team" assignment removed

---

#### Scenario: Remove All Users Assignment

**CSV:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Pilot Policy,All Users,Remove,,
```

**Before:**
- Policy assigned to "All Users"

**After:**
- Policy has no assignments

---

### Replace Action

Removes **all existing assignments** and adds the new one(s).

#### Scenario: Replace Group with Another Group

**CSV:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Security Policy,New Security Group,Replace,,
```

**Before:**
- Policy assigned to: "Old Group A", "Old Group B", "All Users"

**After:**
- Policy assigned to: "New Security Group" only

---

#### Scenario: Replace Multiple Assignments with All Devices

**CSV:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Device Config,All Devices,Replace,,
```

**Before:**
- Policy assigned to: "Group 1", "Group 2", "Group 3"

**After:**
- Policy assigned to: "All Devices" only

---

## Filters

Assignment filters allow you to include or exclude devices based on device properties.

### Filter Types

- **Include** - Apply policy only to devices matching the filter
- **Exclude** - Apply policy to all devices except those matching the filter

### Filter Platform Matching

⚠️ **Important:** Filter platform must match the policy platform.

| Policy Platform | Compatible Filter Platform |
|----------------|---------------------------|
| Windows | Windows |
| iOS | iOS |
| Android | Android |
| macOS | macOS |

---

### Scenario: Add Assignment with Include Filter

**CSV:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Windows Compliance,All Devices,Add,Windows 11 Only,Include
```

**Result:**
- Policy assigned to all devices
- Only applied to devices matching "Windows 11 Only" filter

---

### Scenario: Add Assignment with Exclude Filter

**CSV:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Security Baseline,All Users,Add,Test Devices,Exclude
```

**Result:**
- Policy assigned to all users
- Not applied to devices matching "Test Devices" filter

---

### Scenario: Remove Assignment with Specific Filter

**CSV:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
App Config,Sales Team,Remove,VIP Devices,Exclude
```

**Before:**
- Policy assigned to "Sales Team" with "VIP Devices" (Exclude)
- Policy assigned to "Sales Team" without filter

**After:**
- Only the assignment with the matching filter is removed
- Assignment without filter remains

---

## Common Scenarios

### Scenario 1: Migrate Policy from One Group to Another

**Goal:** Move policy from "Pilot Users" to "All Users"

**CSV:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
New Feature Policy,All Users,Replace,,
```

**Result:** All previous assignments removed, policy now assigned to "All Users"

---

### Scenario 2: Add Exclusion to Existing Assignment

**Goal:** Keep current assignments but exclude test devices

**CSV:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Compliance Policy,All Devices,Add,Test Devices,Exclude
```

**Result:** Policy applies to all devices except those matching "Test Devices" filter

---

### Scenario 3: Change Filter Direction

**Goal:** Change from excluding test devices to including only production devices

**CSV:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Security Policy,All Devices,Replace,Production Devices,Include
```

**Result:** All previous assignments removed, policy now applies only to production devices

---

### Scenario 4: Batch Migration Multiple Policies

**CSV:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Policy A,Finance Team,Replace,,
Policy B,Finance Team,Replace,,
Policy C,Finance Team,Replace,,
Policy D,All Users,Replace,,
```

**Result:** Multiple policies migrated to new assignments in one operation

---

### Scenario 5: Replace and Add Exclusion

**Goal:** Replace assignment and immediately add exclusion group

**CSV:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
App Protection,All Users,Replace,,
App Protection,Excluded Users,Add,,
```

**Processing Order:**
1. Replace removes all assignments and adds "All Users"
2. Add includes "Excluded Users" group

⚠️ **Note:** This creates two assignments - you may want to use filters instead for exclusions.

---

## Validation Rules

### Rule 1: Cannot Mix All Users/All Devices with Groups

❌ **Invalid:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
My Policy,All Users,Add,,
My Policy,Finance Team,Add,,
```

**Error:** "Cannot mix 'All Users' with group assignments"

**Solution:** Use Replace instead:
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
My Policy,All Users,Replace,,
```

---

### Rule 2: Filter Platform Must Match Policy Platform

❌ **Invalid:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Windows Security Baseline,All Devices,Add,iOS Device Filter,Include
```

**Error:** "Filter platform 'iOS' does not match policy platform 'Windows'"

✅ **Valid:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Windows Security Baseline,All Devices,Add,Windows 11 Filter,Include
```

---

### Rule 3: Cannot Have Conflicting Actions in Same Batch

❌ **Invalid:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
My Policy,Finance Team,Add,,
My Policy,Finance Team,Remove,,
```

**Error:** "Conflicting assignment actions detected for the same assignment"

**Reason:** Adding and removing the same assignment in one batch creates a conflict.

---

### Rule 4: Cannot Add Same Assignment with Different Filters

❌ **Invalid:**
```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
My Policy,IT Team,Add,Filter A,Include
My Policy,IT Team,Add,Filter B,Exclude
```

**Error:** "Conflicting filter types for the same assignment"

**Reason:** Same group cannot have both Include and Exclude filters simultaneously.

---

## Best Practices

### 1. Test Before Production

Always test your CSV with a small subset of policies first:

```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Test Policy 1,Test Group,Add,,
```

### 2. Use Replace for Clean Migrations

When migrating policies, use **Replace** to avoid orphaned assignments:

```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Production Policy,Production Users,Replace,,
```

### 3. Verify Group Names

Ensure group names match exactly (case-sensitive):

❌ `finance team` ≠ `Finance Team`  
✅ `Finance Team` = `Finance Team`

### 4. Check Filter Names

Filter names must exist in your tenant before migration:

```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
My Policy,All Devices,Add,Corporate Devices,Include
```

Verify "Corporate Devices" filter exists first.

### 5. Batch Similar Operations

Group similar operations together:

```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Policy 1,Finance,Replace,,
Policy 2,Finance,Replace,,
Policy 3,Finance,Replace,,
```

### 6. Document Your Changes

Add comments in a separate tracking file:

```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType,Notes
Security Baseline,All Users,Replace,,,Migrated from pilot group on 2024-01-15
```

### 7. Order of Operations

When using multiple actions, they execute in CSV row order:

```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
My Policy,All Users,Replace,,
My Policy,Excluded Group,Add,,
```

**Result:**
1. Replace removes all assignments and adds "All Users"
2. Add includes "Excluded Group"

---

## Error Messages

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Policy not found" | Policy name doesn't exist | Verify policy name spelling |
| "Group not found" | Group name doesn't exist | Check Azure AD group name |
| "Filter not found" | Filter name doesn't exist | Verify assignment filter exists |
| "Platform mismatch" | Filter platform ≠ policy platform | Use matching platform filter |
| "Cannot mix assignment types" | Mixing All Users/Devices with groups | Use Replace action |
| "Conflicting actions" | Same assignment has Add + Remove | Remove duplicate |

---

## Examples by Policy Type

### Configuration Policies

```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Windows Update Policy,All Devices,Replace,Production Devices,Include
Windows Update Policy,Test Devices Group,Add,Test Device Filter,Exclude
```

### Compliance Policies

```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Device Compliance - iOS,All Users,Replace,,
Device Compliance - iOS,Executives,Add,VIP Devices,Include
```

### App Protection Policies

```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
MAM Policy - Android,All Users,Replace,,
MAM Policy - Android,BYOD Users,Add,Personal Devices,Exclude
```

### Security Baselines

```csv
PolicyName,GroupName,AssignmentAction,FilterName,FilterType
Windows Security Baseline v2,All Devices,Replace,Managed Devices,Include
```

---

## FAQ

**Q: What happens if I add the same assignment twice?**  
A: The operation is idempotent - only one assignment is created.

**Q: Can I remove an assignment that doesn't exist?**  
A: Yes, the operation completes without error (idempotent).

**Q: Can I use Replace multiple times in one CSV?**  
A: Yes, but each Replace overwrites the previous one for that policy.

**Q: What if my group name has commas?**  
A: Enclose in quotes: `"Finance, Sales, and Marketing"`

**Q: Can I migrate assignments between tenants?**  
A: No, group and filter names must exist in the target tenant.

**Q: What happens if a filter name is wrong?**  
A: Error: "Assignment filter not found" - operation fails for that row.

---

## Support

For issues or questions:

1. Verify CSV format matches examples above
2. Check validation rules section
3. Review error messages table
4. Contact your system administrator

---

**Last Updated:** 2024-01-15  
**Version:** 1.0