# Intune Assistant — API Reference

All endpoints are relative to the base URL:

| Environment | Base URL |
|-------------|----------|
| **Production** | `https://api.intuneassistant.cloud/v1` |
| **Test** | `https://intuneassistant-api-test.azurewebsites.net/v1` |
| **Development** | `https://localhost:7224/v1` |

The active base URL is selected automatically from the `APP_ENV` / `NEXT_PUBLIC_APP_ENV` environment variable.

---

## Authentication

Every request must carry a **Bearer token** issued by Microsoft Entra ID (MSAL). The token is acquired silently using MSAL's `acquireTokenSilent` before every call.

```
Authorization: Bearer <access_token>
```

Multi-tenant calls also include:

```
X-Tenant-ID: <tenantId>
```

---

## Standard envelope

Every response from the API follows the same top-level envelope:

```json
{
  "status": "Success" | "Failed" | "Error",
  "message": "Human-readable summary",
  "details": ["Optional warning strings"],
  "data": { ... }
}
```

The client library additionally wraps this in `ApiResponseWithCorrelation<T>`:

```ts
interface ApiResponseWithCorrelation<T> {
  data: T;           // the envelope above
  correlationId: string | null;
}
```

---

## API Groups

| Group | Base path | Description |
|-------|-----------|-------------|
| [Version](#version) | `/version` | API health & version |
| [Customer](#customer) | `/customer` | Customer profile & tenants |
| [Consent](#consent) | `/consent` | Consent flow |
| [Assignments](#assignments) | `/assignments` | Intune policy assignment queries |
| [CA Assignments](#ca-assignments) | `/assignments/ca` | Conditional Access assignment migration |
| [Policies](#policies) | `/policies` | Configuration & CA policies |
| [Compare](#compare) | `/compare` | Policy comparison |
| [Settings](#settings) | `/settings` | Settings catalog & definitions |
| [Groups](#groups) | `/groups` | Entra ID group look-up |
| [Devices](#devices) | `/devices` | Intune device inventory & stats |
| [Roles](#roles) | `/roles` | RBAC / scope tags |
| [RBAC Analysis](#rbac-analysis) | `/rbac` | Intune Admin Analyzer |
| [Monitor](#monitor) | `/monitor` | Configuration drift monitoring |
| [Audit Events](#audit-events) | `/audit` | Intune audit event stream |
| [Audit Log](#audit-log) | `/auditlog` | Intune Assistant internal audit log |
| [Worker](#worker) | `/worker` | Background job worker |
| [Export](#export) | `/export` | Data export |

---

## Version

### `GET /version`

Returns the current API version and health status. Used by the **Version** page and health checks.

**Response `data`**:
```json
{
  "version": "1.4.2",
  "environment": "production",
  "buildDate": "2026-04-01T00:00:00Z"
}
```

---

## Customer

### `GET /customer`

Returns the authenticated customer's profile including licence and feature flags.

**Response `data`**:

| Field | Type | Description |
|-------|------|-------------|
| `customerId` | `string` | Unique customer identifier |
| `displayName` | `string` | Organisation display name |
| `isBetaTester` | `boolean` | Access to beta features |
| `isActive` | `boolean` | Active subscription |
| `licenceType` | `string` | `free` / `support` / `extensions` / `enterprise` |
| `features` | `string[]` | Enabled feature flags |

---

### `GET /customer/tenants`

Returns all Entra ID tenants linked to this customer account.

**Response `data`** (array):

| Field | Type | Description |
|-------|------|-------------|
| `tenantId` | `string` | Entra ID tenant ID |
| `tenantDisplayName` | `string` | Display name |
| `domain` | `string` | Primary domain |
| `isActive` | `boolean` | Tenant is reachable |

---

## Consent

### `GET /consent/build-url`

Builds a Microsoft admin-consent URL for the requesting tenant.

**Query parameters**: none (tenant resolved from `X-Tenant-ID` header)

**Response `data`**:
```json
{
  "consentUrl": "https://login.microsoftonline.com/{tenant}/adminconsent?..."
}
```

---

### `POST /consent/callback`

Processes the consent callback after the admin has granted consent.

**Request body**:
```json
{
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "adminConsent": true,
  "state": "<state-token>"
}
```

---

### `GET /consent/utcm-verify`

Verifies UTCM consent status for the tenant.

---

### `GET /consent/intuneassistant-verify`

Verifies Intune Assistant app consent for the tenant.

**Response `data`**:
```json
{
  "isConsented": true,
  "missingPermissions": []
}
```

---

## Assignments

### `GET /assignments`

Returns all Intune policy assignments for the tenant.

**Response `data`** (array of assignment objects):

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Assignment ID |
| `policyId` | `string` | Policy ID |
| `policyName` | `string` | Policy display name |
| `policyType` | `string` | e.g. `ConfigurationPolicy`, `CompliancePolicy` |
| `assignmentType` | `string` | `GroupAssignment`, `AllDevices`, `AllUsers` |
| `groupId` | `string \| null` | Assigned group ID |
| `groupName` | `string \| null` | Assigned group name |
| `filterType` | `string \| null` | `include` / `exclude` / `none` |
| `filterId` | `string \| null` | Assignment filter ID |

---

### `GET /assignments/groups`

Returns assignments aggregated by group.

---

### `GET /assignments/filters`

Returns all available assignment filters defined in the tenant.

**Response `data`** (array):

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Filter ID |
| `displayName` | `string` | Filter name |
| `platform` | `string` | `windows10AndLater`, `iOS`, `macOS`, etc. |
| `rule` | `string` | OData filter rule expression |

---

### `GET /assignments/with-filter`

Returns assignments that use assignment filters.

---

### `POST /assignments/compare`

Compares a desired assignment state against current tenant assignments.

**Request body**: same shape as CA compare (see [CA Assignments](#ca-assignments)).

---

## CA Assignments

These three endpoints power the **CA Assignment Migration** workflow. All share the same request body shape.

**Common request body** (array):
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

| Field | Type | Allowed values | Description |
|-------|------|---------------|-------------|
| `policyName` | `string` | Any | CA policy display name (exact match) |
| `groupName` | `string \| null` | Any | Group display name. `null` targets All Users |
| `assignmentDirection` | `string` | `Include` / `Exclude` | Include or exclude list |
| `assignmentAction` | `string` | `Add` / `Remove` | Add or remove the assignment |

---

### `POST /assignments/ca/compare`

Pre-flight check — validates each row against live Entra ID without making any changes.

**Response `data`** (array):

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Result item ID |
| `providedPolicyName` | `string` | Policy name from the request |
| `groupToMigrate` | `string` | Group name from the request |
| `assignmentDirection` | `string` | `Include` / `Exclude` |
| `assignmentAction` | `string` | `Add` / `Remove` |
| `isMigrated` | `boolean` | Assignment already exists in Entra ID |
| `isReadyForMigration` | `boolean \| null` | All checks passed |
| `policy.id` | `string` | Entra ID policy object ID |
| `policy.displayName` | `string` | Resolved policy display name |
| `policy.state` | `string` | `enabled` / `disabled` / `enabledForReportingButNotEnforced` |
| `migrationCheckResult.policyExists` | `boolean` | Policy found by name |
| `migrationCheckResult.policyIsUnique` | `boolean \| null` | No duplicate policy names |
| `migrationCheckResult.groupExists` | `boolean \| null` | Group found by display name |
| `migrationCheckResult.correctAssignmentTypeProvided` | `boolean \| null` | Assignment type is valid |
| `migrationCheckResult.correctAssignmentActionProvided` | `boolean` | Action is valid |
| `migrationCheckResult.assignmentIsCompatible` | `boolean \| null` | No conflicting assignments |
| `migrationCheckResult.compatibilityErrors` | `string[]` | Compatibility failure details |
| `warnings` | `string[]` | Non-blocking warnings |

**Example — ready row**:
```json
{
  "id": "7ea8314a-621e-414c-8a54-870d0719de79",
  "providedPolicyName": "CAD001-O365: Grant macOS access for All users...",
  "groupToMigrate": "AAD_DA_AutoPilot-Devices",
  "assignmentDirection": "Include",
  "assignmentAction": "Add",
  "isMigrated": false,
  "isReadyForMigration": true,
  "migrationCheckResult": {
    "policyExists": true,
    "policyIsUnique": true,
    "groupExists": true,
    "correctAssignmentTypeProvided": true,
    "correctAssignmentActionProvided": true,
    "assignmentIsCompatible": true,
    "compatibilityErrors": []
  },
  "warnings": []
}
```

---

### `POST /assignments/ca/migrate`

Applies the requested assignment changes to Entra ID.

**Response `data`** (array):

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Result item ID |
| `providedPolicyName` | `string` | Policy name from the request |
| `groupToMigrate` | `string` | Group name from the request |
| `assignmentDirection` | `number` | `1 = Include`, `2 = Exclude` |
| `assignmentAction` | `number` | `0 = Add`, `1 = Remove` |
| `status` | `string` | `Success` / `Failed` / `Skipped` / `NotStarted` |
| `errorMessage` | `string \| null` | Failure detail (when `status = Failed`) |
| `processedAt` | `ISO datetime` | Timestamp when the item was processed |

**Example**:
```json
{
  "id": "e29ea2ed-bcf3-4e0f-bd17-e2e7b055f5c2",
  "providedPolicyName": "CAD001-O365: Grant macOS access...",
  "groupToMigrate": "AAD_DA_AutoPilot-Devices-KioskMulti",
  "assignmentDirection": 1,
  "assignmentAction": 1,
  "status": "Success",
  "errorMessage": null,
  "processedAt": "2026-05-06T07:45:03.038828Z"
}
```

---

### `POST /assignments/ca/validate`

Post-migration validation — confirms each assignment is genuinely present in Entra ID.

**Response `data`** (array):

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Result item ID |
| `hasCorrectAssignment` | `boolean` | Assignment confirmed in Entra ID |
| `providedPolicyName` | `string` | Policy name from the request |
| `groupName` | `string` | Group name from the request |
| `assignmentDirection` | `string` | `Include` / `Exclude` |
| `assignmentAction` | `string` | `Add` / `Remove` |
| `message.status` | `string` | `Valid` / `Invalid` |
| `message.reason` | `string` | Human-readable explanation |
| `policy.id` | `string` | Entra ID policy object ID |
| `policy.displayName` | `string` | Policy display name |
| `policy.state` | `string` | Current enforcement state |
| `policy.conditions` | `object` | Full policy conditions snapshot |

**Example**:
```json
{
  "id": "f0f22754-3f08-4a89-9a7e-9a43fd6e7c79",
  "hasCorrectAssignment": true,
  "providedPolicyName": "CAD001-O365: Grant macOS access...",
  "groupName": "AAD_DA_AutoPilot-Devices",
  "assignmentDirection": "Include",
  "assignmentAction": "Add",
  "message": {
    "status": "Valid",
    "reason": "Post-migration validation passed"
  }
}
```

---

## Policies

### `GET /policies/configuration`

Returns all Intune configuration policies (Settings Catalog, Device Configuration, Administrative Templates).

**Response `data`** (array):

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Policy ID |
| `displayName` | `string` | Policy display name |
| `description` | `string` | Description |
| `platforms` | `string` | Target platforms |
| `technologies` | `string` | Applicable technologies |
| `createdDateTime` | `ISO datetime` | Creation timestamp |
| `lastModifiedDateTime` | `ISO datetime` | Last modified timestamp |
| `settingCount` | `number` | Number of configured settings |
| `assignmentCount` | `number` | Number of assignments |

---

### `DELETE /policies/configuration/bulk`

Bulk-delete configuration policies.

**Request body**:
```json
{
  "policyIds": ["id1", "id2", "id3"]
}
```

---

### `GET /policies/ca`

Returns all Conditional Access policies for the tenant.

**Response `data`** (array):

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Policy ID |
| `displayName` | `string` | Policy display name |
| `state` | `string` | `enabled` / `disabled` / `enabledForReportingButNotEnforced` |
| `createdDateTime` | `ISO datetime` | Creation timestamp |
| `modifiedDateTime` | `ISO datetime` | Last modified timestamp |
| `conditions.users.includeUsers` | `string[]` | Included user IDs or `"All"` |
| `conditions.users.excludeGroups` | `string[]` | Excluded group IDs |
| `conditions.applications.includeApplications` | `string[]` | Included app IDs or `"Office365"` |
| `conditions.platforms.includePlatforms` | `string[]` | Platforms, e.g. `["macOS"]` |
| `grantControls.builtInControls` | `string[]` | e.g. `["compliantDevice", "mfa"]` |

---

### `GET /policies/configuration/settings`

Returns settings for a specific configuration policy.

**Query parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `policyId` | `string` | Policy ID |

---

### `GET /policies/settings/catalog`

Returns settings catalog definitions.

---

### `GET /policies/settings/deviceconfig`

Returns device configuration settings.

---

### `GET /policies/settings/grouppolicy`

Returns group policy (ADMX) settings.

---

### `GET /policies/group/settings`

Returns group policy configuration settings for a specific policy.

---

## Compare

### `GET /compare`

Landing — returns available policy types that support comparison.

---

### `POST /compare`

Compares two policies by ID and returns a structured diff.

**Request body**:
```json
{
  "sourcePolicyId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "targetPolicyId": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
  "policyType": "configurationPolicy"
}
```

**Response `data`**:

| Field | Type | Description |
|-------|------|-------------|
| `sourcePolicyName` | `string` | Source policy display name |
| `targetPolicyName` | `string` | Target policy display name |
| `matchPercentage` | `number` | 0–100 similarity score |
| `identicalSettings` | `object[]` | Settings with identical values |
| `differentSettings` | `object[]` | Settings with different values |
| `sourceOnlySettings` | `object[]` | Settings only in source |
| `targetOnlySettings` | `object[]` | Settings only in target |

---

### `POST /compare/{policyType}/set-analysis`

Bulk set analysis — compares an uploaded JSON policy file against all tenant policies of the given type.

**Path parameter**:

| Parameter | Allowed values | Description |
|-----------|---------------|-------------|
| `policyType` | `configurationPolicy`, `deviceConfiguration`, `groupPolicy` | Policy type to compare against |

**Request body**: uploaded JSON policy object(s).

**Response `data`** (array per uploaded policy):

| Field | Type | Description |
|-------|------|-------------|
| `uploadedPolicyName` | `string` | Name from the uploaded file |
| `status` | `string` | `Match` / `Conflict` / `Missing` / `Extra` |
| `matchedTenantPolicyId` | `string \| null` | Closest matching tenant policy |
| `matchedTenantPolicyName` | `string \| null` | Matched policy display name |
| `matchPercentage` | `number` | Similarity percentage |
| `conflictingSettings` | `object[]` | Settings that differ |
| `missingSettings` | `object[]` | Settings in upload not in tenant |
| `extraSettings` | `object[]` | Settings in tenant not in upload |

---

## Settings

### `GET /settings/definitions/resolve`

Resolves setting definition IDs to human-readable names.

**Query parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `settingDefinitionIds` | `string` (comma-separated) | Setting definition IDs to resolve |

**Response `data`** (array):

| Field | Type | Description |
|-------|------|-------------|
| `definitionId` | `string` | Input definition ID |
| `displayName` | `string` | Human-readable setting name |
| `description` | `string` | Setting description |
| `dataType` | `string` | Setting value type |

---

## Groups

### `GET /groups`

Returns Entra ID groups with basic metadata.

**Response `data`** (array):

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Group object ID |
| `displayName` | `string` | Group display name |
| `groupType` | `string` | `Security` / `Microsoft365` / `Distribution` |
| `memberCount` | `number` | Member count |
| `isAssignedInIntune` | `boolean` | Group is referenced in Intune assignments |

---

### `GET /groups/list`

Returns a lightweight list of groups (ID + display name) for dropdowns.

---

## Devices

### `GET /devices/stats`

Returns paginated device inventory with hardware and compliance details.

**Query parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `pageNumber` | `number` | `1` | Page number |
| `pageSize` | `number` | `25` | Items per page |
| `search` | `string` | — | Search term |
| `platform` | `string` | — | Filter by platform |
| `complianceState` | `string` | — | `compliant` / `noncompliant` / `unknown` |

**Response `data`**:

| Field | Type | Description |
|-------|------|-------------|
| `data` | `DeviceStats[]` | Page of device objects |
| `totalCount` | `number` | Total devices |
| `pageSize` | `number` | Items per page |
| `currentPage` | `number` | Current page |
| `totalPages` | `number` | Total pages |
| `hasNextPage` | `boolean` | More pages available |
| `nextPageToken` | `string \| null` | Cursor for next page |

**`DeviceStats` key fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Intune device ID |
| `deviceName` | `string` | Device display name |
| `operatingSystem` | `string` | OS name |
| `osVersion` | `string` | OS version |
| `complianceState` | `string` | `compliant` / `noncompliant` / `unknown` |
| `lastSyncDateTime` | `ISO datetime` | Last sync with Intune |
| `enrolledDateTime` | `ISO datetime` | Enrolment date |
| `manufacturer` | `string` | Hardware manufacturer |
| `model` | `string` | Device model |
| `serialNumber` | `string` | Serial number |
| `userPrincipalName` | `string` | Primary user UPN |
| `hardwareInformation` | `DeviceHardwareInfo` | Extended hardware details |

---

## Roles

### `GET /roles/scopeTags`

Returns all Intune role scope tags for the tenant.

**Response `data`** (array):

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Scope tag ID |
| `displayName` | `string` | Scope tag display name |
| `description` | `string` | Description |
| `isBuiltIn` | `boolean` | Built-in (Default) tag |

---

## RBAC Analysis

### `GET /rbac`

Returns RBAC overview — all custom Intune roles defined in the tenant.

---

### `GET /rbac/analysis`

Runs the **Intune Admin Analyzer** — identifies over-privileged Intune administrators based on actual audit activity.

**Query parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `lookbackDays` | `number` | `60` | Days of audit history to analyse |

**Response `data`** (array of user analysis objects):

| Field | Type | Description |
|-------|------|-------------|
| `userId` | `string` | Entra ID user object ID |
| `userPrincipalName` | `string` | User UPN |
| `displayName` | `string` | User display name |
| `roleAssignments` | `RoleAssignment[]` | All Intune roles assigned |
| `assignmentType` | `string` | `Direct` / `Group` / `NestedGroup` |
| `activitySummary.totalEvents` | `number` | Total audit events in period |
| `activitySummary.writeEvents` | `number` | Create / Update / Delete events |
| `activitySummary.readEvents` | `number` | Read-only events |
| `activitySummary.lastActivity` | `ISO datetime \| null` | Most recent activity |
| `recommendation` | `string` | `KeepRole` / `DowngradeToReadOnly` / `RemoveRole` |
| `recommendationReason` | `string` | Human-readable rationale |

---

## Monitor

### `GET /monitor/configuration`

Returns all configuration drift monitors defined for the customer.

**Response `data`** (array):

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Monitor ID |
| `displayName` | `string` | Monitor display name |
| `policyId` | `string` | Monitored policy ID |
| `policyName` | `string` | Monitored policy name |
| `policyType` | `string` | Policy type |
| `isEnabled` | `boolean` | Monitor is active |
| `lastCheckedAt` | `ISO datetime \| null` | Last drift check |
| `hasDrift` | `boolean` | Drift detected since last baseline |
| `baselineCreatedAt` | `ISO datetime \| null` | Baseline snapshot timestamp |

---

### `GET /monitor/configuration/drifts`

Returns all detected drifts across all monitors.

**Response `data`** (array):

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Drift record ID |
| `monitorId` | `string` | Parent monitor ID |
| `policyName` | `string` | Policy where drift was detected |
| `detectedAt` | `ISO datetime` | When the drift was first detected |
| `settingName` | `string` | Setting that changed |
| `baselineValue` | `string` | Original (baseline) value |
| `currentValue` | `string` | Current detected value |
| `isResolved` | `boolean` | Drift has been acknowledged/resolved |

---

### `GET /monitor/configuration/results`

Returns the latest check results for all monitors.

---

### `GET /monitor/snapshots`

Returns all baseline snapshots.

---

### `POST /monitor/snapshots/jobs`

Triggers a new snapshot job for a monitor.

**Request body**:
```json
{
  "monitorId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

## Audit Events

All audit event endpoints are under `/audit`. They expose the **Intune audit log** surfaced through the Intune Assistant backend.

### `GET /audit/events/page`

Returns a paginated page of Intune audit events.

**Query parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `pageNumber` | `number` | `1` | Page |
| `pageSize` | `number` | `25` | Items per page |
| `search` | `string` | — | Free-text search |
| `category` | `string` | — | Filter by category |
| `activityType` | `string` | — | Filter by activity type |
| `actor` | `string` | — | Filter by UPN |

**Response `data`**:

| Field | Type | Description |
|-------|------|-------------|
| `items` | `AuditEvent[]` | Page of events |
| `totalCount` | `number` | Total matching events |
| `pageNumber` | `number` | Current page |
| `pageSize` | `number` | Items per page |
| `totalPages` | `number` | Total pages |

**`AuditEvent` fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Event ID |
| `displayName` | `string` | Event display name |
| `componentName` | `string` | Intune component (e.g. `MicrosoftIntuneDeviceConfiguration`) |
| `activity` | `string` | Activity description |
| `activityDateTime` | `ISO datetime` | When the activity occurred |
| `activityType` | `string` | `Create` / `Update` / `Delete` / `Get` |
| `actorUserId` | `string` | Actor's Entra ID user ID |
| `actorUserPrincipalName` | `string` | Actor's UPN |
| `category` | `string` | Event category |
| `activityResult` | `string` | `Success` / `Failure` |
| `resources` | `AuditResource[]` | Affected resources with modified properties |
| `processedAt` | `ISO datetime` | When Intune Assistant processed the event |

---

### `POST /audit/events/filter`

Filters audit events with multiple criteria.

**Request body**:
```json
{
  "categories": ["DeviceConfiguration"],
  "activityTypes": ["Update", "Delete"],
  "actors": ["admin@contoso.com"],
  "dateFrom": "2026-01-01T00:00:00Z",
  "dateTo": "2026-05-01T00:00:00Z",
  "pageNumber": 1,
  "pageSize": 25
}
```

---

### `GET /audit/metadata`

Returns all distinct values for filter dropdowns (categories, activity types, components, actors).

**Response `data`**:

| Field | Type | Description |
|-------|------|-------------|
| `categories` | `string[]` | All event categories |
| `activities` | `string[]` | All activity descriptions |
| `components` | `string[]` | All component names |
| `actors` | `string[]` | All actor UPNs |
| `activityTypes` | `string[]` | All activity types |

---

### `GET /audit/statistics`

Returns aggregated statistics for the audit event stream.

**Response `data`**:

| Field | Type | Description |
|-------|------|-------------|
| `totalEvents` | `number` | Total events stored |
| `oldestEvent` | `ISO datetime` | Oldest event timestamp |
| `newestEvent` | `ISO datetime` | Newest event timestamp |
| `eventsByCategory` | `Record<string, number>` | Count per category |
| `eventsByActivityType` | `Record<string, number>` | Count per activity type |
| `eventsByComponent` | `Record<string, number>` | Count per component |
| `eventsByActor` | `Record<string, number>` | Count per actor UPN |
| `eventsByResult` | `Record<string, number>` | `Success` vs `Failure` counts |
| `topActivities` | `{ activity, category, count }[]` | Top 10 activities |
| `mostActiveUsers` | `{ userPrincipalName, eventCount, topActivities }[]` | Most active actors |
| `timeline.eventsByDay` | `Record<string, number>` | Events per calendar day |
| `timeline.eventsByHour` | `Record<string, number>` | Events per hour of day |

---

### `GET /audit/intune/page`

Paginated raw Intune audit log (unprocessed).

---

### `POST /audit/intune/filter`

Filtered raw Intune audit log — same filter body as `/audit/events/filter`.

---

## Audit Log

### `GET /auditlog`

Returns the **Intune Assistant internal audit log** — records of actions performed by users within Intune Assistant itself (not Intune).

**Response `data`**:

| Field | Type | Description |
|-------|------|-------------|
| `logs` | `AuditLog[]` | Paginated log entries |
| `totalCount` | `number` | Total entries |
| `pageNumber` | `number` | Current page |
| `pageSize` | `number` | Items per page |
| `totalPages` | `number` | Total pages |

**`AuditLog` fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Log entry ID |
| `customerId` | `string` | Customer ID |
| `tenantId` | `string` | Tenant ID the action was performed against |
| `action` | `string` | Action description (e.g. `MigrationStarted`) |
| `performedBy` | `string \| null` | User object ID |
| `performedByName` | `string \| null` | User display name |
| `reason` | `string` | Action reason or context |
| `createdAt` | `ISO datetime` | When the action occurred |
| `metadata` | `Record<string, unknown> \| null` | Additional structured context |

---

## Worker

The Worker API manages **background job workers** — self-hosted agents that run scheduled Intune Assistant jobs (audit reports, drift checks, etc.).

### `GET /worker/management/overview`

Returns worker configuration and the list of registered worker instances.

**Response `data`**:

| Field | Type | Description |
|-------|------|-------------|
| `customerId` | `string` | Customer ID |
| `isConfigured` | `boolean` | Worker is set up |
| `isEnabled` | `boolean` | Worker is accepting jobs |
| `acceptNewJobs` | `boolean` | New jobs will be queued |
| `autoUpdate` | `boolean` | Auto-update enabled |
| `updateRing` | `number` | `0 = Stable`, `1 = Preview`, `2 = Canary` |
| `senderEmail` | `string` | From address for job email reports |
| `availableVersion` | `string` | Latest available worker version |
| `workers` | `WorkerInstance[]` | Registered worker instances |

**`WorkerInstance` fields**:

| Field | Type | Description |
|-------|------|-------------|
| `workerRegistrationId` | `string` | Registration ID |
| `workerInstanceId` | `string` | Runtime instance ID |
| `workerVersion` | `string` | Currently installed version |
| `machineName` | `string` | Host machine name |
| `osVersion` | `string` | Host OS version |
| `lastHeartbeat` | `ISO datetime` | Last heartbeat from the worker |
| `timeSinceLastHeartbeat` | `timespan string` | e.g. `"0:02:15"` |
| `healthStatus` | `number` | `0 = Healthy`, `1 = Stale`, `2 = Offline`, `3 = Unknown` |
| `updateAvailable` | `boolean` | Newer version available |

---

### `GET /worker/management/settings`

Returns the current worker configuration settings.

---

### `GET /worker/management/jobs`

Returns all configured jobs.

**Response `data`** (array of `WorkerJob`):

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Job ID |
| `jobType` | `number` | `0 = AuditReport`, `1 = DriftMonitor`, `2 = Custom` |
| `jobName` | `string` | Job display name |
| `isEnabled` | `boolean` | Job is active |
| `intervalHours` | `number` | Run interval in hours |
| `cronExpression` | `string \| null` | Cron override expression |
| `lastRunAt` | `ISO datetime \| null` | Last execution time |
| `nextScheduledRun` | `ISO datetime \| null` | Next scheduled time |
| `consecutiveFailureCount` | `number` | Failures since last success |
| `isPoisoned` | `boolean` | Job disabled due to repeated failures |
| `totalExecutions` | `number` | Lifetime execution count |
| `totalSuccessCount` | `number` | Lifetime success count |
| `totalFailedCount` | `number` | Lifetime failure count |
| `jobConfigurationJson` | `string` | JSON-encoded job config (see `JobConfig`) |

**`JobConfig` fields** (decoded from `jobConfigurationJson`):

| Field | Type | Description |
|-------|------|-------------|
| `recipientEmail` | `string` | Primary report recipient |
| `ccEmails` | `string \| null` | CC recipients (comma-separated) |
| `tenantId` | `string` | Target tenant |
| `lookbackDays` | `number` | Days of history to include |
| `categories` | `string` | Event categories to include |
| `onlyReportIfEventsFound` | `boolean` | Suppress empty reports |
| `onlyReportIfDriftsFound` | `boolean` | Suppress no-drift reports |
| `maxEvents` | `number` | Max events per report |

---

### `POST /worker/management/jobs`

Creates a new job.

**Request body**: `WorkerJob` shape without `id`, `createdAt`, `updatedAt`.

---

### `GET /worker/management/jobs/{id}`

Returns a single job by ID.

---

### `POST /worker/management/jobs/{id}/run-now`

Triggers an immediate execution of the job.

**Response `data`**:
```json
{
  "executionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "status": "Queued"
}
```

---

### `GET /worker/management/jobs/{id}/executions`

Returns all executions for a job.

**Response `data`** (array of `JobExecution`):

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Execution ID |
| `jobConfigId` | `string` | Parent job ID |
| `status` | `number` | `0 = Pending`, `1 = Claimed`, `2 = InProgress`, `3 = Completed`, `4 = Failed` |
| `createdAt` | `ISO datetime` | Queued at |
| `claimedAt` | `ISO datetime \| null` | Picked up by worker |
| `startedAt` | `ISO datetime \| null` | Execution started |
| `completedAt` | `ISO datetime \| null` | Execution finished |
| `progressPercentage` | `number \| null` | 0–100 |
| `progressMessage` | `string \| null` | Current progress message |
| `resultSummaryJson` | `string \| null` | JSON summary of results |
| `errorMessage` | `string \| null` | Failure detail |

---

### `GET /worker/management/jobs/{jobId}/executions/{executionId}`

Returns a single execution by ID.

---

### `GET /worker/management/jobs/{jobId}/executions/latest`

Returns the most recent execution for a job.

---

### `GET /worker/management/jobs/{id}/history`

Returns the execution history for a job (summary view).

---

### `POST /worker/management/jobs/{id}/clone`

Clones a job configuration into a new job.

---

## Export

### `GET /export`

Exports data in a specified format.

**Query parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `string` | Data type to export (`assignments`, `policies`, `devices`) |
| `format` | `string` | `csv` / `json` |
| `tenantId` | `string` | Target tenant |

**Response**: binary file download (`Content-Disposition: attachment`).

---

## Partner

### `GET /partner/customers`

Returns the list of customer tenants managed by this partner (CSP / GDAP).

**Response `data`** (array):

| Field | Type | Description |
|-------|------|-------------|
| `tenantId` | `string` | Customer tenant ID |
| `tenantDisplayName` | `string` | Customer tenant display name |
| `domain` | `string` | Primary domain |
| `gdapStatus` | `string` | `Active` / `Pending` / `Expired` |
| `consentStatus` | `string` | `Consented` / `NotConsented` |

---

## Error Codes

| HTTP status | `status` value | Meaning |
|-------------|----------------|---------|
| `200` | `Success` | Request succeeded |
| `400` | `Error` | Bad request — check `details` for validation errors |
| `401` | `Unauthorized` | Missing or expired Bearer token |
| `403` | `Forbidden` | Insufficient Graph permissions for the operation |
| `404` | `NotFound` | Requested resource does not exist |
| `409` | `Conflict` | Duplicate or conflicting resource |
| `422` | `ValidationError` | Request body passed schema validation but failed business rules |
| `429` | `RateLimited` | Too many requests — back off and retry |
| `500` | `Error` | Internal server error — include `correlationId` in support tickets |

---

## Pagination

All list endpoints that return large datasets use this consistent pagination shape:

```json
{
  "data": [...],
  "totalCount": 450,
  "pageNumber": 2,
  "pageSize": 25,
  "totalPages": 18,
  "hasNextPage": true,
  "hasPreviousPage": true,
  "nextPageToken": null
}
```

Pass `pageNumber` and `pageSize` as query parameters. Some endpoints additionally support cursor-based pagination via `nextPageToken`.

---

## Correlation IDs

Every response includes a `correlationId` (may be `null`). Include this value in support tickets — it links the frontend request to the backend trace.

```ts
const res = await request<T>(endpoint, options);
console.log(res?.correlationId); // "a1b2c3d4-..."
```

