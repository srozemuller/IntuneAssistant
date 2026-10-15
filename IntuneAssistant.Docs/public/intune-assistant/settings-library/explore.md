# Explore by task

## What it does

Explore by task is the front door of the Settings Library. Instead of scrolling a catalog of thousands of settings, you say what you want to do — *Edge favorites*, *BitLocker*, *certificates on iOS*, *hardened UNC paths* — and the page shows the settings involved, grouped by the area they live in, with what each one needs first, what it unlocks, and which of Microsoft's own templates already bundle it.

## How to use it

1. Open **Settings Library → Explore by Task**, or pick one of the example tasks.
2. Type the task in your own words and press **Explore**. Narrow to a platform with the chips next to the box.
3. The left column lists the **areas** the matches fall into (for example *Microsoft Edge › Favorites*). Click an area to focus on it; click **All areas** to see everything again.
4. Click a setting to open its **map**: what to configure first on the left, what it unlocks on the right, the templates that ship it above and its neighbours below (see [Dependencies of a setting](dependency-map.md)). Click anything around it to walk there; **Back to results** returns to your search.
5. **Microsoft already bundles this** shows the security baselines and endpoint-security templates (Antivirus, Firewall, Attack surface reduction, …) that group the matching settings. Click one to see every setting it ships, grouped by area.

## What you'll see

- **Needs first / unlocks** — counts on each setting, read from Microsoft's own dependency metadata. A setting that unlocks others lists first: configure it before the settings it gates.
- **Template badges** — the baseline or endpoint-security template that ships the setting, with the value the baseline recommends.
- **In your tenant** — after a [tenant usage](tenant-usage.md) harvest, a green count on each setting says in how many of your policies it already sits, and each area counts how many of its matches you use.
- **Watch out** — deprecated settings and their replacement, the minimum Windows build, user-scoped settings, Microsoft Entra join requirements, edition limits and Microsoft's risk level.
- **Pointers outside the catalog** — some tasks are not settings at all. Ask for certificates and the page tells you they are certificate profiles (SCEP, PKCS, trusted root) with a link to Microsoft Learn, next to the trust-store settings the catalog does have. The same for Wi-Fi, VPN, email, drive mapping, app deployment, app protection, compliance, update rings and enrollment.

## Tips

- Short words are matched whole: *unc* finds Hardened UNC Paths, not every setting that mentions "unchecked". Longer words match at the start of a word, so *favorite* finds *favorites* too.
- Deprecated settings still appear, ranked below their live alternatives, so you can see what you would be replacing.
- Dependencies never leave their own area in Microsoft's metadata, so the **Nearby** row on a setting's map is where related settings show up.
