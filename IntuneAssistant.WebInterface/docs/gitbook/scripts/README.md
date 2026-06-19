# Scripts

## What Is This Section?

The **Scripts** section of Intune Assistant gives you visibility into the PowerShell scripts deployed to your Windows devices through Microsoft Intune. It focuses specifically on **Remediation Scripts** (also known as health scripts or proactive remediations) — the most powerful scripting feature in Intune because they can both detect and fix device state automatically.

Beyond simply listing the scripts that exist in your tenant, Intune Assistant goes further: when a detection script outputs structured JSON data, the platform automatically parses that output and presents it as a full, filterable, exportable report per script. This turns your remediation scripts into a lightweight, Intune-native device inventory and data collection system.

---

## What Is Available

| Page | What It Does |
|---|---|
| [Health Scripts Report](./health-scripts.md) | Browse all remediation scripts in your tenant and open a per-script device run-state report with dynamic JSON output columns |

---

## Why This Matters

Microsoft Intune's remediation scripts are commonly used for fixing configuration issues. But they can do much more than that. Because the detection script can return any data via `Write-Output`, IT administrators use them to collect:

- Installed browser extensions across all devices
- Registry key values
- Installed software inventory
- Hardware specifications
- Custom compliance data not available via built-in compliance policies

Until now, accessing that data meant building your own pipeline: Log Analytics, Azure Monitor, custom scripts to extract the data from Graph. Intune Assistant removes that friction — the JSON output is surfaced directly in the interface, no extra infrastructure required.

For more information on how to use remediation scripts for data collection, see [this learning page](https://learn.microsoft.com/en-us/intune/device-management/tools/deploy-remediations).
For more information on how to create remediation scripts, see [this learning page](https://learn.microsoft.com/en-us/intune/device-management/tools/ref-remediation-scripts#powershell-scripts-for-remediations).

Also there are a lot of great resources where remediation scripts are shared by the community. Here are a few:

- [Jannik Reinhard](https://github.com/JayRHa/EndpointAnalyticsRemediationScripts)
- [Sander Rozemuller](https://github.com/srozemuller/IntuneAutomation/tree/main/RemediationScripts)
---

## Related Sections

- [Configuration](../configuration/README.md) — configuration policies and settings overview, including OMA-URI settings that might be candidates for script-based collection
- [Audit Events](../audit-events/README.md) — see when scripts were created, modified, or assigned
- [Devices](../devices/README.md) — device inventory and compliance status

