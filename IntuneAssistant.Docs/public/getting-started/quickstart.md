---
description: This page has a brief description about how to get started.
icon: rocket-launch
layout:
  width: default
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
  metadata:
    visible: true
  tags:
    visible: true
  actions:
    visible: true
---

# Quickstart

Welcome to **IntuneAssistant**! Thank you for choosing this tool to enhance your Microsoft Intune management experience. This guide will walk you through the onboarding process to get your tenant connected and ready to use all features.

{% hint style="info" %}
Onboarding connects your Microsoft tenant to IntuneAssistant by consenting our applications to access your Intune environment. This secure process enables the tool to retrieve and display your tenant data while maintaining strict privacy standards.
{% endhint %}

### Why onboarding is needed

Intune Assistant relies on its own API backend. Meaning that only authenticated users with the correct application can use that API backend. Also, the API backend itself relies on permissions.<br>

Two Key Applications

During onboarding, two applications will be registered in your tenant:

1. **IntuneAssistant Application (**&#x33;448bc04-cdbe-4a07-8e24-7e0e6f6980c&#x31;**)** - The main web interface you'll use
2. **IntuneAssistant API Application (**&#x61;fe66ddf-67d4-4d61-8a51-beca7b799f5&#x32;**)** - Handles secure data retrieval from your tenant

{% hint style="warning" %}
Privacy Commitment

**No tenant or user data is stored in the backend database.** Only your tenant ID and domain are registered for licensing and security purposes. All Intune data shown in the application exists only in your browser session and is gone when you log out.
{% endhint %}

## Onboarding Process

Getting started with IntuneAssistant takes three steps, all on the onboarding page. The page shows which step you are on and will not let you continue until the previous one is done.

{% hint style="warning" %}
**You must sign in first.** The onboarding page asks you to sign in before you can create your account. If you open the page and are not signed in yet, you see a **Sign in with Microsoft** button instead of the account form — that is step 1, not an error.
{% endhint %}

{% stepper %}
{% step %}
### Open the onboarding page

Go to [community.intuneassistant.cloud/onboarding/register](https://community.intuneassistant.cloud/onboarding/register/), or click **Start here** on the home page.
{% endstep %}

{% step %}
### Step 1 — Sign in

Click **Sign in with Microsoft** and sign in with the work account of the tenant you want to onboard.

The first time, Microsoft asks you to accept the **IntuneAssistant** application (`3448bc04-cdbe-4a07-8e24-7e0e6f6980c1`). This is the sign-in app that the backend API trusts; it does not grant any permissions on your Intune data yet. After signing in you return to the onboarding page automatically.
{% endstep %}

{% step %}
### Step 2 — Create your account

Enter your company or display name (it is pre-filled with your sign-in domain) and click **Continue**. This registers your organisation in the IntuneAssistant backend. Only your tenant ID and domain are stored.
{% endstep %}

{% step %}
### Step 3 — Connect your tenant

Click **Grant admin consent**. A Microsoft consent window opens where you sign in as a **Global Administrator** and accept the **IntuneAssistant API** application (`afe66ddf-67d4-4d61-8a51-beca7b799f52`). These are the permissions the tool uses to read your Intune data on your behalf.
{% endstep %}

{% step %}
### Ready to use IntuneAssistant

After successful consent you are redirected to the dashboard with your tenant connected. The next time you open IntuneAssistant, just sign in — the onboarding steps are only needed once per tenant.
{% endstep %}
{% endstepper %}

{% hint style="info" %}
Security & Privacy

**No tenant data is stored in the backend database.** Only your tenant ID and domain are registered for licensing and security purposes. All Intune data shown in the application exists only in your browser session and is removed when you log out.\
For more details, please refer to the [Security page](https://intuneassistant.cloud/security/).
{% endhint %}

### New Applications in Your Tenant

Check your Azure AD App Registrations - you should see two new applications:

* **IntuneAssistant** - Main application for user authentication
* **IntuneAssistant API** - Backend service for data retrieval

## Next Steps

Now that your tenant is onboarded, explore these key areas:

* **Assignment Management** — Start managing your Intune assignments efficiently
* **Device Overview** — Monitor and manage your enrolled devices

## Troubleshooting

Having issues with onboarding? Check our troubleshooting guide:

* **The page asks me to sign in, but I wanted to create my account**: signing in is step 1 of onboarding. Click **Sign in with Microsoft**; you come back to the same page to continue with step 2.
* **Unauthorized (401) when creating the account**: your sign-in session has expired. Reload the page and sign in again.
* **Consent errors**: Ensure you have Global Administrator permissions
* **Application not visible**: Check Azure AD App Registrations after 5-10 minutes
* **Access denied**: Verify your account has appropriate Intune permissions

***

**Need help?** Visit the project's GitHub page and create an issue for community support.

<a href="https://github.com/srozemuller/IntuneAssistant" class="button primary">Visit GitHub Repository</a>
