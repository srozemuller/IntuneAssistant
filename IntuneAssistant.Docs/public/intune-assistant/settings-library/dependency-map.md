# Dependencies of a setting

## What it does

Every setting with dependencies is shown as a small map: the setting in the centre, what it **needs first** on the left, what it **unlocks** on the right. You see at a glance what to configure before it, what becomes available after it, and you can walk from setting to setting by clicking.

## Where you find it

- In **Settings Library → Explore by Task**: click any setting in the results and the results make way for its map. **Back to results** returns you to your search.
- On a **setting's own page**, in the *How this fits* card, whenever the setting has dependencies.

## What you'll see

- **Needs first** (left) — settings that must be configured before this one has any effect. A thicker line means Microsoft marks it as required.
- **Unlocks** (right) — settings that only apply once this one is set, and the members of a group setting.
- **Stronger together** (above) — the Microsoft security baselines and endpoint-security templates that ship this setting, with the value a baseline recommends. Click one to see everything in that template.
- **Nearby** (below) — settings in the same area and settings the library links to this one.
- **On the card** — how many of your policies configure it (after a [tenant usage](tenant-usage.md) harvest), and warnings: deprecated with a *Use instead* button, minimum Windows build, user scope, Entra join, edition limits.
- **Legend** (under the map) — the line colour is the kind of dependency: *depends on*, *one option depends on*, *group member*, *lives inside* or *reusable setting*. Only the kinds on screen are listed. A thicker line is a required prerequisite, and ✓ *n* means the setting is in *n* of your policies. Hover a card for the exact reason.

## Tips

- Click anything around the setting to walk there. In the explorer the **walked** trail keeps your last steps.
- A side with more than seven settings scrolls inside its own column. The lines follow the settings you can see, and a small note says how many are above and below.
- Every map has its own link, so you can share exactly what you are looking at.
