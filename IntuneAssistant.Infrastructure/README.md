# IntuneAssistant

Welcome to **The IntuneCLI**. This CLI helps you managing Microsoft Intune environments. 

In this very first version one small command is available to help you removing duplicate devices from Intune.
The current version has two supported platforms, Windows and macOS.  

The Windows client can be downloaded here: [The IntuneCLI Windows](https://github.com/srozemuller/IntuneAssistant/blob/main/ClientDownloads/Windows/intunecli-win-x64-v1.1.exe)  
The macOS client can be downloaded here: [The IntuneCLI macOS](https://github.com/srozemuller/IntuneAssistant/blob/main/ClientDownloads/macOS/intunecli-osx-arm64-v1.1)


![theintuneCLI.png](Documentation%2Fimages%2FtheintuneCLI.png)

### Authentication
To authentication use this command. The command opens a browser for interactive login.

```shell
./IntuneAssistant.Cli auth login
```

![cliLogin.jpeg](Documentation%2Fimages%2FcliLogin.jpeg)

To log out use:
```shell
./IntuneAssistant.Cli auth logout
```

### Intune Assignments overview
To view all assignments in Intune use this command:
```shell
./IntuneAssistant.Cli show assignments
```

### Intune Group Assignments overview
To view all assignments in Intune use this command:
```shell
./IntuneAssistant.Cli show assignments groups
```

To view a specific group based on group name, overview use this command:
```shell
./IntuneAssistant.Cli show assignments groups --group-name "All Users"
```
To view a specific group based on group id, overview use this command:
```shell
./IntuneAssistant.Cli show assignments groups --group-id 000-0000
```

To export the overview to CSV use:
```shell
./IntuneAssistant.Cli show assignments groups --group-id 000-0000 --export-csv filename.csv
```

![intune-groupoverview](Documentation/images/intune-groupoverview.jpeg)

### Help
If you need more information about all commands available use the `-h` option in a specific area.

```shell
./IntuneAssistant.Cli auth -h
```

```shell
./IntuneAssistant.Cli show devices -h
```

