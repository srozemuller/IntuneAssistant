using System.CommandLine;

namespace IntuneAssistant.Cli.Commands.Devices;

public static class DevicesCmd
{
    public static Command New()
    {
        var devicesCommand = new GetManagedDevicesCommand();
        var devicesDuplicateCommand = new DeviceDuplicateCommand();

        devicesCommand.AddCommand(devicesDuplicateCommand);

        return devicesCommand;
    }
}
