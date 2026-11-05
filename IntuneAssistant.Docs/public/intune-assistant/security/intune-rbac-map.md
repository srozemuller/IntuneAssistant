---
description: See who can do what, where in Intune RBAC, and what merging permissions grants today.
---

# Intune RBAC Map

## What it does

Intune answers "who can do what, and where" through three things: roles (built-in and custom), role assignments (who gets
the role, and which groups they may manage) and scope tags (which objects they see). The Intune portal shows each of these
in its own blade. The RBAC map puts them together per admin.

For every admin an Intune role assignment reaches, you see the assignments that reach them, the role, the scope groups and
the scope tags, and a matrix of every permission against every scope tag. Each cell says whether one assignment grants it
by itself, or whether the admin has it only because Intune merges their role assignments today. The map also shows, per
scope tag, who can change, delete or wipe, and it flags assignments worth a second look.

The map only reads. Changing roles and assignments stays in the Intune portal.

## How to use it

1. Go to **Check > RBAC map**. The map of your tenant loads when the page opens.
2. In **By admin**, select an admin to open their permission matrix and the list of what they would lose under scoped permissions.
3. In **By scope tag**, see per scope tag who can write, delete or wipe/retire.
4. In **Hygiene**, see the flags.
5. Use **Export** on any tab for CSV, PDF, HTML or Markdown, for example as the RBAC chapter of an access review.
6. **Refresh** reads your tenant again.

## What you'll see

* **Summary:** the number of roles, custom roles, assignments, admins and hygiene flags.
* **Admins:** name, UPN, number of assignments, how they are reached (**Direct**: a direct member of an assignment's
  group; **Nested**: only through a group inside that group; **Mixed**: both), roles, scope tags and flags.
* **Admin detail:**
  * the assignments that reach the admin, with the route (for example `Helpdesk › Helpdesk NL`), the scope groups with
    their member count, and the scope tags;
  * the matrix: rows are permissions (category and permission, with the names the Intune portal uses where Intune
    provides them), columns are scope tags. **Granted** means one assignment gives the permission on that tag by itself.
    **Merged only** means the permission comes from one assignment and the tag from another;
  * **Would lose under scoped permissions:** every Merged only cell.
* **By scope tag:** per tag and admin, whether they can write, delete or wipe/retire, and whether only through merging.
  Read-only access is left out.
* **Hygiene flags:**
  * a custom role or an assignment that carries only the Default scope tag;
  * an assignment scoped to all users and/or all devices instead of scope groups;
  * a custom role that can wipe, retire or delete;
  * an assignment that reaches nobody (no groups, or empty groups);
  * an admin whose access comes only through nested groups;
  * a group whose members could not be read (its reach is unknown, not empty);
  * an assignment Intune did not link to a role.

## Requirements

It needs permission to read Intune roles and group members, which Intune Assistant already asks for. The signed-in admin
also needs an Intune role that can read roles in the tenant.

## Common questions

**What is "merging", and what are scoped permissions?**\
Today, when two role assignments reach the same admin, Intune combines them: the admin can use every permission of
either role on every scope tag of either assignment. Microsoft is moving to scoped permissions, where each permission only
applies to the scope tags of the assignment that grants it. Microsoft has said this becomes the default for all tenants;
switching it on cannot be undone. The **Would lose** list shows what an admin has today only because of merging.

**Is the merge rule exact?**\
The map follows Intune Assistant's reading of Microsoft's documentation: every permission of every assignment that reaches
the admin applies to all the scope tags of those assignments. Check it on a test tenant (an admin with two assignments,
different roles, different scope tags) before you act on a Merged only cell.

**Why is the Global Administrator not in the map?**\
Entra roles such as Global Administrator and Intune Administrator bypass Intune RBAC. The
[Intune Administrator Analyzer](intune-administrator-analyzer.md) (**Check > Admin roles**) covers them.

**Are scope groups expanded?**\
No. Scope groups are named and counted. The map does not list every user or device in them.

**Why does an assignment say "membership partly unknown"?**\
A group on the way could not be read, for example a group with hidden membership. Intune Assistant never treats that as
"nobody": it shows it as unknown and flags the group.

**Why does the page say Microsoft Graph did not allow reading Intune roles?**\
The signed-in admin has no Intune role that can read roles in this tenant. Give them an Intune role with read access to
roles (for example Read Only Operator), or sign in as another admin, and select **Refresh**.

**Does the map store anything?**\
No. Every visit reads the tenant live; nothing is saved.
