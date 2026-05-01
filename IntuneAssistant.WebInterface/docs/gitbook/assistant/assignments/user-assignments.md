# User Assignments

## What Is This Page?

The **User Assignments** section answers the question every helpdesk engineer, architect, and auditor eventually asks: _"What does this specific user actually receive from Intune?"_

Because Intune distributes policies and apps through groups, and users can be members of many groups, working out what applies to a single person is not straightforward in the native Intune portal. You would need to manually check every group a user belongs to, then cross-reference each group against every policy and app. That takes time and is error-prone.

Intune Assistant does this automatically. You search for a user, and the tool resolves all group memberships (nesting included) and returns the full list of what applies to that person.

---

## What You Can Look Up

The User Assignments section is split into two focused sub-pages:

### Configuration Assignments

Covers all **policies and configuration profiles** assigned to the user — compliance policies, device configuration profiles, security baselines, scripts, and similar resources.

[Go to User Configuration Assignments](./user-assignments-configuration.md)

### Application Assignments

Covers all **applications** assigned to the user — both Required apps (automatically installed) and Available apps (visible in Company Portal).

[Go to User App Assignments](./user-assignments-apps.md)

---

## Why Is This Split Into Two Pages?

The volume of data can be large. A user in a managed organization may have dozens of configuration policies and a completely separate set of app assignments. Keeping the views separate makes each page easier to navigate and read.

---

## How Assignment Resolution Works

When you search for a user, Intune Assistant:

1. Looks up the user in Entra ID
2. Retrieves all groups the user is a member of — including nested group memberships
3. Queries all Intune assignments
4. Matches assignments targeting any of those groups, plus All Users assignments
5. Returns the complete, merged result

This means you see the **effective** assignment picture — not just direct assignments, but everything that reaches the user through any path.

> 📸 _[Screenshot placeholder: User Assignments landing page showing two cards — Configuration Assignments and Application Assignments]_

---

## Common Use Cases

**Why is this user getting a compliance policy they should not have?**
Check their configuration assignments to see which group-based assignment is delivering it.

**Does this user have the required apps deployed?**
Check their app assignments and confirm Required apps are listed.

**Pre-offboarding review**
Check all assignments before disabling or deleting an account — document what the user had access to.

**New joiner validation**
After adding a user to the correct groups, verify the expected policies and apps now appear.

---

## Related Pages

- [User Configuration Assignments](./user-assignments-configuration.md)
- [User App Assignments](./user-assignments-apps.md)
- [Group Assignments](./group-assignments.md)
- [All Assignments](./all-assignments.md)

