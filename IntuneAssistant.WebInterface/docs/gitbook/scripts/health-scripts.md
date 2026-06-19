# Health Scripts Report

> **Path in the app:** Scripts → Health Scripts

## What Is This Page?

The **Health Scripts** page lists every Intune Remediation Script in your tenant. Clicking any script opens its **Device Run-State Report** — a per-device breakdown of the latest detection result, including the structured JSON output that the detection script wrote to standard output.

This report is designed around one key idea: **the parsed output is the most important information**. The UI puts the JSON data columns first, so you see your actual device data immediately rather than having to scroll past status columns to find it.

---

## Background: What Are Remediation Scripts?

Remediation scripts are deployed to Windows managed devices through Microsoft Intune as paired PowerShell scripts:

| Script | Purpose | Exit Codes |
|---|---|---|
| **Detection script** | Checks a condition on the device | `exit 0` = compliant, `exit 1` = non-compliant |
| **Remediation script** | Runs automatically when detection exits `1` | Any |

Common use cases include:

- Enforcing a registry key value
- Removing stale or unwanted software
- Fixing misconfigured local settings
- Collecting hardware or software inventory data back to Intune

Intune runs the detection script on a schedule you configure (every hour, every day, or once). The detection result — including any output the script wrote — is stored by Intune per device and accessible via Microsoft Graph.

---

## JSON Output: Turning Scripts Into Inventory Tools

The detection script can write any data to standard output using PowerShell's `Write-Output`. When that output is **valid JSON**, Intune stores it as structured pre-remediation detection output. Intune Assistant automatically parses this and displays each JSON key as its own column in the report.

This pattern is powerful for lightweight inventory collection without external logging infrastructure:

```powershell
# Collect all installed browser extensions and return as JSON
$extensions = @()
Get-ChildItem 'HKCU:\Software\Google\Chrome\Extensions' | ForEach-Object {
    $extensions += [PSCustomObject]@{
        extensionId = $_.PSChildName
        name        = (Get-ItemProperty $_.PSPath).name
        version     = (Get-ItemProperty $_.PSPath).version
    }
}
Write-Output ($extensions | ConvertTo-Json -Compress)
exit 0
```

Each item in the array becomes a row in the **Script Output** tab. The keys `extensionId`, `name`, and `version` become table columns automatically — no configuration required.

### Requirements for JSON output to appear

| Requirement | Detail |
|---|---|
| Valid JSON only | Must be a JSON object `{}` or array `[...]`. Mixed text or invalid JSON produces no columns |
| `Write-Output` | Must use `Write-Output`, not `Write-Host` (host stream is not captured by Intune) |
| Script must have run | The device must have executed the script at least once |
| Assignment required | The script must be assigned to a group that includes the device |

---

## The Report: Two Views

When you click a script on the Health Scripts page, you arrive at the Device Run-State Report. The report has two tabs:

### Script Output tab _(default)_

This is the primary view. It shows **one row per output item** — if a device's detection script returned an array of 12 browser extensions, that device contributes 12 rows to this tab.

| Column | Description |
|---|---|
| **State** | Detection state badge (success / failed) |
| **[JSON output columns]** | One column per key found in any device's JSON output — auto-generated |
| **Device** | Device name, user principal name, and OS version in a compact stacked cell |
| **Last Updated** | When the detection last ran on this device |

Rows from the same device share an alternating left-border colour stripe so you can visually group them without repeating the device name on every row. If a row has a script error, clicking it expands an inline error panel below the row.

### Device Overview tab

This tab shows **one row per device** — useful when you want a status overview rather than the full data.

| Column | Description |
|---|---|
| **Device** | Device name, user, OS version |
| **Detection State** | Success / failed badge |
| **Remediation** | Remediation state |
| **Output Items** | How many JSON output items were returned |
| **Error** | Whether the script produced an error |
| **Last Updated** | Timestamp of the last run |

Expanding a row shows the full parsed output as an inline mini-table, plus any script error message.

---

## Filtering

Every badge in the filter strip at the top of the report is clickable and toggles a filter on or off:

| Badge | Filter Applied |
|---|---|
| **N devices** | Clears all active filters |
| **N success** | Shows only devices where detection succeeded |
| **N failed** | Shows only devices where detection failed |
| **N with output** | Shows only devices that returned JSON output |
| **N no output** | Shows only devices with no JSON output |
| **N with errors** | Informational only — not filterable |

Multiple filters can be active simultaneously. A **Clear filters** link appears when any filter is active.

---

## Export

The **Export** button in the top-right of the report header offers two export datasets:

| Export option | Contents | Formats |
|---|---|---|
| **Export Script Output** | One row per output item, dynamic output columns included | CSV, PDF, HTML |
| **Export Device Overview** | One row per device, output item count and error flag | CSV, PDF, HTML |

Exports respect the active filters — only the currently visible data is exported.

---

## Example: Tenant-wide Browser Extension Inventory

A common real-world use of this feature is collecting all installed browser extensions across managed devices.

**Detection script:**

```powershell
$results = @()

# Chrome extensions
if (Test-Path 'HKCU:\Software\Google\Chrome\Extensions') {
    Get-ChildItem 'HKCU:\Software\Google\Chrome\Extensions' | ForEach-Object {
        $results += [PSCustomObject]@{
            browser     = 'Chrome'
            extensionId = $_.PSChildName
            name        = (Get-ItemProperty $_.PSPath).name
            version     = (Get-ItemProperty $_.PSPath).version
        }
    }
}

# Edge extensions
if (Test-Path 'HKCU:\Software\Microsoft\Edge\Extensions') {
    Get-ChildItem 'HKCU:\Software\Microsoft\Edge\Extensions' | ForEach-Object {
        $results += [PSCustomObject]@{
            browser     = 'Edge'
            extensionId = $_.PSChildName
            name        = (Get-ItemProperty $_.PSPath).name
            version     = (Get-ItemProperty $_.PSPath).version
        }
    }
}

Write-Output ($results | ConvertTo-Json -Compress)
exit 0
```

**What you see in Intune Assistant:**

The Script Output tab shows columns: `browser`, `extensionId`, `name`, `version` — one row per extension per device. You can search for a specific extension name or ID across all devices instantly, filter to only devices that returned output, and export the full list to CSV for a complete tenant-wide extension audit.

---

## Limitations and Notes

- **Windows only.** Remediation Scripts are a Windows feature. iOS, macOS, and Android devices do not appear in this report.
- **Detection output only.** The report shows pre-remediation detection output. Remediation script output is not captured by Intune.
- **Single run state per device.** Only the most recent run state is shown. Historical runs are not available via this report.
- **Output size.** Intune limits detection script output size. Very large JSON arrays may be truncated. Keep individual output objects small.
- **Structured output only.** Only valid JSON arrays or objects are parsed into columns. Free-text `Write-Output` is not shown as columns but does not cause an error — the row simply shows no output columns.

---

## Related Pages

- [Scripts Overview](./README.md) — section overview and background
- [Policy Settings Overview](../configuration/settings.md) — for OMA-URI device configuration settings
- [Audit Events](../audit-events/README.md) — see when scripts were created or modified

