using System.CommandLine;

namespace IntuneAssistant.Cli.Commands.Devices;

public static class DevicesCmd
{
    public static Command New()
    {
        var devicesCommand = new ManagedDevicesCmd();
        var devicesDuplicateCommand = new DeviceDuplicateCmd();

        devicesCommand.AddCommand(devicesDuplicateCommand);

        return devicesCommand;
    }
}
