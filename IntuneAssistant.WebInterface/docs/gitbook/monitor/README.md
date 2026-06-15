# Monitor

## What Is the Monitor Section?

The **Monitor** section of Intune Assistant gives you continuous visibility into the actual state of your Intune environment compared to a defined desired state. Rather than reactively discovering that something changed, the Monitor proactively detects deviations — called **drifts** — and surfaces them in one place so you can review and act on them.

Monitoring is built around the concept of a **baseline**: a snapshot of the configuration you have decided is correct and desired. The Monitor engine periodically checks your live environment against that baseline and reports any property that no longer matches.

---

## Monitor Section Pages

| Page | What It Does |
|---|---|
| [Configuration Drifts](./configuration-drifts.md) | View, filter, and act on all active and resolved configuration drifts across all monitors |

---

## Key Concepts

### Baseline

A **baseline** is the authoritative, desired configuration state for a resource. It is stored in Intune Assistant and compared against the live state of the resource during each monitor run. If a property in the live resource differs from the baseline value, a drift is recorded.

### Drift

A **drift** is a recorded deviation between the live state of a resource and its baseline. Each drift captures:
- Which resource changed
- Which specific properties changed
- The desired value (what the baseline says it should be)
- The current value (what the live resource actually is)
- When the deviation was first detected

### Accepting a Drift

Accepting a drift means you are acknowledging that the current state is intentional and correct — effectively promoting the current state to become the new baseline. This is different from resolving a drift by reverting the change; accepting a drift is a deliberate decision to update what "correct" means going forward.

Every acceptance is written to the audit log with a mandatory justification so there is always a record of why the change was approved.

---

_Next: [Configuration Drifts](./configuration-drifts.md)_

