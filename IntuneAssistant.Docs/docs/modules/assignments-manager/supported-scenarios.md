Based on the selected `AssignmentCsvModel` class and the test files you've provided, here's the comprehensive documentation:

---

## AssignmentCsvModel - Complete Documentation

### Overview
`AssignmentCsvModel` represents a single row from a CSV file that defines how policy assignments should be migrated or modified in Microsoft Intune. This model serves as the input format for batch assignment operations.

---

### Properties

| Property | Type | Required | Description | Valid Values | Example |
|----------|------|----------|-------------|--------------|---------|
| `PolicyName` | `string` | Yes | The exact name of the policy to modify | Any existing policy name | `"Windows Security Policy"` |
| `GroupName` | `string` | Conditional | Target group or scope | `"All Users"`, `"All Devices"`, group name, or empty for NoAssignment | `"IT Department"` |
| `AssignmentDirection` | `string` | Yes | Assignment inclusion/exclusion direction | `"Include"`, `"Exclude"`, `"NoAssignment"` | `"Include"` |
| `AssignmentAction` | `string` | Yes | Action to perform | `"Add"`, `"Remove"`, `"Replace"` | `"Add"` |
| `FilterName` | `string` | No | Name of assignment filter to apply | Any existing filter name | `"Windows 11 Devices"` |
| `FilterType` | `string` | Conditional | Filter direction when FilterName is provided | `"Include"`, `"Exclude"` | `"Include"` |

---

### Assignment Types

The combination of `GroupName` and `AssignmentDirection` determines the assignment type:

| GroupName | AssignmentDirection | Result Type | Description |
|-----------|-------------------|-------------|-------------|
| `"All Users"` | `"Include"` | `AllUsers` | Targets all licensed users |
| `"All Devices"` | `"Include"` | `AllDevices` | Targets all enrolled devices |
| Group name | `"Include"` | `GroupAssignment` | Targets specific group members |
| Group name | `"Exclude"` | `GroupExclude` | Excludes specific group members |
| Empty | `"NoAssignment"` | `NoAssignment` | Removes all assignments |

---

### Assignment Actions

#### Add
- **Purpose**: Adds new assignment without modifying existing ones
- **Validation**: 
  - Policy must exist
  - Group must exist (if specified)
  - Filter must exist and match policy platform (if specified)
  - Cannot mix incompatible assignment types (e.g., All Users + Group assignments)
- **Result if assignment exists**: Marked as already migrated (`IsMigrated = true`)

#### Remove
- **Purpose**: Removes specified assignment
- **Validation**:
  - Policy must exist
  - Group must exist (if specified)
  - Filter must match exactly (if specified)
- **Result if assignment doesn't exist**: Marked as already migrated (`IsMigrated = true`)

#### Replace
- **Purpose**: Removes all existing assignments and adds new one
- **Validation**:
  - Policy must exist
  - Group must exist (if specified)
  - Filter must exist and match policy platform (if specified)
- **Result if same assignment exists**: Not marked as migrated (`IsMigrated = false`)

---

### Filter Rules

When `FilterName` is provided:
1. Filter must exist in the system
2. Filter must have unique name
3. `FilterType` must be specified (`"Include"` or `"Exclude"`)
4. Filter platform must match policy platform (Windows/iOS/Android/macOS)

---

### Validation Rules

#### Policy Validation
- Policy name is case-sensitive
- Whitespace is automatically trimmed
- Policy must be unique (no duplicate names)

#### Group Validation
- For group assignments: Group must exist in Azure AD
- For `"All Users"` or `"All Devices"`: No group lookup needed

#### Assignment Compatibility
The following combinations are **not allowed** with Add action:
- Adding group assignment to policy with `All Users`
- Adding group assignment to policy with `All Devices`
- Adding `All Users` to policy with existing group assignments
- Adding `All Devices` to policy with existing group assignments

---
# Assignment Migration & Comparison Test Scenarios Documentation

