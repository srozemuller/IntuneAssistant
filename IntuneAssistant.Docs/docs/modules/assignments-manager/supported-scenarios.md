# Assignment Migration - Supported Scenarios & Test Coverage

This guide provides detailed documentation of all tested and supported assignment migration scenarios in Intune Assistant. Each scenario includes examples of how to structure your API requests or CSV imports.

---

## 📋 Table of Contents

1. [Add Operations](#add-operations)
2. [Replace Operations](#replace-operations)
3. [Remove Operations](#remove-operations)
4. [Complex Multi-Operation Scenarios](#complex-multi-operation-scenarios)
5. [Assignment Filters](#assignment-filters)
6. [Important Limitations](#important-limitations)

---

## Add Operations

### ✅ Add Group Assignment to Empty Policy

**Scenario:** Add a group assignment to a policy that has no existing assignments.

**When to use:** Initial assignment setup for new policies.

**Request Example:**
```json
{
  "policyId": "abc-123-def",
  "policyName": "My Configuration Policy",
  "assignmentAction": "Add",
  "assignmentType": "GroupAssignment",
  "assignmentDirection": "Include",
  "assignmentResourceName": "Sales Department"
}
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName
My Configuration Policy,abc-123-def,Add,GroupAssignment,Include,Sales Department
```

**Result:** The policy will have one assignment targeting the "Sales Department" group.

---

### ✅ Add Group Assignment with Filter

**Scenario:** Add a group assignment with a platform-specific filter applied.

**When to use:** When you need to target devices within a group that match specific criteria (e.g., only Windows 11 devices).

**Request Example:**
```json
{
  "policyId": "abc-123-def",
  "policyName": "My Configuration Policy",
  "assignmentAction": "Add",
  "assignmentType": "GroupAssignment",
  "assignmentDirection": "Include",
  "assignmentResourceName": "IT Department",
  "filterName": "Windows 11 Devices Only",
  "filterType": "Exclude"
}
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName,FilterName,FilterType
My Configuration Policy,abc-123-def,Add,GroupAssignment,Include,IT Department,Windows 11 Devices Only,Exclude
```

**Result:** The policy will target the IT Department group, but exclude devices that match the "Windows 11 Devices Only" filter.

**Important Notes:**
- ✅ **Include Filter:** Devices must match the filter criteria to receive the assignment
- ✅ **Exclude Filter:** Devices matching the filter criteria will be excluded from the assignment
- ⚠️ **Filter platform must match policy platform** (Windows filter for Windows policies, etc.)

---

### ✅ Add Exclusion Group

**Scenario:** Add a group exclusion to prevent specific users/devices from receiving the policy.

**When to use:** When you need to exclude a subset of users or devices from an existing assignment.

**Request Example:**
```json
{
  "policyId": "abc-123-def",
  "policyName": "My Configuration Policy",
  "assignmentAction": "Add",
  "assignmentType": "GroupExclude",
  "assignmentDirection": "Exclude",
  "assignmentResourceName": "Executive Team"
}
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName
My Configuration Policy,abc-123-def,Add,GroupExclude,Exclude,Executive Team
```

**Result:** Members of the "Executive Team" group will be excluded from receiving this policy.

---

### ❌ Incompatible Assignment Type Combinations

**Scenario:** Attempting to mix "All Users" or "All Devices" with group-based assignments.

**What happens:** The operation will **fail** with a validation error.

**Why this fails:** Microsoft Intune does not allow mixing these assignment types on the same policy.

**Examples that will FAIL:**

| Current Assignments | Attempted Add | Result |
|---------------------|---------------|---------|
| All Users | Group Assignment | ❌ Error: Cannot mix group assignments with 'All Users' |
| All Devices | Group Assignment | ❌ Error: Cannot mix group assignments with 'All Devices' |
| Group Assignment | All Users | ❌ Error: Cannot add 'All Users' to policy with existing group assignments |
| Group Assignment | All Devices | ❌ Error: Cannot add 'All Devices' to policy with existing group assignments |

**Solution:** Use the **Replace** action instead to replace incompatible assignments.

---

## Replace Operations

The **Replace** action removes **all existing assignments** from a policy and adds the new assignment(s) you specify.

### ✅ Replace Group with Different Group

**Scenario:** Change the targeted group for a policy.

**When to use:** Department restructuring, group renaming, or policy reassignment.

**Request Example:**
```json
{
  "policyId": "abc-123-def",
  "policyName": "My Configuration Policy",
  "assignmentAction": "Replace",
  "assignmentType": "GroupAssignment",
  "assignmentDirection": "Include",
  "assignmentResourceName": "Marketing Department"
}
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName
My Configuration Policy,abc-123-def,Replace,GroupAssignment,Include,Marketing Department
```

**Before:** Policy assigned to "Sales Department"  
**After:** Policy assigned to "Marketing Department" (Sales Department removed)

---

### ✅ Replace Group Assignment with All Users

**Scenario:** Expand a policy from a specific group to all licensed users.

**When to use:** Policy maturity stages (pilot group → company-wide rollout).

**Request Example:**
```json
{
  "policyId": "abc-123-def",
  "policyName": "My Configuration Policy",
  "assignmentAction": "Replace",
  "assignmentType": "AllUsers",
  "assignmentDirection": "Include",
  "assignmentResourceName": "All Users"
}
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName
My Configuration Policy,abc-123-def,Replace,AllUsers,Include,All Users
```

**Before:** Policy assigned to "Pilot Group"  
**After:** Policy assigned to "All Users" (Pilot Group removed)

---

### ✅ Replace Group Assignment with All Devices

**Scenario:** Change from user-based to device-based assignment targeting all devices.

**When to use:** Device configuration policies that should apply to all managed devices regardless of user.

**Request Example:**
```json
{
  "policyId": "abc-123-def",
  "policyName": "Device Security Policy",
  "assignmentAction": "Replace",
  "assignmentType": "AllDevices",
  "assignmentDirection": "Include",
  "assignmentResourceName": "All Devices"
}
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName
Device Security Policy,abc-123-def,Replace,AllDevices,Include,All Devices
```

**Before:** Policy assigned to "Corporate Laptops" group  
**After:** Policy assigned to "All Devices" (group removed)

---

### ✅ Replace All Devices with Group Assignment

**Scenario:** Narrow down a broad device assignment to a specific group.

**When to use:** Phased rollouts or when you need more granular control.

**Request Example:**
```json
{
  "policyId": "abc-123-def",
  "policyName": "Device Security Policy",
  "assignmentAction": "Replace",
  "assignmentType": "GroupAssignment",
  "assignmentDirection": "Include",
  "assignmentResourceName": "Finance Laptops"
}
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName
Device Security Policy,abc-123-def,Replace,GroupAssignment,Include,Finance Laptops
```

**Before:** Policy assigned to "All Devices"  
**After:** Policy assigned to "Finance Laptops" group (All Devices removed)

---

### ✅ Replace and Change Filter Direction

**Scenario:** Keep the same group but change how a filter is applied (Include ↔ Exclude).

**When to use:** Fine-tuning assignment targeting logic.

**Request Example:**
```json
{
  "policyId": "abc-123-def",
  "policyName": "My Configuration Policy",
  "assignmentAction": "Replace",
  "assignmentType": "GroupAssignment",
  "assignmentDirection": "Include",
  "assignmentResourceName": "IT Department",
  "filterName": "Windows 11 Devices",
  "filterType": "Include"
}
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName,FilterName,FilterType
My Configuration Policy,abc-123-def,Replace,GroupAssignment,Include,IT Department,Windows 11 Devices,Include
```

**Before:** IT Department + Exclude Windows 11 devices (targets Windows 10 devices)  
**After:** IT Department + Include Windows 11 devices (targets only Windows 11 devices)

---

### ✅ Replace with Group and Add Filter

**Scenario:** Replace existing assignments and apply a filter to the new assignment.

**When to use:** Consolidating assignments while adding targeting criteria.

**Request Example:**
```json
{
  "policyId": "abc-123-def",
  "policyName": "My Configuration Policy",
  "assignmentAction": "Replace",
  "assignmentType": "GroupAssignment",
  "assignmentDirection": "Include",
  "assignmentResourceName": "Engineering Team",
  "filterName": "Developer Workstations",
  "filterType": "Include"
}
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName,FilterName,FilterType
My Configuration Policy,abc-123-def,Replace,GroupAssignment,Include,Engineering Team,Developer Workstations,Include
```

**Before:** Multiple assignments (various groups)  
**After:** Single assignment to Engineering Team with filter applied

---

### ✅ Replace All Devices with Group + Filter

**Scenario:** Change from a broad "All Devices" assignment to a filtered group assignment.

**When to use:** Moving from broad to targeted deployment.

**Request Example:**
```json
{
  "policyId": "abc-123-def",
  "policyName": "Security Baseline",
  "assignmentAction": "Replace",
  "assignmentType": "GroupAssignment",
  "assignmentDirection": "Include",
  "assignmentResourceName": "Production Servers",
  "filterName": "Windows Server 2022",
  "filterType": "Include"
}
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName,FilterName,FilterType
Security Baseline,abc-123-def,Replace,GroupAssignment,Include,Production Servers,Windows Server 2022,Include
```

**Before:** All Devices (no filter)  
**After:** Production Servers group with Windows Server 2022 filter

---

### ✅ Replace Group with All Users + Filter

**Scenario:** Expand from a group to all users while applying a filter.

**When to use:** Company-wide rollouts with platform-specific targeting.

**Request Example:**
```json
{
  "policyId": "abc-123-def",
  "policyName": "Mobile App Config",
  "assignmentAction": "Replace",
  "assignmentType": "AllUsers",
  "assignmentDirection": "Include",
  "assignmentResourceName": "All Users",
  "filterName": "iOS Devices Only",
  "filterType": "Include"
}
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName,FilterName,FilterType
Mobile App Config,abc-123-def,Replace,AllUsers,Include,All Users,iOS Devices Only,Include
```

**Before:** Marketing group (no filter)  
**After:** All Users with iOS device filter

---

## Remove Operations

### ✅ Remove Group Assignment

**Scenario:** Remove a specific group assignment from a policy.

**When to use:** Cleaning up assignments, removing pilot groups after rollout.

**Request Example:**
```json
{
  "policyId": "abc-123-def",
  "policyName": "My Configuration Policy",
  "assignmentAction": "Remove",
  "assignmentType": "GroupAssignment",
  "assignmentDirection": "Include",
  "assignmentResourceName": "Pilot Group"
}
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName
My Configuration Policy,abc-123-def,Remove,GroupAssignment,Include,Pilot Group
```

**Before:** Policy has assignments to "Pilot Group", "Sales", "Marketing"  
**After:** Policy has assignments to "Sales", "Marketing" (Pilot Group removed)

---

### ✅ Remove All Users Assignment

**Scenario:** Remove the "All Users" assignment from a policy.

**When to use:** Switching from company-wide to group-based assignments.

**Request Example:**
```json
{
  "policyId": "abc-123-def",
  "policyName": "My Configuration Policy",
  "assignmentAction": "Remove",
  "assignmentType": "AllUsers",
  "assignmentDirection": "Include",
  "assignmentResourceName": "All Users"
}
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName
My Configuration Policy,abc-123-def,Remove,AllUsers,Include,All Users
```

**Result:** The "All Users" assignment is removed from the policy.

---

### ✅ Remove All Devices Assignment

**Scenario:** Remove the "All Devices" assignment from a policy.

**When to use:** Switching from device-wide to group-based assignments.

**Request Example:**
```json
{
  "policyId": "abc-123-def",
  "policyName": "Device Configuration",
  "assignmentAction": "Remove",
  "assignmentType": "AllDevices",
  "assignmentDirection": "Include",
  "assignmentResourceName": "All Devices"
}
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName
Device Configuration,abc-123-def,Remove,AllDevices,Include,All Devices
```

**Result:** The "All Devices" assignment is removed from the policy.

---

### ✅ Remove Assignment with Filter

**Scenario:** Remove a specific group assignment that has a filter applied.

**When to use:** Cleaning up complex assignments with filters.

**Request Example:**
```json
{
  "policyId": "abc-123-def",
  "policyName": "My Configuration Policy",
  "assignmentAction": "Remove",
  "assignmentType": "GroupAssignment",
  "assignmentDirection": "Include",
  "assignmentResourceName": "IT Department",
  "filterName": "Windows 11 Devices",
  "filterType": "Exclude"
}
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName,FilterName,FilterType
My Configuration Policy,abc-123-def,Remove,GroupAssignment,Include,IT Department,Windows 11 Devices,Exclude
```

**Important:** All parameters must match **exactly** for the assignment to be removed:
- Group name
- Filter name
- Filter type (Include/Exclude)

**Result:** Only the assignment matching all criteria is removed.

---

### ✅ Remove Exclusion Group

**Scenario:** Remove a group exclusion from a policy.

**When to use:** Re-enabling policy for previously excluded groups.

**Request Example:**
```json
{
  "policyId": "abc-123-def",
  "policyName": "My Configuration Policy",
  "assignmentAction": "Remove",
  "assignmentType": "GroupExclude",
  "assignmentDirection": "Exclude",
  "assignmentResourceName": "Test Users"
}
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName
My Configuration Policy,abc-123-def,Remove,GroupExclude,Exclude,Test Users
```

**Result:** The "Test Users" group is no longer excluded from the policy.

---

### ℹ️ Remove Operation Matching Rules

The Remove action uses **exact matching**. An assignment is only removed if **all specified parameters match**:

| Parameter | Must Match |
|-----------|------------|
| Group Name | ✅ Yes |
| Assignment Type | ✅ Yes |
| Assignment Direction | ✅ Yes |
| Filter Name | ✅ Yes (if specified) |
| Filter Type | ✅ Yes (if filter specified) |

**Example of non-match scenarios:**

1. **Different Filter Type:**
   - Existing: Group A + Exclude Filter
   - Remove Request: Group A + Include Filter
   - Result: ❌ Not removed (filter type mismatch)

2. **Filter vs No Filter:**
   - Existing: Group A + Filter
   - Remove Request: Group A (no filter specified)
   - Result: ❌ Not removed (filter presence mismatch)

3. **Non-existent Assignment:**
   - Remove Request: Group that isn't assigned
   - Result: ✅ No error, but nothing changes

---

## Complex Multi-Operation Scenarios

The API supports **batching multiple operations** for the same policy by processing them **in sequential order**.

### ✅ Replace Then Add Exclusion

**Scenario:** Clear all assignments, add a new one, then add an exclusion group.

**When to use:** Restructuring assignments with exclusions.

**Request Example (2 rows for same policy):**
```json
[
  {
    "policyId": "abc-123-def",
    "policyName": "My Configuration Policy",
    "assignmentAction": "Replace",
    "assignmentType": "GroupAssignment",
    "assignmentDirection": "Include",
    "assignmentResourceName": "All Employees"
  },
  {
    "policyId": "abc-123-def",
    "policyName": "My Configuration Policy",
    "assignmentAction": "Add",
    "assignmentType": "GroupExclude",
    "assignmentDirection": "Exclude",
    "assignmentResourceName": "Contractors"
  }
]
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName
My Configuration Policy,abc-123-def,Replace,GroupAssignment,Include,All Employees
My Configuration Policy,abc-123-def,Add,GroupExclude,Exclude,Contractors
```

**Processing Steps:**
1. **Replace:** Clear all assignments → Add "All Employees"
2. **Add:** Add exclusion for "Contractors"

**Final Result:** Policy assigned to "All Employees" excluding "Contractors"

---

### ✅ Replace Then Add Additional Group

**Scenario:** Replace assignments with a filtered group, then add another group without a filter.

**When to use:** Complex multi-group assignments with mixed filtering.

**Request Example:**
```json
[
  {
    "policyId": "abc-123-def",
    "policyName": "My Configuration Policy",
    "assignmentAction": "Replace",
    "assignmentType": "GroupAssignment",
    "assignmentDirection": "Include",
    "assignmentResourceName": "Primary Group",
    "filterName": "Windows 11 Only",
    "filterType": "Include"
  },
  {
    "policyId": "abc-123-def",
    "policyName": "My Configuration Policy",
    "assignmentAction": "Add",
    "assignmentType": "GroupAssignment",
    "assignmentDirection": "Include",
    "assignmentResourceName": "Secondary Group"
  }
]
```

**CSV Example:**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName,FilterName,FilterType
My Configuration Policy,abc-123-def,Replace,GroupAssignment,Include,Primary Group,Windows 11 Only,Include
My Configuration Policy,abc-123-def,Add,GroupAssignment,Include,Secondary Group,,
```

**Processing Steps:**
1. **Replace:** Clear all assignments → Add "Primary Group" with filter
2. **Add:** Add "Secondary Group" (no filter)

**Final Result:** 
- "Primary Group" + Windows 11 filter
- "Secondary Group" (no filter)

---

### ⚠️ Order Matters in Batch Operations

When submitting multiple operations for the same policy, **the order of rows determines the processing order**.

**Example 1: Replace First (✅ Works as Expected)**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName
My Policy,abc-123,Replace,GroupAssignment,Include,Group A
My Policy,abc-123,Add,GroupAssignment,Include,Group B
My Policy,abc-123,Add,GroupAssignment,Include,Group C
```
**Result:** Group A, Group B, Group C

---

**Example 2: Replace in Middle (⚠️ Unexpected Result)**
```csv
PolicyName,PolicyId,AssignmentAction,AssignmentType,AssignmentDirection,AssignmentResourceName
My Policy,abc-123,Add,GroupAssignment,Include,Group A
My Policy,abc-123,Replace,GroupAssignment,Include,Group B
My Policy,abc-123,Add,GroupAssignment,Include,Group C
```
**Result:** Group B, Group C *(Group A was replaced!)*

---

**Best Practice:** Always put **Replace** operations **first** when batching operations for the same policy.

---

## Assignment Filters

### Filter Platform Compatibility

Filters are **platform-specific** and must match the policy's platform.

| Policy Platform | Compatible Filter Platform |
|-----------------|---------------------------|
| Windows | Windows |
| iOS | iOS |
| Android | Android |
| macOS | macOS |

**Validation:** The API will **reject** requests with mismatched platforms:
```
❌ Error: Filter platform mismatch: filter platform 'Android' does not match policy platform 'Windows'
```

---

### Filter Types

| Filter Type | Behavior | Use Case |
|-------------|----------|----------|
| **Include** | Only devices matching the filter receive the assignment | Target specific OS versions, hardware types |
| **Exclude** | Devices matching the filter do NOT receive the assignment | Exclude incompatible devices |

**Example:**
- **Include Filter "Windows 11":** Only Windows 11 devices get the policy
- **Exclude Filter "Windows 11":** All devices except Windows 11 get the policy

---

### ❌ Non-Existent Filters

If you specify a filter name that doesn't exist, the operation will fail:

```json
{
  "filterName": "Non-Existent Filter"
}
```

**Error:**
```
❌ Assignment filter 'Non-Existent Filter' not found
```

**Solution:** Verify filter names exist in your tenant before migration. Use the Intune portal or API to list available filters.

---

## Important Limitations

### 🚫 Intune Assignment Type Restrictions

Microsoft Intune **does not allow** mixing the following assignment types on the same policy:

| Assignment Type | Cannot Mix With |
|-----------------|-----------------|
| All Users | Group Assignments |
| All Devices | Group Assignments |
| Group Assignments | All Users **or** All Devices |

**Why?** These are mutually exclusive targeting methods in Intune.

**Solution:** Use **Replace** action to change between these assignment types.

---

### ✅ Supported Policy Types

The assignment migration API supports the following policy types:

- ✅ Settings Catalog
- ✅ Device Compliance Policies  
- ✅ Device Configuration Policies
- ✅ Administrative Templates
- ✅ Application Policies
- ✅ Scripts

*(Refer to API documentation for the complete list)*

---

### 📝 Case Sensitivity

- **Group Names:** Case-insensitive (`"Sales"` matches `"sales"`)
- **Filter Names:** Case-insensitive (`"Windows 11"` matches `"windows 11"`)
- **Special Values:** Case-insensitive (`"All Users"`, `"all users"`, `"ALL USERS"` all work)

---

### 🔍 Troubleshooting Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot mix assignment types" | Trying to Add incompatible types | Use **Replace** instead of **Add** |
| "Filter platform mismatch" | Filter doesn't match policy platform | Use a filter for the correct platform |
| "Filter not found" | Filter name doesn't exist | Verify filter exists in tenant |
| "Assignment not removed" | Parameters don't match exactly | Ensure all fields match existing assignment |
| Unexpected batch results | Replace not first in batch | Put Replace operations first |

---

## 📚 Additional Resources

- [API Reference Documentation](#)
- [CSV Import Template](#)
- [Assignment Best Practices](#)
- [Filter Creation Guide](#)

---

**Questions or issues?** Contact support or open an issue on our GitHub repository.