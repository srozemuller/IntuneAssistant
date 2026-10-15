# Backup — Troubleshooting

## Backup issues

### A resource type shows Error during export

The most common cause is a missing Graph permission. The error message in the status row will usually say `Forbidden` or `403`. Click the consent link that appears (or navigate to Settings > Permissions) and consent to the missing scope. Then retry the export.

If the error says `Not Found` or `404`, the resource type may not be provisioned for your tenant (for example, Intune Branding requires a specific Intune license tier).

### A resource type exports 0 items but items exist in Intune

Some resource types use list endpoints that do not support the `roleScopeTagIds` field in the `$select` parameter. IntuneAssistant handles this automatically for Conditional Access, Assignment Filters, Scope Tags, Named Locations, Authentication Strengths, Terms of Use, and Intune Branding. If you see 0 items for another type, check whether the account used has read permission for that resource in Intune.

### The ZIP download is empty or very small

If all resource types errored, the ZIP still downloads but the folders will be empty or absent. Review the error messages in the status table before downloading.

---

## Permissions and consent

### I see "IDW10502" in the error

This is an MSAL token acquisition error. Sign out of IntuneAssistant and sign back in, then retry the operation.