## Overview
This document outlines all supported scenarios for assignment migration and comparison operations in the Intune Assistant. Each scenario includes the required input configuration and expected behavior.

---

## Test Categories

### 1. Basic Assignment Operations
#### 1.1 Add Action - Existing Assignment
**Scenario**: Adding an assignment that already exists on the policy

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_AllUsers,All Users,Include,Add,,
```

**Expected Result**:
- `IsMigrated = true`
- `IsReadyForMigration = true`
- `AssignmentExists = true`
- No API call needed (already in desired state)

**Supported Policy Types**: SettingsCatalog, DeviceCompliancePolicies, DeviceConfigurationPolicy

---

#### 1.2 Add Action - Non-Existing Assignment
**Scenario**: Adding a new assignment to a policy

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_NoAssignments,Test Group,Include,Add,,
```

**Expected Result**:
- `IsMigrated = false`
- `IsReadyForMigration = true`
- `AssignmentExists = false`
- Assignment will be created

**Supported Policy Types**: SettingsCatalog, DeviceCompliancePolicies, DeviceConfigurationPolicy

---

#### 1.3 Remove Action - Existing Assignment
**Scenario**: Removing an assignment that exists on the policy

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_AllUsers,All Users,Include,Remove,,
```

**Expected Result**:
- `IsMigrated = false`
- `IsReadyForMigration = true`
- `AssignmentExists = true`
- Assignment will be removed

**Supported Policy Types**: SettingsCatalog, DeviceCompliancePolicies, DeviceConfigurationPolicy

---

#### 1.4 Remove Action - Non-Existing Assignment
**Scenario**: Removing an assignment that doesn't exist (already removed)

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_NoAssignments,Test Group,Include,Remove,,
```

**Expected Result**:
- `IsMigrated = true`
- `IsReadyForMigration = true`
- `AssignmentExists = false`
- No action needed

**Supported Policy Types**: SettingsCatalog, DeviceCompliancePolicies

---

#### 1.5 Replace Action - Single Assignment
**Scenario**: Replacing all existing assignments with a new one

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_Group,Test Group,Include,Replace,,
```

**Expected Result**:
- All existing assignments removed
- New assignment added
- Policy will have exactly 1 assignment

**Supported Policy Types**: SettingsCatalog, DeviceCompliancePolicies, DeviceConfigurationPolicy

---

#### 1.6 Replace Action - With Filter
**Scenario**: Replacing assignments with a filtered assignment

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_Group,Test Group,Include,Replace,Test Filter,Exclude
```

**Expected Result**:
- All existing assignments removed
- New filtered assignment added
- Filter validated for platform compatibility

**Supported Policy Types**: SettingsCatalog, DeviceCompliancePolicies, DeviceConfigurationPolicy

---

### 2. All Users Assignments

#### 2.1 All Users - Existing Assignment
**Scenario**: Policy already has All Users assignment

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_AllUsers,All Users,Include,Add,,
```

**Expected Result**:
- `IsMigrated = true`
- `AssignmentType = AllUsers`
- No changes made

**Supported Policy Types**: SettingsCatalog, DeviceCompliancePolicies, DeviceConfigurationPolicy

---

#### 2.2 All Users - With Filter (Existing)
**Scenario**: Policy has All Users assignment with filter

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_AllUsers_Filter,All Users,Include,Add,Test Filter,Exclude
```

**Expected Result**:
- `IsMigrated = true`
- `FilterExist = true`
- `CorrectFilterPlatform = true`

**Supported Policy Types**: SettingsCatalog, DeviceCompliancePolicies

---

#### 2.3 All Users - With Filter (Include Direction)
**Scenario**: Adding All Users assignment with Include filter

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_NoAssignments,All Users,Include,Add,Test Filter,Include
```

**Expected Result**:
- New All Users assignment with Include filter
- Filter direction validated

**Supported Policy Types**: SettingsCatalog, DeviceCompliancePolicies, DeviceConfigurationPolicy

---

### 3. All Devices Assignments

#### 3.1 All Devices - Existing Assignment
**Scenario**: Policy already has All Devices assignment

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_AllDevices,All Devices,Include,Add,,
```

