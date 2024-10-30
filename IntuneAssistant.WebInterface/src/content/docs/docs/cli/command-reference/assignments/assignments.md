---
title: Assignments
description: A guide in my new Starlight docs site.
---

# Assignments
Retrieves all assignments in Intune. This can be at user, device or at group level. Exclusions are also shown.

```bash
Description:
  Retrieves all assignments in Intune

Usage:
  intuneCli show assignments [command] [options]

Options:
  --export-csv <export-csv>  Exports the content to a csv file
  -page-size <page-size>     Option to output the content into pages, give a number of rows
  -?, -h, --help             Show help and usage information

Commands:
  groups  Shows all group assignements in Intune
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