# Baseline coverage

## What it does

Microsoft publishes security baselines with a recommended value for each setting. Baseline coverage lays your tenant's configuration over the current version of every baseline and tells you, setting by setting, whether you configure it with the recommended value, with a different value, or not at all.

## How to use it

1. Harvest your tenant usage on **Settings Library → Browse Catalog**.
2. Open **Settings Library → Baseline Templates**. Each baseline shows a coverage bar: green matches, amber differs, and the missing count.
3. Open a baseline. **Your tenant against this baseline** lists every setting with what Microsoft recommends and what you configure (per policy), with filters for *Differs*, *Not configured*, *Matches*. Expand a setting to see its nested settings and every policy that sets it.

## Which baselines count

Not every Microsoft baseline is meant for you, and you do not need a baseline policy to follow one. Each baseline therefore gets a label:

- **Adopted** — a policy in your tenant is built from this baseline.
- **Via own policies** — you have no baseline policy, but your own Settings Catalog policies configure a meaningful share of it with Microsoft's values. That is a deliberate and common way of working, and those settings count as configured.
- **Not followed** — nothing is built from it and hardly anything matches. Baselines share settings, so a HoloLens baseline can show overlap just because you follow the Windows baseline. A baseline you do not follow raises no findings.

Coverage always looks at every harvested Settings Catalog policy, not only baseline policies. *Not configured* means the setting is in none of them. Harvest again after this update so your baseline policies are recognised as **Adopted**.

## What you'll see

- **Matches** — at least one policy sets the recommended value.
- **Differs** — configured, but with another value (or a nested setting differs or is missing).
- **Not configured** — no policy sets it.
- **Configured** — configured, but the baseline has no comparable recommendation for it (some collections).

Values are shown as you read them in the portal, with the raw id underneath so a difference can always be verified.

## Common questions

**A new baseline version came out — what changed for me?** The impact report's *Baselines not fully applied* finding is recomputed against the new version.

**Why "Differs" when my value looks the same?** The comparison uses the stored value (for example the option id), not the label. Expand the row: the raw values are shown under the labels.

**I configured this setting, why does it say "not configured"?** Coverage reads policies built on the Settings Catalog: Settings Catalog profiles, Endpoint security policies and catalog-based compliance policies. A setting you only configured in an older *Device configuration* template or an *Administrative templates (ADMX)* profile is not seen, so it shows as not configured here even though it reaches your devices.

**When does "Via own policies" apply?** When you have no policy built from the baseline, but at least one in ten of its settings is configured with Microsoft's recommended value somewhere in your own policies. Below that the baseline is treated as **Not followed**. If a baseline you do follow lands on the wrong side of that line, let us know; the line is a starting point, not a rule from Microsoft.

**I have no HoloLens or Cloud PC devices, why is that baseline still listed?** Every Microsoft baseline is listed, with its label. Findings are limited to baselines you follow and to platforms you have devices on, but the check is per platform (Windows, macOS, iOS), not per device type. A Windows-based baseline for a device type you do not own therefore drops out because you do not follow it, not because the device is missing.

**My baseline policy is not recognised as Adopted.** Harvest your tenant usage again. Harvests from before this label existed did not record which baseline a policy was built from.
