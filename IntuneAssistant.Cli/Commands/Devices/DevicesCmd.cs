using System.CommandLine;

namespace IntuneAssistant.Cli.Commands.Devices;

public static class DevicesCmd
{
    public static Command New()
    {

        var devicesCommand = new Command(CommandConfiguration.DevicesCommandName,
            CommandConfiguration.DevicesCommandDescription);
        var globalOption = new Option<Enums.FixedOptions?>(CommandConfiguration.OutputFlags,
            CommandConfiguration.OutputFlagsDescription);
        devicesCommand.AddGlobalOption(globalOption);

        devicesCommand.AddCommand(new ManagedDevicesCmd());
        devicesCommand.AddCommand(new DeviceDuplicateCmd());
        devicesCommand.AddCommand(new DevicesOsBuildOverviewCmd());

        return devicesCommand;
    }
}
