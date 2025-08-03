---
title: Authentication and Permissions
description: An overview about authentication and permissions in the Intune Assistant
---
In the documentation you will find all the information you need to know about the authentication and permissions part of the Intune Assistant.

## Permissions
First important thing to know is that the Intune Assistant needs only ***READ*** permissions to read data from your tenant. The permissions that are needed are:

- **DeviceManagementApps.Read.All** -> Read Microsoft Intune apps
- **DeviceManagementConfiguration.Read.All** -> Read Microsoft Intune Device Configuration and Policies
- **Directory.AccessAsUser.All** -> Access directory as the signed in user
- **Group.Read.All** -> Read all groups
- **Policy.Read.All** -> Read your organization's policies
- **User.Read** -> Sign in and read user profile
- **User.Read.All** -> Read all users' full profiles

The permissions are needed to read the data from your tenant. The Intune Assistant does not write any data to your tenant. The permissions are needed to read the data from your tenant and present it in the Intune Assistant application.
All the permissions are on behalf of the logged-in user.

The second important thing is that the Intune Assistant does not store any data from your tenant except the tenant ID and tenant domain. Why that data stored is explained in the [onboarding part](/docs/onboarding.md) of the documentation.
All the information is presented in your browser. The data is only stored is the session of the user that is logged in at client side. When the user logs out the data is removed from the session.


## Authentication
The Intune Assistant Web interface uses the IntuneAssistant API. From there the IntuneAssistant API uses the Microsoft Graph API to read the data from your tenant.   
The authentication is done with the Microsoft Graph API. The Intune Assistant uses the OAuth 2.0 authorization code flow to authenticate the user.   
The user is redirected to the Microsoft login page where the user can login with his credentials. After the user is authenticated the user is redirected back to the Intune Assistant application.
The user is now authenticated and can read the data from the tenant.