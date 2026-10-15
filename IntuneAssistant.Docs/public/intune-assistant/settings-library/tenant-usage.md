# Tenant usage

## What it does

The Settings Library describes every setting Intune offers. Tenant usage adds the answer to the question that follows almost immediately: *do I use this, where, and who gets it?* After a harvest, every setting in the library shows whether one of your Settings Catalog policies configures it, and the setting's detail page lists those policies with the value each one sets and the assignments each one has — All devices, All users, group names, exclusions and filters.

Combined with the library's other views this gives you things Intune itself cannot show: every deprecated setting you still have in a policy, or a setting that is configured in a policy that is not assigned to anything.

## How to use it

1. Open **Settings Library → Browse Catalog**.
2. Click **Harvest tenant usage** in the top-right corner. A progress bar shows the policies being read; a typical tenant takes well under a minute.
3. When it finishes, the header shows *Your tenant: N settings in use across M policies*, rows that your policies configure get an **In use** badge with the number of policies, and the **Only settings my tenant uses** filter becomes available.
4. Open any setting. The **Used in your tenant** card lists each policy that configures it — click the policy name to open it in the Intune admin center.

Run the harvest again whenever you want the picture refreshed; the header and every card show when it was last taken. Harvesting reads your tenant, it never changes anything in it.

## What you'll see

- **In use · 3 policies** on a row — three of your policies configure this setting.
- **Configured: Block** — the value the policy sets. A setting that appears several times in one policy (for example one rule per row in a list) shows each value.
- Assignment pills — **All devices**, **All users**, a group name, **Excluded: group** for exclusion groups, and the assignment filter with *include* or *exclude* where one is used.
- **Not assigned — this policy has no effect** — the policy contains the setting but is not assigned to any device or user.
- *Tenant usage not harvested yet* — nobody has run a harvest for this tenant; the filter and badges appear after the first one.

## Requirements

- Any active Intune Assistant account can harvest and see the current state. What you see lasts for your browser session — harvest again next time.
- The account running the harvest needs read access to Intune configuration and to groups — the same permissions the Tenant Overview uses, so no additional consent is normally needed.

## Common questions

**Which policies are included?** Everything built on the Settings Catalog: Settings Catalog profiles, Endpoint security policies and catalog-based compliance policies. Classic device configuration profiles and Administrative Templates do not carry catalog setting ids and are not included yet.

**Is the harvest live?** No — it is a snapshot from the moment you ran it, so the pages stay instant. Run it again after you change policies.

**Can two people harvest at once?** Only one harvest runs per tenant at a time; a second attempt tells you one is already running.

**Are secret values shown?** No. Settings that hold secrets show *(secret)* instead of the value.
