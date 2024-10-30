---
title: Applications
description: A guide in my new Starlight docs site.
---
# List
Lists all applications from Intune.

## Main command
```bash
intuneCli apps list
```

```bash
Description:
  Gives you a list of all applications from Intune

Usage:
  intuneCli apps list [options]

Options:
  --export-csv <export-csv>     Exports the content to a csv file
  -?, -h, --help                Show help and usage information
```

### Export content
Exports the Intune assignments to a CSV file.
```bash
intuneCli apps list --export-csv ./filelocation/file.csv
```