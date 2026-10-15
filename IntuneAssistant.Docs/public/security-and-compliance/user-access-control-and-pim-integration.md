# User Access Control & PIM Integration

## User Access Control & PIM Integration

Configure secure multi-user access with role-based permissions and Privileged Identity Management

## [User Access Control & PIM Integration](user-access-control-and-pim-integration.md#user-access-control--pim-integration)

Intune Assistant supports secure multi-user environments through proper access control and integration with Microsoft Entra Privileged Identity Management (PIM).

### [Access Control Overview](user-access-control-and-pim-integration.md#access-control-overview)

#### [Default Behavior](user-access-control-and-pim-integration.md#default-behavior)

* Only the user who completes onboarding can initially access Intune Assistant, except when a user consents the app registrations for the whole organization.&#x20;
* The service principal is created with restricted access by default
* Additional users must be explicitly granted access

{% hint style="danger" %}
However, Intune Assistant has delegated permissions and acts like the current logged in user, it is HIGHLY recommended to NOT consent the app registrations for the whole organisation. By default it is only consented for the user that runs the onboarding process. \
\
The builder is NOT responsible for any security related misconfiguration.&#x20;
{% endhint %}

#### [Security Principles](user-access-control-and-pim-integration.md#security-principles)

* **Least Privilege**: Grant minimum required access
* **Explicit Assignment**: Never rely on organization-wide consent
* **Role-Based Access**: Use PIM for time-limited administrative access

### [User Assignment Methods](user-access-control-and-pim-integration.md#user-assignment-methods)

#### [Method 1: Direct User Assignment](user-access-control-and-pim-integration.md#method-1-direct-user-assignment)

{% stepper %}
{% step %}
### Navigate to Microsoft Entra ID

* Go to [Azure Portal](https://portal.azure.com/) or [Entra Admin Center](https://entra.microsoft.com/)
* Select **Enterprise Applications**
{% endstep %}

{% step %}
### Locate Intune Assistant Service Principals

* Search for "Intune Assistant"
* You'll find two applications:
  * **Intune Assistant** (Main Application)
  * **Intune Assistant API** (Backend Service)
{% endstep %}

{% step %}
### Assign Users to Both Applications

* Assign users to both the Intune Assistant and Intune Assistant API applications as needed.
{% endstep %}
{% endstepper %}

[Managing Admin Consent\ \ Handle consent requirements when new permissions are added to IntuneAssistant](/broken/pages/3285781e772e72eb9ead78862e26a5bfe729c13e)

[Data & Privacy\ \ Our commitment to data privacy and security with minimal data storage and no data leaving your tenant](data-and-privacy.md)
