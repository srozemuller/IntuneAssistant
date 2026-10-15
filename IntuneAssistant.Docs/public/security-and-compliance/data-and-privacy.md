# Data & Privacy

## Data & Privacy

Our commitment to data privacy and security with minimal data storage and no data leaving your tenant

## [Data & Privacy](data-and-privacy.md#data--privacy)

Intune Assistant is built with privacy by design. The core principle is that **your data stays in your tenant** - everything is processed in session memory and stored only the absolute minimum required for licensing and identification.

### [Our Privacy Commitment](data-and-privacy.md#our-privacy-commitment)

Zero Data Extraction

**No data leaves your tenant.** All Intune and Graph API data is processed in browser session memory only and never stored or transmitted to external systems.

### [Data Storage & Processing Overview](data-and-privacy.md#data-storage--processing-overview)

#### [Minimal Data Storage Approach](data-and-privacy.md#minimal-data-storage-approach)

There is a very strict minimal data storage policy with complete transparency about what is stored and why:

| Data Type                           | Stored | Purpose                                                                               | Retention  |
| ----------------------------------- | ------ | ------------------------------------------------------------------------------------- | ---------- |
| **Tenant ID**                       | ✅ Yes  | Identify tenant and enforce fair-usage licensing. (Access can be denied by Tenant ID) | Persistent |
| **Tenant Domain**                   | ✅ Yes  | Display and licensing identification                                                  | Persistent |
| **Session Data** (tokens, settings) | ❌ No   | Stored only in browser session storage                                                | Temporary  |
| **Intune Data**                     | ❌ No   | Processed in memory only. The Tenant Overview is kept in server memory for 10 minutes, never in the database | Temporary |
| **Graph API Data**                  | ❌ No   | See above | Temporary |
| **User's Device Information**       | ❌ No   | Never accessed or stored                                                              | N/A        |
| **User Personal Data**              | ❌ No   | Never accessed or stored                                                              | N/A        |

### What is stored per feature

Intune Assistant stores only onboarding and licensing data (your organization, tenant identifiers, licenses and consent), the people who use the app, and an audit trail of actions in the app.

### [How We Process Your Data](data-and-privacy.md#how-we-process-your-data)

#### [Data Flow Principles](data-and-privacy.md#data-flow-principles)

{% stepper %}
{% step %}
### Request Processing

* API calls made directly to your tenant's Graph API
* Data retrieved and processed in memory only
* Results displayed immediately to your browser
{% endstep %}

{% step %}
### No Persistence

* API responses processed and immediately discarded
* No database storage of any tenant-specific data
* No caching beyond browser session storage
{% endstep %}

{% step %}
### Session Management

* Authentication tokens stored only in browser session
* Session data cleared automatically on logout
* No server-side session persistence
{% endstep %}
{% endstepper %}

Browser session storage is used for temporary data like UI preferences and navigation state. This data is automatically cleared when you go to another page, close your browser or log out.

### [Data Security Measures](data-and-privacy.md#data-security-measures)

#### [Technical Safeguards](data-and-privacy.md#technical-safeguards)

* **HTTPS Encryption** - All communications encrypted in transit
* **No Database Storage** - No persistent storage of tenant data, except tenant Id and tenant domain
* **Memory-Only Processing** - All operations performed in volatile memory
* **Automatic Cleanup** - Memory cleared after each operation
* **Session Isolation** - Each session completely isolated from others

#### [Access Controls](data-and-privacy.md#access-controls)

* **Microsoft Identity** - Authentication through your tenant's identity provider
* **Role-Based Access** - Permissions enforced through your tenant's RBAC
* **No Backdoors** - No administrative access to your tenant data

#### [Compliance Standards](data-and-privacy.md#compliance-standards)

* **GDPR Compliant** - Privacy by design approach
* **Microsoft Security Standards** - Built on Microsoft's security framework
* **Industry Best Practices** - Following established security guidelines
* **Regular Security Reviews** - Continuous security assessment and improvement

### [Your Rights and Controls](data-and-privacy.md#your-rights-and-controls)

#### [Data Control](data-and-privacy.md#data-control)

* **Full Control** - You maintain complete control over your tenant data
* **Access Management** - Control application access through Azure AD
* **Permission Granularity** - Grant only necessary permissions
* **Revoke Access** - Instantly revoke application access at any time

#### [Transparency](data-and-privacy.md#transparency)

* **Open Source** - Application code (Webinterface) available for review
* **Clear Documentation** - Complete transparency about data handling
* **No Hidden Processes** - All data processing clearly documented
* **Regular Updates** - Privacy policy updates communicated clearly

#### [Technical Questions](data-and-privacy.md#technical-questions)

<details>

<summary>How do you handle authentication tokens?</summary>

Authentication tokens are stored only in your browser's session storage and are never transmitted to our servers or stored persistently.

</details>

<details>

<summary>Is my data encrypted?</summary>

All communication is encrypted via HTTPS. Since we don't store your data, there's no data at rest to encrypt.

</details>

<details>

<summary>Can other users see my data?</summary>

No, all data processing is isolated per user session. No data is shared between users or stored centrally.

</details>

***

Privacy Promise

**Your data stays with you.** We're committed to keeping your Microsoft tenant data exactly where it belongs - in your tenant, under your control.

***

## Leaving Intune Assistant

When you stop using Intune Assistant, ask us to offboard your organization. We export the data we store for your tenants if you want a copy, then remove it together with your tenant links and licenses. The audit trail of actions in the app and the minimal licensing record (customer and tenant identifiers) are kept. An offboarded organization is not reactivated automatically by granting consent again.
