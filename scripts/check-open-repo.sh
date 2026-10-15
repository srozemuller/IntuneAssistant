#!/usr/bin/env bash
# Guards the open community repository against paid-feature material.
#
#   1. No tracked build output or dependencies (.next/, node_modules/): source maps embed the source.
#   2. No paid-feature term in a tracked file, except the paths listed in
#      scripts/open-repo-baseline.txt. That list is known debt and may only shrink.
#
# Run it locally from anywhere in the repository: bash scripts/check-open-repo.sh
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

BASELINE="scripts/open-repo-baseline.txt"
# Portable word boundaries: \b is not understood by git grep -E on every platform (macOS), so spell them out.
L='(^|[^[:alnum:]_])'
R='($|[^[:alnum:]_])'
PATTERN="assignments[ _-]?manager|migration[ _-]?builder|config_management|hasModule|Module:[a-z_]+|RequireBetaTester|security[ _-]?insights|IntuneAssistant\.Docs/private|${L}paid${R}|${L}premium${R}"
DOCS_DIR="IntuneAssistant.Docs/public"
# Concept words that only make sense for the paid edition. Checked in the docs only, where the word 'worker'
# or 'module' would never be a plain technical term.
DOCS_PATTERN="${L}msp${R}|${L}gdap${R}|${L}workers?${R}|${L}extensions${R}|configuration management|config management|reporting module|${L}modules?${R}|${L}beta${R}|drift monitor"
status=0

# 1. Build output and dependencies must never be tracked.
tracked_artifacts="$(git ls-files | grep -E '(^|/)(\.next|node_modules)/' || true)"
if [ -n "$tracked_artifacts" ]; then
  count="$(printf '%s\n' "$tracked_artifacts" | wc -l | tr -d ' ')"
  echo "ERROR: $count tracked file(s) are build output or dependencies (.next/ or node_modules/). First ones:" >&2
  printf '%s\n' "$tracked_artifacts" | head -5 >&2
  echo "Untrack them with: git rm -r --cached <path>" >&2
  status=1
fi

# 2. Paid-feature terms outside the baseline.
hits="$(git grep -n -i -E "$PATTERN" -- . \
  ':!package-lock.json' ':!**/package-lock.json' ':!LICENSE' \
  ':!scripts/check-open-repo.sh' ':!scripts/open-repo-baseline.txt' || true)"
doc_hits="$(git grep -n -i -E "$DOCS_PATTERN" -- "$DOCS_DIR" || true)"
hits="$(printf '%s\n%s\n' "$hits" "$doc_hits")"

new_hits="$(printf '%s\n' "$hits" | awk -F: '
  NR == FNR { if ($0 !~ /^#/ && NF) prefix[$0] = 1; next }
  NF {
    skip = 0
    for (p in prefix) if (index($1, p) == 1) { skip = 1; break }
    if (!skip) print
  }' "$BASELINE" -)"

if [ -n "$new_hits" ]; then
  echo "ERROR: paid-feature wording or logic found in this open repository:" >&2
  printf '%s\n' "$new_hits" | cut -c1-200 >&2
  echo "Remove it, or reword it neutrally. Do not add paths to $BASELINE." >&2
  status=1
fi

if [ "$status" -eq 0 ]; then
  echo "OK: no tracked build output, no paid-feature terms outside the baseline."
fi
exit "$status"
