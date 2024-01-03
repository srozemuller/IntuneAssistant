### General module information
<a href="https://github.com/srozemuller/intuneassistant" target="_blank"><img src="https://img.shields.io/github/v/release/srozemuller/intuneassistant?label=latest-release&style=flat-square" alt="CurrentVersion"></a> <a href="https://github.com/srozemuller/intuneassistant/issues" target="_blank"><img src="https://img.shields.io/github/issues/srozemuller/intuneassistant?style=flat-square" alt="Issues"></a> </a><a href="https://github.com/srozemuller/intuneassistant/tree/beta" target="_blank"><img src="https://img.shields.io/maintenance/yes/2023?style=flat-square" alt="Beta"></a> </a><a href="https://github.com/srozemuller/intuneassistant/tree/beta" target="_blank"><img src="https://img.shields.io/github/license/srozemuller/intuneassistant?style=flat-square" alt="Beta"></a>

![Nuget](https://img.shields.io/nuget/dt/IntuneCli?style=flat-square&label=NuGet%20downloads)
![GitHub last commit (branch)](https://img.shields.io/github/last-commit/srozemuller/IntuneAssistant/main?style=flat-square)


<a href="https://www.buymeacoffee.com/srozemuller" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 30px !important;width: 117px !important;"></a>


# IntuneAssistant

Welcome to **The IntuneCLI**. This CLI helps you managing Microsoft Intune environments.

## Installation
To use this tool several options are available and can be use on Windows, MacOS and Linux.
In any way you first need to install at least `dotnet 7.0`. To install dotnet use the commands below.

### Install dotnet 7 sdk Windows
winget install --id Microsoft.DotNet.SDK.7 --source winget --log C:\Temp\install.log
Check the link on [Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/core/install/windows?tabs=net70) for installing dotnet 7.0 on Windows.
### Install dotnet 7 sdk macOS
Check the link on [Mircosoft Learn](https://learn.microsoft.com/en-us/dotnet/core/install/macos)

Restart the terminal.

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

### Help
If you need more information about all commands available use the `-h` option in a specific area.
Examples:

```shell
intuneCli auth -h
```

```shell
intuneCli show devices -h
```
Check for all information and commands: https://rozemuller.com/intunecli
