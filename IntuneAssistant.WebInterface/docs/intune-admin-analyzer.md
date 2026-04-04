# Intune Admin Analyzer

## Overview

The **Intune Admin Analyzer** is a powerful security analysis tool that helps you identify over-privileged administrator accounts in your Microsoft Intune environment. By analyzing actual user activity patterns against assigned administrative roles, you can ensure that users have appropriate access levels based on their real usage.

> 📸 **Screenshot Placeholder**: _Main RBAC Management page showing the Intune Admin Analyzer card_

---

## Why Use the Intune Admin Analyzer?

Following the principle of **least privilege**, it's crucial to ensure that administrators only have the permissions they actually need. The Intune Admin Analyzer helps you:

✅ **Identify inactive administrators** - Users with admin roles but no activity  
✅ **Detect over-privileged accounts** - Users with admin rights who only perform read operations  
✅ **Understand role membership** - See direct, group, and nested group assignments  
✅ **Make informed decisions** - Get data-driven recommendations for role optimization

---

## Getting Started

### Accessing the Analyzer

1. Navigate to the **RBAC** section from the main sidebar
2. Click on the **Intune Admin Analyzer** card

> 📸 **Screenshot Placeholder**: _RBAC landing page with Intune Admin Analyzer card highlighted_

### Running an Analysis

The analyzer scans your Intune environment to identify all users with Intune Administrator privileges and analyzes their activity.

#### Step 1: Configure Analysis Period

1. In the **Analysis Configuration** section, set the number of days to analyze
   - **Default**: 60 days
   - **Minimum**: 1 day
   - **Maximum**: 90 days
2. The tool will look back through Intune audit logs for the specified period

> 📸 **Screenshot Placeholder**: _Analysis Configuration card with the "Days to Analyze" input field showing 60 days_

**💡 Tip**: For a comprehensive analysis, we recommend analyzing at least 30-60 days to capture typical usage patterns.

#### Step 2: Run the Analysis

Click the **Run Analysis** button to start the scan. The process includes:

1. 🔍 Identifying all Intune Administrator role members
2. 📊 Analyzing audit events for the specified period
3. 📈 Categorizing user activities (read, write, delete operations)
4. ⚠️ Flagging over-privileged users

> 📸 **Screenshot Placeholder**: _Analysis running with loading spinner and "Analyzing..." text_

---

## Understanding the Results

### Summary Dashboard

After the analysis completes, you'll see four key metrics at the top of the page:

> 📸 **Screenshot Placeholder**: _Four summary cards showing Role Analyzed, Total Users, Over-Privileged Users, and Analysis Period_

#### 1. Role Analyzed
- **Displays**: The name of the role being analyzed (typically "Intune Administrator")
- **Shows**: Truncated Role ID for reference

#### 2. Total Users
- **Displays**: Total number of users with the Intune Administrator role
- **Includes**: Direct members, group members, and nested group members

#### 3. Over-Privileged Users
- **Displays**: Number of users flagged for review
- **Color-coded**:
  - 🟡 Yellow number = Users requiring attention
  - 🟢 Green "0" = All users are actively using their permissions

#### 4. Analysis Period
- **Displays**: Number of days analyzed
- **Shows**: Date range (e.g., "Mar 1 - Mar 27, 2026")

---

### User Analysis Table

The main results table provides detailed information about each administrator:

> 📸 **Screenshot Placeholder**: _Full User Analysis Results table with sample data_

#### Column Breakdown

| Column | Description |
|--------|-------------|
| **Status** | 🟢 Green checkmark = Appropriate privileges<br>🟡 Yellow warning = Over-privileged |
| **User** | Display name and User Principal Name (email) |
| **Membership** | How the user has admin access (see below) |
| **Activity Level** | Overall activity classification (None/Low/Medium/High) |
| **Total Actions** | Total number of Intune actions performed |
| **Read** | Number of read-only operations (🟢 Green) |
| **Write** | Number of write/modify operations (🟡 Yellow) |
| **Delete** | Number of delete operations (🔴 Red) |
| **Details** | Click to see detailed information |

