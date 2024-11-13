---
title: Onboarding
description: A quick guide to get started with the Intune Assistant
---

Welcome to **Intune Assistant**. First of all thank you for using this tool.  
This tool is build to help you with getting insights in your Microsoft Intune environment. All to help the community further using Microsoft Intune in an efficient way.

To use IntuneAssistant you need to onboard the tool in your tenant. This is by consenting the IntuneAssistant application to your tenant.

## Why onboarding
The onboarding part is needed to consent the needed applications in your tenant. The IntuneAssistant application and the IntuneAssistant API application. The IntuneAssistant application is the application where you can use the tool. The IntuneAssistant API application is the application that is used to get the data from your tenant.
After onboarding the tenant ID and domain is stored in backend database.  

This is needed to allow tenants to use the IntuneAssistant API. In the case of abuse the tenant ID and domain can be used to block the tenant from using the IntuneAssistant API.  
Also, there are parts in IntuneAssistant that are paid. The onboarding part is needed to store the tenant ID and domain to allow the tenant to use the paid parts of the application.

**No other data is stored in the backend database. The data that is shown in the application is only stored in the browser session of the user that is logged in. When the user logs out the data is removed from the session.**

## Onboarding
The onboarding process is quite simple, just go to the [onboarding page](/onboarding) and follow the steps.
On the onboarding page you will be asked to provide your tenant domain and tenant ID. From there click at the `Deploy` button and you will be redirected to the Microsoft login page to consent the application.

![onboarding-card.png](/images/getting-started/onboarding-card.png)

From there a consent page is opened where you can consent the application to your tenant. After consenting the application you will be redirected to the IntuneAssistant application.
<img src="/images/getting-started/consent-message.png" width="300">

## After onboarding
When onboarding is done you can start using the IntuneAssistant application. 
In you tenant you will notice two new applications. The IntuneAssistant application and the IntuneAssistant API application.
The IntuneAssistant application is the application where you can use the tool. The IntuneAssistant API application is the application that is used to get the data from your tenant.

<img src="/images/getting-started/applications.png">

For more information about the authentication and permissions part of the application, please visit the [authentication](/docs/general/authentication) page.