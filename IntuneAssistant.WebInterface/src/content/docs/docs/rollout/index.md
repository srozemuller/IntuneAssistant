---
title: Rollout assignments
description: An overview about how to roll out assignments in bulk
---
In this documentation you will find all the information you need to know about how to enroll assignments in bulk into Intune. 

## Requirements
To use this feature you have to purchase a license per tenant. More information about licencing check the [licensing docs](/docs/licensing)
When missing the correct license you will see a page with the following error:

`Your tenant needs the correct before you can use this feature.`

## Permissions
Making assignments needs extra permissions above the READ permissions (find READ permissions [here](/docs/general/authentication/). 

- **DeviceManagementApps.ReadWrite.All** -> Read and Write Microsoft Intune apps
- **DeviceManagementConfiguration.ReadWrite.All** -> Read and Write Microsoft Intune Device Configuration and Policies

## Bulk assignments overview
When having the correct license, you get access to the assignments page. The page has looks like the screenshot below.  
![assignments-page](/images/rollout/assignments-overview.png)

>Currently only configuration and compliance policy assignments are supported.

## CSV
To add Intune assignments in bulk you need to provide CSV file. 
The CSV file contains several columns that makes the rollout possible. 
You can download the CSV file template [here](/rollout/assignments)

### CSV file explained
The CSV file has several columns. 

- **PolicyName** -> It is the name of the policy
- **GroupName** -> This is the Entra ID group name. All Users and All Devices are also supported, keep in mind these are the Intune objects.
- **AssignmentDirection** -> This is the assignment direction *include* or *exclude* the assignment (Values: **_include, exclude_**)
- **AssignmentAction** -> This is the action to *add*, *remove* or *replace* the assignment (Values: **_add, remove, replace_**)
- **FilterName** ->  This is the filter name
- **FilterType** -> This tells if you want to *include* or *exclude* the filter (Values: **_include, exclude_**)

### Example
An example of the CSV file is shown below:
```text
PolicyName;GroupName;AssignmentDirection;AssignmentAction;FilterName;FilterType
AE - Compliance Policy - Corporate owned dedicated device - v1.0;AAD_UA_Update-Ring-01;Include;Add;MacBook;include
macOS - CP - Delay Major Software Updates - v1.0;All Users;Include;Add;;
W11 - CP - Remove Chat Icon - v1.1;AAD_DA_AutoPilot-Devices-Shared;Exclude;Add;Windows 11;include
W1x - CP - Block access to public Microsoft Store - v1.0;All Devices;Include;Add;;
```

### Scenario's
- I want to add an assignment that includes All Users (Intune) without a filter.  
`W1x - CP - Block access to public Microsoft Store - v1.0;All Users;Include;Add;;`  

- I want to add an assignment that included All Devices (Intune)  
`W1x - CP - Block access to public Microsoft Store - v1.0;All Devices;Include;Add;;`
- I want to add an assignment that included an Entra ID group with a filter.

- I want to add an assignment that excludes an Entra ID group without a filter.

- I want to remove an included assignment

- I want to replace all current assignments with a new assignment

## CSV Upload
When your CSV is ready, you can drop the CSV on the page or use the upload button to select the file from you system.
After that, the upload process will check if you CSV has valid rows. Checks included for example are valid value and duplicate rows.

When having issues in you CSV you will get a message like this

