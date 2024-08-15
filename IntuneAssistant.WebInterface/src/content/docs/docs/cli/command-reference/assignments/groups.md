---
title: Group Assignments
description: A guide in my new Starlight docs site.
---
# Groups
Shows all group assignments in Intune based on Entra ID group


## Main command
```bash
intuneCLI show assignments groups
```

## Basic information
```bash
Description:
  Shows all group assignments in Intune

Usage:
  intuneCli show assignments groups [options]

Options:
  --export-csv <export-csv>  Exports the content to a csv file
  --group-id <group-id>      Enter the Entra ID Group ID
  --group-name <group-name>  Enter the Entra ID Group name
  -page-size <page-size>     Option to output the content into pages, give a number of rows
  -?, -h, --help             Show help and usage information
```

## Show assignment based on group name
```bash
intuneCLI show assignments groups --group-name "All Users"
```

## Show assignment based on group ID
```bash
intuneCLI show assignments groups --group-id "{the Entra ID group ID}"
```

## Output
```
┌──────────────────────────┬─────────────────────────┬─────────────────────────┬──────────────────┬─────────────────────────┬────────────┐
│ ResourceType             │ ResourceName            │ ResourceId              │ AssignmentType   │ FilterId                │ FilterType │
├──────────────────────────┼─────────────────────────┼─────────────────────────┼──────────────────┼─────────────────────────┼────────────┤
│ CompliancePolicy         │ Windows 10 - Compliancy │ 122da4e8-5806-4ade-bcf2 │ allDevices       │ Automated Filter        │ include    │
│                          │ policy                  │ -0561b104366b           │                  │ Creation                │            │
│ CompliancePolicy         │ Defender for Endpoint   │ 38766e84-c8a5-4d17-b3cb │ allDevices       │ No filter               │ none       │
│                          │                         │ -369d86af646d           │                  │                         │            │
└──────────────────────────┴─────────────────────────┴─────────────────────────┴──────────────────┴─────────────────────────┴────────────┘
Page 1 of 4
```

## Assignment context arguments

### Page size
Enter a number how long the result page must be in the terminal. (default 25)
```bash
intuneCli show assignments -page-size 15
```

*Use LEFT or RIGHT arrow to select page, use ESC to exit.*

### Export content
Exports the Intune assignments to a CSV file.
```bash
intuneCli show assignments --export-csv ./filelocation/file.csv
```