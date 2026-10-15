# Needed Permissions

Intune Assistant

## Needed Permissions

Complete guide to configuring granular permissions for Intune Assistant users

## [Permissions Overview](needed-permissions.md#permissions-overview)

Learn how to configure the required permissions for Intune Assistant and how to set up granular permissions for users in your organization.

### [Required Graph API Permissions](needed-permissions.md#required-graph-api-permissions)

Intune Assistant requests Microsoft Graph API permissions in stages: a core set the first time you sign up, and extra permissions the first time you use a feature that needs them. If you see a consent prompt again after your initial setup, it's one of these additional feature requests — not a repeat of something you already granted.

#### Core permissions (requested when you sign up)

| Permission                                | Type           | Description                                            |
| ------------------------------------------ | -------------- | -------------------------------------------------------- |
| `Group.Read.All`                          | Delegated      | Read group memberships and properties                    |
| `GroupMember.Read.All`                    | Delegated      | Read group membership relationships                       |
| `User.ReadBasic.All`                      | Delegated      | Read basic user information like name and email            |
| `RoleManagement.Read.Directory`           | Delegated      | Read Microsoft Entra ID directory role assignments          |
| `AuditLog.Read.All`                       | Delegated      | Read Microsoft Entra ID and Intune audit logs               |
| `Directory.AccessAsUser.All`              | Delegated only | Access directory data on behalf of the signed-in user       |
| `DeviceManagementConfiguration.Read.All`  | Delegated      | Read Intune configuration profiles and baselines            |
| `DeviceManagementScripts.Read.All`        | Delegated      | Read PowerShell and shell scripts                           |
| `DeviceManagementRBAC.Read.All`           | Delegated      | Read Intune role-based access control assignments           |
| `DeviceManagementApps.Read.All`           | Delegated      | Read managed applications and app configurations            |
| `DeviceManagementServiceConfig.Read.All`  | Delegated      | Read device management service configuration                |
| `DeviceManagementManagedDevices.Read.All` | Delegated      | Read managed device inventory                               |
| `Policy.Read.ConditionalAccess`           | Delegated      | Read Conditional Access policies                            |

Mostly read-only

Most core permissions are read-only. One exception: `Directory.AccessAsUser.All` lets Intune Assistant act on Microsoft Graph on your behalf using your own directory permissions.

### [Configuring Granular User Permissions](needed-permissions.md#configuring-granular-user-permissions)

Instead of giving users full Intune Administrator permissions, you can configure granular role-based access control (RBAC) permissions. This follows the principle of least privilege.

#### [Understanding Intune RBAC](needed-permissions.md#understanding-intune-rbac)

Microsoft Intune uses role-based access control to determine what actions users can perform. Each role contains:

* **Permissions**: What actions can be performed
* **Scope**: Which resources the role applies to
* **Assignments**: Which users or groups have the role

#### [Required Intune Roles for Intune Assistant](needed-permissions.md#required-intune-roles-for-intune-assistant)

Since Intune Assistant only reads data, users need roles with **read permissions** for the following categories:

[**Device Configuration Reader**](needed-permissions.md#device-configuration-reader)

Allows reading device configuration profiles and compliance policies.

**Required permissions:**

* Device configuration policies: **Read**
* Device compliance policies: **Read**
* Device enrollment: **Read**

[**Application Reader**](needed-permissions.md#application-reader)

Allows reading application management data.

**Required permissions:**

* Mobile applications: **Read**
* Mobile application management policies: **Read**

[**Reports Reader**](needed-permissions.md#reports-reader)

Allows reading reports and analytics data.

**Required permissions:**

* Reports: **Read**

[**Conditional Access Reader**](needed-permissions.md#conditional-access-reader)

Allows reading Conditional Access policies.

**Required permissions:**

* Conditional Access: **Read**

#### [Creating a Custom Role](needed-permissions.md#creating-a-custom-role)

For optimal security, create a custom role with only the required read permissions:

{% stepper %}
{% step %}
### Navigate to Microsoft Intune admin center

* Go to [Microsoft Intune admin center](https://go.microsoft.com/fwlink/?linkid=2109431)
* Select **Tenant administration** > **Roles** > **All roles**
{% endstep %}

{% step %}
### Create new role

* Click **Create**
* Enter role name: `Intune Assistant Reader`
* Add description: `Read-only access for Intune Assistant users`
{% endstep %}

{% step %}
### Configure permissions

* **Device configuration policies**: Read ✓
* **Device compliance policies**: Read ✓
* **Device enrollment**: Read ✓
* **Mobile applications**: Read ✓
* **Mobile application management policies**: Read ✓
* **Reports**: Read ✓
* **Organization**: Read ✓
{% endstep %}

{% step %}
### Set scope and assignments

* Define which users/groups should have this role
* Set appropriate scope tags if needed
{% endstep %}
{% endstepper %}

#### [Built-in Roles Alternative](needed-permissions.md#built-in-roles-alternative)

If you prefer using built-in roles, assign users to:

* **Intune Service Administrator** (full read/write - not recommended)
* **Reports Reader** (limited to reports only)
* **Global Reader** (read access across Microsoft 365)

Recommended approach

We recommend creating a custom role with only the required read permissions to follow the principle of least privilege.

### [Troubleshooting](needed-permissions.md#troubleshooting)

Common permission issues:

| Issue                         | Solution                                                   |
| ----------------------------- | ---------------------------------------------------------- |
| User cannot see any data      | Check if user has required Intune role assigned            |
| Missing device configurations | Verify `DeviceManagementConfiguration.Read.All` permission |
| Missing applications          | Check `DeviceManagementApps.Read.All` permission           |

### [Consent missing](needed-permissions.md#consent-missing)

Intune Assistant requires admin consent for the Graph API permissions. Ensure that a Global Administrator has granted consent for the application in your tenant. New features may require additional permissions, if a required consent is missing you will get notified in the right bottom corner. (see the screenshot below) Then run the consent again.


### [Additional Resources](needed-permissions.md#additional-resources)

* [Microsoft Intune RBAC Reference](https://learn.microsoft.com/en-us/intune/fundamentals/role-based-access-control-reference)
* [Create custom roles in Intune](https://learn.microsoft.com/en-us/intune/fundamentals/create-custom-role)
* [Scope tags for distributed IT](https://learn.microsoft.com/en-us/intune/fundamentals/scope-tags)

Best practice

Regularly review and audit user permissions to ensure they align with current job responsibilities and security requirements.
