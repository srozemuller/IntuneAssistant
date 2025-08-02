---
title: Multi User Support
description: An overview of authentication and permissions in the Intune Assistant
---

# Multi User Support

The Intune Assistant supports multi-user environments, but its functionality is tied to how the onboarding process is configured. Below is an explanation of the onboarding process, its limitations, and recommendations for enabling multi-user access.

## Onboarding Process

When onboarding the Intune Assistant, the process is performed **on behalf of a user**. This means:

- Only the user who completes the onboarding process is initially able to use the Intune Assistant service principal.
- By default, other users in the organization will not have access to the service principal.

### Consent for Organization

During onboarding, there is an option to **Consent for Organization**. If this option is selected:

- The service principal is made available to all users in the organization.
- However, this approach is **not a best practice** due to potential security risks, as it grants broad access to the service principal.

## Best Practices for Multi-User Access

To securely enable multi-user access, it is recommended to explicitly assign users or groups to the service principal. This ensures that only authorized individuals can use the Intune Assistant.

### Steps to Add Users or Groups to the Service Principal

1. **Navigate to Azure Active Directory**:
    - Go to the Azure portal and open the **Azure Active Directory** blade.

2. **Locate the Service Principal**:
    - Under **Enterprise Applications**, search for the Intune Assistant service principal.

3. **Assign Users or Groups**:
    - Open the **Users and Groups** section.
    - Click **Add User/Group** and select the users or groups you want to grant access to.

4. **Save Changes**:
    - Confirm the assignments and save your changes.

By following these steps, you can ensure that only authorized users or groups have access to the Intune Assistant, improving security and compliance.

## Summary

While the Intune Assistant supports multi-user environments, relying on the **Consent for Organization** option is not recommended. Instead, explicitly assign users or groups to the service principal to maintain control over access and ensure secure usage of the application.