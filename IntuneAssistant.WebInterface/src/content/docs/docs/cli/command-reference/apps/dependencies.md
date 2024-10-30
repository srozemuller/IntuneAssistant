---
title: Depedencies
description: A guide in my new Starlight docs site.
---
# Dependendies
Retrieves all applications from Intune and shows the application dependency.

```bash
Description:
  Searches for application dependencies in Intune.

Usage:
  intuneCli apps dependencies [command] [options]

Options:
  -o, -output <csv|json|table>  Option to output the content into a specific type
  -?, -h, --help                Show help and usage information

Commands:
  list  Gives you a list of all resources in the specific context
```

## List
```bash
Description:
  Gives you a list of all resources in the specific context

Usage:
  intuneCli apps dependencies list [options]

Options:
  --export-csv <export-csv>              Exports the content to a csv file
  --tree-view                            Outputs an overview in tree format.
  --application-name <application-name>  Retrieves all dependencies based on a specific application name
  -o, -output <csv|json|table>           Option to output the content into a specific type
  -?, -h, --help                         Show help and usage information
```

```
┌──────────────────────────────────────┬───────────────────────┬───────────────────────┬────────────────────┬──────────────┐
│ App Id                               │ App DisplayName       │ Depends On            │ DependsOn App Type │ Auto Install │
├──────────────────────────────────────┼───────────────────────┼───────────────────────┼────────────────────┼──────────────┤
│ 1d9a0063-9c89-4802-9f29-41e1d61a2693 │ Chrome                │ OneDriveSetup.exe     │ parent             │ autoInstall  │
│ 9c13681f-65f2-4193-b47d-facc1042a603 │ OneDriveSetup.exe     │ Winget - Foxit Reader │ child              │ autoInstall  │
│ 9c13681f-65f2-4193-b47d-facc1042a603 │ OneDriveSetup.exe     │ Chrome                │ child              │ autoInstall  │
│ bffd3245-08f8-4576-bc57-acee5c498f20 │ Winget - Foxit Reader │ OneDriveSetup.exe     │ parent             │ autoInstall  │
└──────────────────────────────────────┴───────────────────────┴───────────────────────┴────────────────────┴──────────────┘
```
The **App DisplayName** is de main application in Intune. The **Depends On** column shows the application that has a relation with the main application. The **DependsOns App Type** shows the hierarchy between the main application and the depends on application.

Example:

The first row shows Chrome and OnedDriveSetup.exe depend on eachother. Where the OneDriveSetup.exe is the parent application. When going to the OneDriveSetup.exe application in Intune you will see the Chrome application under the dependencies blade.

### Arguments
#### --application-name
Retrieves all dependencies based on a specific application name. 

```bash
intuneCli apps dependencies list --application-name OneDrive                                                                  [9:08:14]
```

```
┌──────────────────────────────────────┬───────────────────┬───────────────────────┬────────────────────┬──────────────┐
│ App Id                               │ App DisplayName   │ Depends On            │ DependsOn App Type │ Auto Install │
├──────────────────────────────────────┼───────────────────┼───────────────────────┼────────────────────┼──────────────┤
│ 9c13681f-65f2-4193-b47d-facc1042a603 │ OneDriveSetup.exe │ Winget - Foxit Reader │ child              │ autoInstall  │
│ 9c13681f-65f2-4193-b47d-facc1042a603 │ OneDriveSetup.exe │ Chrome                │ child              │ autoInstall  │
└──────────────────────────────────────┴───────────────────┴───────────────────────┴────────────────────┴──────────────┘
```

#### --tree-view
Outputs an overview in tree format.

```bash
intuneCli apps dependencies list --tree-view                                                              [9:08:14]
```

```
Chrome
└── Dependencies
    └── ╭───────────────────┬────────────────────╮
        │ Depends On        │ DependsOn App Type │
        ├───────────────────┼────────────────────┤
        │ OneDriveSetup.exe │ parent             │
        ╰───────────────────┴────────────────────╯
OneDriveSetup.exe
└── Dependencies
    └── ╭───────────────────────┬────────────────────╮
        │ Depends On            │ DependsOn App Type │
        ├───────────────────────┼────────────────────┤
        │ Winget - Foxit Reader │ child              │
        │ Chrome                │ child              │
        ╰───────────────────────┴────────────────────╯
Winget - Foxit Reader
└── Dependencies
    └── ╭───────────────────┬────────────────────╮
        │ Depends On        │ DependsOn App Type │
        ├───────────────────┼────────────────────┤
        │ OneDriveSetup.exe │ parent             │
        ╰───────────────────┴────────────────────╯
```