#!/usr/bin/env bash
# Reinstall all Claude Code skills and plugins used with this project.
# Usage: bash setup-skills.sh
# Plugins load when a Claude Code session starts, so start a new session after running this.

FAILED=()

run() {
  echo
  echo ">>> $*"
  if ! "$@"; then
    echo "!!! FAILED: $*"
    FAILED+=("$*")
  fi
}

# Run from $HOME so `npx skills` does not pick up project-local config.
cd "$HOME" || exit 1

# 1-4: skills (installed into ~/.claude/skills)
run npx -y skills add mattpocock/skills --skill chief-of-staff retro to-spec to-tickets implement-spec -g -a claude-code -y
run npx -y skills add wheresryan22/anatomy -g -a claude-code -y
run npx -y skills add mattpocock/skills --skill teach -g -a claude-code -y
run npx -y skills add coreyhaines31/marketingskills --skill marketing-psychology -g -a claude-code -y

# 5: superpowers (the official marketplace is not configured by default, so add it first)
run claude plugin marketplace add anthropics/claude-plugins-official
run claude plugin install superpowers@claude-plugins-official

# 6: ui-ux-pro-max
run claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
run claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill

# 7: last30days
run claude plugin marketplace add mvanhorn/last30days-skill
run claude plugin install last30days@last30days-skill

echo
echo "== Installed skills (~/.claude/skills) =="
ls "$HOME/.claude/skills"
echo
echo "== Installed plugins =="
claude plugin list

echo
if [ ${#FAILED[@]} -eq 0 ]; then
  echo "All commands succeeded. Start a new Claude Code session so the plugins load."
else
  echo "These commands failed:"
  printf '  - %s\n' "${FAILED[@]}"
  exit 1
fi
