# Searching and Filtering Tables

Every table in Intune Assistant has a search box above it. You can use it to quickly narrow down long lists of policies, devices, assignments, and other items.

## How to use it

Type any word into the search box and the table instantly shows only the rows that contain it, anywhere in any column.

To exclude rows instead of finding them, put an exclamation mark (`!`) directly in front of a word. Rows containing that word will be hidden.

You can combine as many words as you like, separated by spaces. Every word you type without `!` must be present in a row, and every word with `!` must be absent, for that row to show up.

### Examples

| You type | What you get |
|---|---|
| `compliant` | Only rows that contain "compliant" |
| `!test` | All rows except those that contain "test" |
| `compliant !test` | Rows that contain "compliant" but not "test" |
| `!test !android` | All rows except those that mention "test" or "android" |

## What you'll see

While you type, the table updates automatically. A counter above the table shows how many rows match out of the total, for example "3 of 5 results". Hover over the small info icon next to the search box for a quick reminder of this syntax.

## Requirements

No special license or permission is needed. This works on every table across the app, for any user who can already see that table.

## Tips

- Search is not case-sensitive.
- Search looks at every column of a row, not just the ones currently visible on screen.
- Clear the search box (using the "x" button) to see the full list again.