**Expected Result**:
- `IsMigrated = true`
- `AssignmentType = AllDevices`

**Supported Policy Types**: SettingsCatalog, DeviceCompliancePolicies, GroupPolicyConfiguration

---

#### 3.2 All Devices - With Filter (Existing)
**Scenario**: Policy has All Devices with filter

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_AllDevices_Filter,All Devices,Include,Add,Test Filter,Exclude
```

**Expected Result**:
- `IsMigrated = true`
- `FilterExist = true`

**Supported Policy Types**: SettingsCatalog, DeviceCompliancePolicies, GroupPolicyConfiguration

---

### 4. Group Assignments

#### 4.1 Group Assignment - Basic
**Scenario**: Assigning policy to a specific group

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_NoAssignments,Test Group,Include,Add,,
```

**Expected Result**:
- Group assignment created
- `GroupExists = true`

**Supported Policy Types**: All policy types

---

#### 4.2 Group Assignment - With Exclude Filter (Existing)
**Scenario**: Group assignment with Exclude filter already exists

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_Group_Filter,Test Group,Include,Add,Test Filter,Exclude
```

**Expected Result**:
- `IsMigrated = true`
- `FilterExist = true`
- `DeviceAndAppManagementAssignmentFilterType = "Exclude"`

**Supported Policy Types**: SettingsCatalog

---

#### 4.3 Group Assignment - With Include Filter (Existing)
**Scenario**: Group assignment with Include filter already exists

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_Group_IncludeFilter,Test Group,Include,Add,Test Filter,Include
```

**Expected Result**:
- `IsMigrated = true`
- `FilterExist = true`
- `DeviceAndAppManagementAssignmentFilterType = "Include"`

**Supported Policy Types**: SettingsCatalog

---

#### 4.4 Group Assignment - Add Filter to Existing
**Scenario**: Adding filter to group assignment that doesn't have one

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_Group,Test Group,Include,Add,Test Filter,Include
```

**Expected Result**:
- `IsMigrated = false`
- `IsReadyForMigration = true`
- New filtered assignment will be added

**Supported Policy Types**: SettingsCatalog

---

### 5. Group Exclusion Assignments

#### 5.1 Group Exclusion - Basic
**Scenario**: Excluding a group from policy

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_ExclusionGroup,Excluded Group,Exclude,Add,,
```

**Expected Result**:
- `IsMigrated = true`
- `AssignmentType = GroupExclude`
- `AssignmentExists = true`

**Supported Policy Types**: SettingsCatalog

---

#### 5.2 Group Exclusion - With Filter
**Scenario**: Group exclusion with filter

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_ExclusionGroup_Filter,Excluded Group,Exclude,Add,Test Filter,Exclude
```

**Expected Result**:
- Exclusion with filter created
- Filter validated

**Supported Policy Types**: SettingsCatalog

---

### 6. No Assignment Operations

#### 6.1 No Assignment - Already Empty
**Scenario**: Policy has no assignments and CSV requests no assignment

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_NoAssignments,,NoAssignment,Replace,,
```

**Expected Result**:
- `IsMigrated = true`
- `AssignmentType = NoAssignment`
- No changes needed

**Supported Policy Types**: SettingsCatalog, DeviceCompliancePolicies

---

#### 6.2 No Assignment - Remove All
**Scenario**: Removing all assignments from policy

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_Group,,NoAssignment,Replace,,
```

**Expected Result**:
- All assignments removed
- `Assignments.Count = 0`

**Supported Policy Types**: SettingsCatalog, DeviceCompliancePolicies, DeviceConfigurationPolicy

---

### 7. Batch Operations

#### 7.1 Replace Then Add Exclusion
**Scenario**: Replace all assignments, then add an exclusion group

**CSV Input** (two rows):
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_MultipleAssignments,Test Group,Include,Replace,,
SettingsCatalog_MultipleAssignments,Exclusion Group,Exclude,Add,,
```

