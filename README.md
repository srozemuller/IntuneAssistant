# IntuneAssistant

Welcome to **The IntuneCLI**. This CLI helps you managing Microsoft Intune environments. 

In this very first version one small command is available to help you removing duplicate devices from Intune.
The current version has two supported platforms, Windows and macOS.  

The Windows client can be downloaded here: [The IntuneCLI Windows](https://github.com/srozemuller/IntuneAssistant/tree/main/ClientDownloads/Windows)  
The macOS client can be downloaded here: [The IntuneCLI macOS](https://github.com/srozemuller/IntuneAssistant/tree/main/ClientDownloads/macOS)


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

### Help
If you need more information about all commands available use the `-h` option in a specific area.

```shell
./IntuneAssistant.Cli auth -h
```

```shell
./IntuneAssistant.Cli devices -h
```