#### Membership Types

The analyzer identifies three types of role membership:

**🔵 Direct**
- User is directly assigned to the Intune Administrator role
- Most transparent form of role assignment

**🟣 Group**
- User inherited admin rights through membership in a security group
- The source group name is displayed below the badge

**🟪 Nested**
- User inherited admin rights through nested group membership
- Member of a group that's member of another group assigned the role
- The ultimate source group is displayed

> 📸 **Screenshot Placeholder**: _Table rows showing examples of each membership type with badges_

#### Activity Level Classification

The analyzer automatically classifies users based on their activity:

- **🔴 High**: User has performed delete operations (highest risk actions)
- **🟡 Medium**: User has performed write/modification operations
- **🟢 Low**: User has only performed read operations
- **⚫ None**: User has performed no actions

---

### User Details Panel

Click on any user row (or the **Info** button) to see detailed information:

> 📸 **Screenshot Placeholder**: _User Details panel expanded showing all sections_

#### Sections in the Details Panel

**1. Basic Information**
- User Principal Name (UPN)
- User ID (GUID)

**2. Privilege Status**
The analyzer provides clear feedback:

- **🟢 Green box**: "User is appropriately privileged based on activity patterns"
- **🟡 Yellow box**: Specific reason why user is flagged, such as:
  - "No activity detected in the analysis period. Consider reviewing this role assignment."
  - "User has only performed read operations. Consider assigning a read-only role instead."

**3. Unique Actions Performed** _(if applicable)_
- Shows specific Intune actions the user has executed
- Displayed as badges for easy scanning
- Examples: "Create Policy", "Update Configuration", "Delete Device"

> 📸 **Screenshot Placeholder**: _Unique Actions section showing action badges_

**4. Unused Permissions** _(if applicable)_
- Lists permissions the user has but hasn't used
- Helps identify potential role optimization opportunities
- Displayed as secondary badges

> 📸 **Screenshot Placeholder**: _Unused Permissions section showing permission badges_

---

## Table Features

### Searching and Filtering

The User Analysis table includes powerful search functionality:

1. Use the **search box** at the top right to filter users
2. Search works across:
   - User display names
   - User Principal Names
   - Membership types

> 📸 **Screenshot Placeholder**: _Search box with example search query and filtered results_

### Sorting

Click any column header to sort the results:

- **First click**: Sort ascending
- **Second click**: Sort descending  
- **Third click**: Return to default order

Particularly useful columns to sort:
- **Status**: See all over-privileged users first
- **Total Actions**: Identify most/least active admins
- **Activity Level**: Group users by activity type

> 📸 **Screenshot Placeholder**: _Table with sorted column (showing sort indicator)_

### Pagination

For organizations with many administrators:

- Results are paginated for better performance
- Navigate using page controls at the bottom
- Shows current page and total pages

---

## Interpreting Results & Taking Action

### What is "Over-Privileged"?

A user is flagged as over-privileged when:

1. **No Activity**: They have an Intune Administrator role but haven't performed any Intune actions during the analysis period
2. **Read-Only Usage**: They only performed read operations, suggesting they don't need full administrative access

### Recommended Actions

Based on the analysis results, consider these actions:

#### For Users with No Activity
- ❓ Verify if the user still needs Intune Administrator access
- 🔄 Check if they've recently joined the team (extend analysis period)
- ❌ Consider removing the role assignment if no longer needed
- 📧 Contact the user to understand their requirements

#### For Users with Read-Only Activity
- 📖 Assign a read-only Intune role instead (e.g., "Intune Read Only Operator")
- ✅ Remove full Administrator access
- 🔒 Follow principle of least privilege

#### For Nested Group Members
- 🔍 Review group membership structure
- 📋 Document the access path for audit purposes
- ⚠️ Be cautious - changes may affect other members

### Best Practices

✅ **Run regular analyses** - Schedule quarterly reviews of admin roles  
✅ **Document decisions** - Keep records of why users need admin access  
✅ **Use longer periods** - 60-90 days provide better insight than shorter periods  
✅ **Cross-reference with HR** - Verify access aligns with job responsibilities  
✅ **Implement JIT access** - Consider Just-In-Time admin access for occasional needs