**Expected Result**:
- First: Original 3 assignments replaced with Test Group (1 assignment)
- Second: Exclusion Group added (2 total assignments)
- Final: Include + Exclude assignments

**Supported Policy Types**: SettingsCatalog, DeviceCompliancePolicies, DeviceConfigurationPolicy

---

#### 7.2 Replace With Filter Then Add Group
**Scenario**: Replace with filtered assignment, then add another group

**CSV Input** (two rows):
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_Group,Test Group,Include,Replace,Test Filter,Exclude
SettingsCatalog_Group,Second Group,Include,Add,,
```

**Expected Result**:
- First: Original replaced with Test Group + Exclude filter
- Second: Second Group added without filter
- Final: 2 assignments (one with filter, one without)

**Supported Policy Types**: SettingsCatalog, DeviceCompliancePolicies, DeviceConfigurationPolicy

---

### 8. Validation Scenarios

#### 8.1 Invalid Assignment Direction
**Scenario**: CSV contains invalid direction value

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_NoAssignments,Test Group,InvalidDirection,Add,,
```

**Expected Result**:
- `IsReadyForMigration = false`
- `CorrectAssignmentTypeProvided = false`
- Error: Invalid assignment direction

**Supported Policy Types**: All policy types

---

#### 8.2 Invalid Assignment Action
**Scenario**: CSV contains invalid action value

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_Group,Test Group,Include,InvalidAction,,
```

**Expected Result**:
- `IsReadyForMigration = false`
- `CorrectAssignmentActionProvided = false`
- Error: Invalid assignment action

**Supported Policy Types**: All policy types

---

#### 8.3 Non-Existent Group
**Scenario**: CSV references a group that doesn't exist

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_NoAssignments,NonExistentGroup,Include,Add,,
```

**Expected Result**:
- `IsReadyForMigration = false`
- `GroupExists = false`
- Error: Group not found

**Supported Policy Types**: All policy types

---

#### 8.4 Non-Existent Filter
**Scenario**: CSV references a filter that doesn't exist

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_Group,Test Group,Include,Add,NonExistentFilter,Include
```

**Expected Result**:
- `IsReadyForMigration = false`
- `FilterExist = false`
- Error: Filter not found

**Supported Policy Types**: All policy types

---

#### 8.5 Filter Platform Incompatibility
**Scenario**: Filter platform doesn't match policy platform

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_Group,Test Group,Include,Add,Android Filter,Include
```

**Prerequisites**:
- Policy Platform: Windows
- Filter Platform: Android

**Expected Result**:
- `IsReadyForMigration = false`
- `CorrectFilterPlatform = false`
- Error: Platform mismatch

**Supported Policy Types**: All policy types

---

#### 8.6 Invalid Filter Type
**Scenario**: CSV contains invalid filter direction

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_Group,Test Group,Include,Add,Test Filter,InvalidFilterType
```

**Expected Result**:
- `IsReadyForMigration = false`
- `CorrectFilterTypeProvided = false`
- Error: Invalid filter type

**Supported Policy Types**: All policy types

---

#### 8.7 Duplicate Policy Names
**Scenario**: Multiple policies with the same name exist

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
Duplicate Policy,Test Group,Include,Add,,
```

**Expected Result**:
- `IsReadyForMigration = false`
- `PolicyExists = true`
- `PolicyIsUnique = false`
- `Policies.Count = 2` (or more)
- Error: Multiple policies found

**Supported Policy Types**: All policy types

---

#### 8.8 Duplicate Filter Names
**Scenario**: Multiple filters with the same name exist

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_Group,Test Group,Include,Add,Duplicate Filter,Include
```

**Expected Result**:
- `IsReadyForMigration = false`
- `FilterExist = true`
- `FilterIsUnique = false`
- Error: Multiple filters found

**Supported Policy Types**: All policy types

---

#### 8.9 Policy Not Found
**Scenario**: CSV references a policy that doesn't exist

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
NonExistentPolicy,Test Group,Include,Add,,
```

