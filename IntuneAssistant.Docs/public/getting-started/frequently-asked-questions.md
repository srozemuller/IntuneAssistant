---
icon: circle-question
---

# Frequently Asked Questions

Common questions and answers about Intune Assistant

Find answers to the most commonly asked questions about Intune Assistant.

<details>

<summary>What is Intune Assistant?</summary>

Intune Assistant is a tool that helps Intune Administrators get insights into their Intune environment.

</details>

<details>

<summary>Is Intune Assistant free?</summary>

Yes, Intune Assistant is free to use and build for the community. All features will stay free to use and are not limited.

</details>

<details>

<summary>Who built Intune Assistant?</summary>

Intune Assistant is built by [Sander Rozemuller](https://www.rozemuller.com/). He is a Microsoft MVP in the category Security (Intune) and Microsoft Graph API.

You can find more information about him on his [LinkedIn](https://www.linkedin.com/in/srozemuller/) or check his [MVP profile](https://mvp.microsoft.com/en-us/PublicProfile/5004451?fullName=Sander%20Rozemuller).

</details>

<details>

<summary>Is using Intune Assistant safe?</summary>

Yes, using Intune Assistant is a safe process. It works under user context and connects to a tenant on behalf of the user.

</details>

<details>

<summary>What about the data?</summary>

Intune Assistant does **NOT** store any tenant sensitive data. It only reads the data from the tenant and displays it in the UI. If you log out and close the browser, the data is gone.

</details>

<details>

<summary>How does it work?</summary>

Intune Assistant uses an app registration consented during the onboarding process. The app registration has only the needed READ permissions.

When a user logs in, the app registration is used under user context to get the data from the tenant.

</details>

<details>

<summary>Do I need to sign in before I can onboard my tenant?</summary>

Yes. The onboarding page has three steps: **sign in**, **create your account**, and **connect your tenant**. The first step signs you in with your Microsoft work account and asks you to accept the Intune Assistant sign-in application. Only after that can the account be created, because every call to the Intune Assistant API is made on behalf of the signed-in user. If you open the onboarding page and see a **Sign in with Microsoft** button instead of the account form, that is step 1 — sign in and you return to the same page to continue. See the [Quickstart](quickstart.md) for the full walkthrough.

</details>

<details>

<summary>I read something about the Intune Assistant API?</summary>

That is great to hear! The Intune Assistant API is a sort of aggregation layer. The API harvests many Graph API endpoints and combines data to something that is useful.

In fact, the Intune Assistant API is just a data shipper that streamlines Graph data to the web interface as well as the Intune CLI.

</details>

<details>

<summary>What permissions does Intune Assistant need?</summary>

Intune Assistant relies on Graph API permissions in combination with the user's permissions. But always with Zero Trust in mind (least privilege). The permissions are basically READ permissions. For a full detailed overview, check [the permissions overview](/broken/pages/a139ed7c655e2e59c794b1b67adf067eadaf6e06).

</details>

<details>

<summary>Can I see more about the source code?</summary>

Yes, the web interface as well as the CLI source code is available on GitHub. You can find the repo [here](https://github.com/srozemuller/IntuneAssistant).

</details>

<details>

<summary>I want to request a feature</summary>

That is great! In the repo there is a template available for requesting features. You can find it [here](https://github.com/srozemuller/IntuneAssistant/issues/new/choose).

Use it also for bugs or other issues.

</details>

<details>

<summary>Why is Intune Assistant a web interface only?</summary>

Intune Assistant is a web interface because it helps users get up to speed quickly. Also, not everyone has a subscription to store resources.

</details>

<details>

<summary>Will Intune Assistant become available as a single instance to run on my own platform?</summary>

Yes, Intune Assistant will become available as a single instance to run on your own platform. It is on the roadmap but not yet available.

</details>

### General

<details>

<summary>Where can I find the source code?</summary>

The frontend project is completely open source and available on [GitHub](https://github.com/srozemuller/IntuneAssistant).

</details>

<details>

<summary>How does Intune Assistant work?</summary>

It uses an Azure app registration (consented during onboarding) to call Microsoft Graph APIs on your behalf, aggregates and analyzes data client-side, then presents insights through an intuitive web interface.

</details>

<details>

<summary>What browsers are supported?</summary>

Intune Assistant works best in modern browsers including Chrome, Firefox, Safari, and Edge. Internet Explorer is not supported.

</details>

### Support

<details>

<summary>How do I request a feature or report a bug?</summary>

Open an issue or feature request on our [GitHub repository](https://github.com/srozemuller/IntuneAssistant/issues) using the provided issue templates. We actively monitor and respond to community feedback.

</details>