---

## Common Scenarios

### Scenario 1: New Administrator
**Situation**: User shows zero activity but was just added last week.

**Action**: This is expected. Run the analysis again in 30-60 days to see their activity pattern.

---

### Scenario 2: Seasonal Administrator
**Situation**: User has no activity for 60 days but performs annual cleanup tasks.

**Action**: Extend the analysis period to cover their active period, or implement Just-In-Time access for their annual tasks.

---

### Scenario 3: Read-Only Auditor
**Situation**: User only performs read operations for compliance auditing.

**Action**: Perfect candidate for role optimization. Assign "Intune Read Only Operator" or similar read-only role.

---

### Scenario 4: High Activity Administrator
**Situation**: User shows high activity with delete operations.

**Action**: This is appropriate for active admins. Ensure activity aligns with their job responsibilities. Consider enabling additional monitoring.

---

## Troubleshooting

### No Data Returned

**Problem**: Analysis completes but shows 0 users.

**Solutions**:
- Verify you have permissions to read Intune roles
- Check that users are assigned to the "Intune Administrator" role
- Ensure your tenant has active Intune licensing

### Analysis Takes Too Long

**Problem**: Analysis runs for more than 2-3 minutes.

**Solutions**:
- Reduce the analysis period (try 30 days instead of 90)
- Check if your tenant has a large audit log volume
- Try running during off-peak hours

### Unexpected Over-Privileged Results

**Problem**: Active administrators are flagged as over-privileged.

**Solutions**:
- Extend the analysis period - they may work in cycles
- Verify their activities are logged in Intune audit logs
- Check if they use other admin portals (Azure AD, etc.)

---

## FAQ

**Q: How often should I run this analysis?**  
A: We recommend quarterly reviews (every 3 months) as part of your access review process.

**Q: Will this analysis remove any users or permissions?**  
A: No, this is a read-only analysis tool. It only provides recommendations - you must take action manually.

**Q: What's the difference between Direct and Group membership?**  
A: Direct = user is directly assigned the role. Group = user inherits the role through security group membership. Nested = user is in a group that's in another group.

**Q: Can I export the results?**  
A: Use the export functionality in the table header to download results as CSV or Excel for further analysis.

**Q: Does this analyze custom Intune roles?**  
A: Currently, the analyzer focuses on the built-in "Intune Administrator" role. Custom role analysis may be available in future updates.

**Q: What actions are considered "read", "write", or "delete"?**  
A: 
- **Read**: Viewing configurations, policies, devices, reports
- **Write**: Creating or modifying policies, configurations, assignments
- **Delete**: Removing policies, wiping devices, deleting configurations

**Q: Are guest users included in the analysis?**  
A: Yes, any user with Intune Administrator role permissions is analyzed, including guest accounts.

---

## Security & Privacy Notes

🔒 **Data Handling**
- Analysis is performed in real-time and not stored
- All data retrieved follows your organization's security policies
- Only audit logs within your specified timeframe are analyzed

🔐 **Permissions Required**
- You must have permissions to read Intune roles and audit logs
- Results are limited to what your account can access

📊 **Audit Compliance**
- All API calls are logged in Azure AD audit logs
- The analysis itself is auditable
- No changes are made to your environment

---

## Additional Resources

- [Microsoft Intune RBAC Documentation](https://docs.microsoft.com/en-us/mem/intune/fundamentals/role-based-access-control)
- [Principle of Least Privilege Best Practices](https://docs.microsoft.com/en-us/security/privileged-access-workstations/overview)
- [Intune Built-in Roles Reference](https://docs.microsoft.com/en-us/mem/intune/fundamentals/role-based-access-control#built-in-roles)

---

## Need Help?

If you encounter issues or have questions:
- Check the troubleshooting section above
- Review your Intune role permissions
- Contact your organization's Intune administrator
- Refer to the IntuneAssistant support documentation

---

*Last updated: March 2026*

