# Error Finder

## What it does

The Error Finder reads your tenant for failed health scripts and app installs, and shows what each error means and how to fix it.

## How to use it

1. Go to **Check > Error finder**. The page reads your tenant when it opens. Health scripts and app installs load separately, and app installs can take a few minutes. The result is kept for 15 minutes; **Refresh** reads your tenant again.
2. The table shows each error per app or script, with what it means and the number of devices that report it. Filter by source, or search for a resource, code or device.
3. Select a row to unfold the meaning, cause and fix, the affected devices, and links to the sources, such as [Error Hunter](https://errorhunter.msnugget.com/) and Microsoft Learn.

## What you'll see

- **What it means** comes from the Intune Assistant catalogue or from Error Hunter. "No entry found yet" means neither knew the code when the page loaded; select the row to try again.
- **No code** means a script failed with its own error text, which is shown instead.
- Lines above the table say how much was scanned, how long it took and what could not be read.

## Requirements

It needs permission to read apps, device configuration and scripts in Intune, which Intune Assistant already asks for.

## Common questions

**Which sources are used?** The Intune Assistant catalogue, whose texts come from Error Hunter, and a live lookup at Error Hunter. Each error names Error Hunter and links to its page for that code. The details of an error say so when its text has not yet been reviewed by Intune Assistant.

**What is sent to Error Hunter?** Only error codes. No device names, script output or anything else from your tenant.

**What if nobody knows the code?** You get "no entry" and a link to search Microsoft Learn. Intune Assistant does not guess a fix.

**Which apps are checked?** Every app with an assignment; an app without one cannot have install errors. The page says so when an app could not be read.
