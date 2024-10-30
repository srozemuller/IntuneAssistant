---
title: Authentication
description: A guide in my new Starlight docs site.
---

# Authentication
Options for authentication

```bash
Description:
  Authentication options

Usage:
  intuneCli auth [command] [options]

Options:
  -?, -h, --help  Show help and usage information

Commands:
  login   Authenticate with Entra ID
  logout  Logout of Entra ID
  show    Shows the current logged in user information

```

## Login
This command opens a brower to login interactively to Entra ID
```bash
intuneCli auth login
```
## Logout
Logs out all current logged in users and clears the tokens from the cache.
```bash
intuneCli auth logout
```
## Show
Shows the current logged in user and context
```bash
intuneCli auth show
```