**Expected Result**:
- `IsReadyForMigration = false`
- `PolicyExists = false`
- Error: Policy not found

**Supported Policy Types**: All policy types

---

#### 8.10 Policy Name with Whitespace
**Scenario**: Policy name normalization with whitespace

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
  SettingsCatalog_Group  ,Test Group,Include,Add,,
```

**Expected Result**:
- Whitespace trimmed during comparison
- `PolicyExists = true`
- `PolicyIsUnique = true`
- Policy matched successfully

**Supported Policy Types**: All policy types

---

### 9. Complex Scenarios

#### 9.1 Replace Action - Policy with Multiple Assignments
**Scenario**: Attempting to replace when policy has multiple assignments

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_MultipleAssignments,Test Group,Include,Replace,,
```

**Prerequisites**:
- Policy has 3 existing assignments

**Expected Result**:
- All assignments removed
- New Test Group assignment added
- Final count: 1 assignment

**Supported Policy Types**: SettingsCatalog, DeviceCompliancePolicies

---

#### 9.2 Mixed Assignment Types - Add Group to All Users
**Scenario**: Attempting to add group assignment to policy with All Users

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_AllUsers,Test Group,Include,Add,,
```

**Expected Result**:
- `IsReadyForMigration = false`
- Error: Cannot mix group assignments with All Users
- Validation prevents incompatible assignment types

**Supported Policy Types**: All policy types

---

#### 9.3 Mixed Assignment Types - Add All Users to Group Policy
**Scenario**: Attempting to add All Users to policy with existing group assignments

**CSV Input**:
```csv
PolicyName,GroupName,AssignmentDirection,AssignmentAction,FilterName,FilterType
SettingsCatalog_Group,All Users,Include,Add,,
```

**Expected Result**:
- `IsReadyForMigration = false`
- Error: Cannot add All Users to policy with group assignments
- Validation prevents incompatible assignment types

**Supported Policy Types**: All policy types

---

## Test Data Reference

### Available Test Policies
Each policy type includes these variants:
1. `{PolicyType}_AllUsers` - Policy with All Users assignment
2. `{PolicyType}_AllUsers_Filter` - All Users with Exclude filter
3. `{PolicyType}_AllDevices` - Policy with All Devices assignment
4. `{PolicyType}_AllDevices_Filter` - All Devices with Exclude filter
5. `{PolicyType}_Group` - Policy with group assignment
6. `{PolicyType}_Group_Filter` - Group with Exclude filter
7. `{PolicyType}_Group_IncludeFilter` - Group with Include filter
8. `{PolicyType}_ExclusionGroup` - Policy with exclusion group
9. `{PolicyType}_ExclusionGroup_Filter` - Exclusion group with filter
10. `{PolicyType}_NoAssignments` - Policy with no assignments
11. `{PolicyType}_MultipleAssignments` - Policy with 3 assignments (group + all users + all devices with filter)

### Test Groups
- **Test Group**: ID `22222222-2222-2222-2222-222222222222`
- **Excluded Group**: ID `33333333-3333-3333-3333-333333333333`
- **Exclusion Group**: ID `33333333-3333-3333-3333-333333333333`
- **Second Group**: ID `55555555-5555-5555-5555-555555555555`

### Test Filters
- **Test Filter**: ID `11111111-1111-1111-1111-111111111111`, Platform: Windows

### Supported Policy Types
- `SettingsCatalog`
- `DeviceCompliancePolicies`
- `DeviceConfigurationPolicy`
- `GroupPolicyConfiguration`

---

## Summary Statistics

- **Total Scenarios**: 40+
- **Basic Operations**: 6
- **All Users**: 3
- **All Devices**: 2
- **Group Assignments**: 4
- **Group Exclusions**: 2
- **No Assignment**: 2
- **Batch Operations**: 2
- **Validations**: 10
- **Complex Scenarios**: 3