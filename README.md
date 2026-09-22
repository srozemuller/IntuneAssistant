# IntuneAssistant

A free, read-only community tool that shows what is really configured in your Microsoft Intune tenant.

- **Free.** For every Intune administrator.
- **Read-only.** It never creates, changes or deletes anything in your tenant.
- **Open source.** Read it, fork it, improve it.

## What you can do with it

| Ask… | Where |
|---|---|
| Who gets this policy or app? | Assignments → All configurations / Apps |
| What applies to this group, user or filter? | Assignments → By group / By user / By filter |
| What is on this device? How do two devices differ? | Devices → Overview / Compare / Duplicates |
| Which policies and settings do I have? | Policies → Policy list / Settings overview / Conditional Access |
| Who are my Intune administrators? | Check → Admin roles |
| What is Microsoft announcing? | Check → Service announcements |

## Getting started

1. Open the app and sign in with the Microsoft work account of the tenant you want to look at.
2. Create your account (one click) and let a Global Administrator approve read-only access.
3. Explore.

Access can be removed at any time by deleting the IntuneAssistant enterprise application in Microsoft Entra ID.
More about permissions and data on the *Privacy & security* page in the app.

## Run it locally

Requires Node.js 22.

```bash
npm install
npm run dev
```

The app talks to the IntuneAssistant API. `lib/constants.ts` picks the API from `NEXT_PUBLIC_APP_ENV`
(`development` → local API, `test` → test API, otherwise production).

## Read-only on purpose

Every request to the API is a `GET`. `lib/apiRequest.ts` refuses any other method, with one exception:
creating your own account during onboarding (`POST /customer`), which writes to our own service and never to your tenant.
If you add a feature, it has to work with `GET` requests.

## Contributing

- Found a bug or have an idea? [Open an issue](https://github.com/srozemuller/IntuneAssistant/issues/new/choose).
- Pull requests are welcome. Keep it simple: this tool should stay easy for anyone to pick up and use.
- Documentation lives at [docs.intuneassistant.cloud](https://docs.intuneassistant.cloud).

## Command line

There is also a command line tool. See [`IntuneAssistant.Cli`](IntuneAssistant.Cli/README.md).

## License

[GPL-3.0](LICENSE)
