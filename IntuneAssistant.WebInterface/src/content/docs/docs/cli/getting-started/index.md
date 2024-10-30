---
title: Getting started
description: A guide in my new Starlight docs site.
---

Welcome to **The IntuneCLI**. This CLI helps you managing Microsoft Intune environments.

## Installation
To use the IntuneCLI several installation options are available and can be use on Windows, MacOS and Linux.
In any way you first need to install at least `dotnet 7.0`. To install dotnet use the commands below.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::danger

Version  **2.0.0** relies on DotNet version 8.0.102. You have to update your DotNet version to 8.0.102 first before updating the IntuneCLI.
Use the commands below to update your DotNet version.

```shell
    winget source add winget
    winget install --id Microsoft.DotNet.SDK.8 --source winget --log C:\Temp\install.log
```

If Winget does not work go to this url [Microsoft DotNet 8](https://dotnet.microsoft.com/en-us/download/dotnet/8.0) and install the SDK version.
:::



### Install dotnet 7 sdk
<Tabs>
  <TabItem value="windows" label="Windows" default>
    winget source add winget
    winget install --id Microsoft.DotNet.SDK.7 --source winget --log C:\Temp\install.log
Check the link on [Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/core/install/windows?tabs=net70) for installing dotnet 7.0 on Windows.
  </TabItem>
  <TabItem value="macos" label="MacOS">
    Check the link on [Mircosoft Learn](https://learn.microsoft.com/en-us/dotnet/core/install/macos)
  </TabItem>
</Tabs>

Restart the terminal or command prompt.

### NuGet
The recommended way to install this tool is with the use of the NuGet repository. Using the NuGet repository simplifies the download process. 
By using the install command below the correct package is selected automatically.  
Another advantage is using the NuGet installation method is that the command ```intuneCli``` becomes available in your whole system. 
You don't have to execute the specific file.

### Add the nuget feed
```
dotnet nuget add source https://api.nuget.org/v3/index.json --name nuget.org
```

### This command will install the tool
```
dotnet tool install --global IntuneCLI
```

### Update to the latest version
```
dotnet tool update --global IntuneCLI
```

### Clear nuget cache (if the tool is not found)
It can happen that the update process does not find the latest package available on NuGet. In that case, you have to clear the local NuGet cache.
```
dotnet nuget locals all --clear
```

## Authenticate
Authentication is required to use the IntuneCLI but is simple. To Authenticate, just start using the commandlets. The first time you use a commandlet you will be asked to authenticate.
The authentication process will open a browser window where you can login with your Microsoft account. After login, you will be asked to give permission to the IntuneCLI to access your Microsoft environment.


## Help
If you need more information about all commands available use the `-h` option in a specific area.
Examples:

```shell
intuneCli -h
```

## Global arguments
The global arguments that are available at every command.

```bash
Description:

Usage:
  intuneCli [command] [options]

Options:
  --version       Show version information
  -?, -h, --help  Show help and usage information

Commands:
  auth      Authentication options
  apps      Retrieves apps from Intune.
  devices   Retrieve a list of all devices from Intune
  policies  Retrieve a list of all policies from Intune
  show      Give you all show options
```
