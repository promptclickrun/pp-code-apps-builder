#!/usr/bin/env bash
# install.sh — Install Power Apps Code Apps skill + agents for Copilot/Claude
# Usage: bash install.sh [--target copilot|claude|all] [--scope workspace|user]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$SCRIPT_DIR"
TARGET="${1:---target}"
TARGET_VALUE="${2:-all}"
SCOPE="${3:---scope}"
SCOPE_VALUE="${4:-workspace}"

# Parse named args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) TARGET_VALUE="$2"; shift 2 ;;
    --scope)  SCOPE_VALUE="$2"; shift 2 ;;
    *) shift ;;
  esac
done

echo "=== Power Apps Code Apps Skill Installer ==="
echo "Target: $TARGET_VALUE | Scope: $SCOPE_VALUE"

copy_skill() {
  local dest_skill="$1"
  local dest_agents="$2"

  echo "  Copying skill to: $dest_skill"
  mkdir -p "$dest_skill/references"
  cp "$SKILL_DIR/SKILL.md" "$dest_skill/SKILL.md"
  cp "$SKILL_DIR/references/frontend.md" "$dest_skill/references/frontend.md"
  cp "$SKILL_DIR/references/backend-data.md" "$dest_skill/references/backend-data.md"
  cp "$SKILL_DIR/references/infra-ops.md" "$dest_skill/references/infra-ops.md"

  if [ -n "$dest_agents" ]; then
    echo "  Copying agents to: $dest_agents"
    mkdir -p "$dest_agents"
    for agent_file in "$SKILL_DIR/../../.github/agents/pa-"*.agent.md; do
      if [ -f "$agent_file" ]; then
        cp "$agent_file" "$dest_agents/"
      fi
    done
  fi
}

# Resolve workspace root (two levels up from skill dir)
WORKSPACE_ROOT="$(cd "$SKILL_DIR/../.." && pwd)"

# Copilot targets
if [[ "$TARGET_VALUE" == "copilot" || "$TARGET_VALUE" == "all" ]]; then
  if [[ "$SCOPE_VALUE" == "workspace" ]]; then
    echo "[Copilot] Installing to workspace..."
    copy_skill "$WORKSPACE_ROOT/.agents/skills/power-apps-code-apps" "$WORKSPACE_ROOT/.github/agents"
    copy_skill "$WORKSPACE_ROOT/.github/skills/power-apps-code-apps" ""
  fi
  if [[ "$SCOPE_VALUE" == "user" ]]; then
    echo "[Copilot] Installing to user profile..."
    USER_SKILLS="$HOME/.copilot/skills/power-apps-code-apps"
    copy_skill "$USER_SKILLS" ""
    echo "  Note: User-level agents go in your VS Code user prompts folder."
  fi
fi

# Claude targets
if [[ "$TARGET_VALUE" == "claude" || "$TARGET_VALUE" == "all" ]]; then
  if [[ "$SCOPE_VALUE" == "workspace" ]]; then
    echo "[Claude] Installing to workspace..."
    copy_skill "$WORKSPACE_ROOT/.claude/skills/power-apps-code-apps" ""
    # Claude uses CLAUDE.md for agent instructions — append routing guidance
    CLAUDE_MD="$WORKSPACE_ROOT/CLAUDE.md"
    if [ ! -f "$CLAUDE_MD" ]; then
      cat > "$CLAUDE_MD" << 'EOF'
# Power Apps Code Apps

When working on Power Apps Code Apps tasks, read the skill at `.claude/skills/power-apps-code-apps/SKILL.md` for the orchestration workflow and reference docs.
EOF
      echo "  Created CLAUDE.md with skill reference"
    fi
  fi
  if [[ "$SCOPE_VALUE" == "user" ]]; then
    echo "[Claude] Installing to user profile..."
    copy_skill "$HOME/.claude/skills/power-apps-code-apps" ""
  fi
fi

echo ""
echo "Installation complete."
echo "  Skill: power-apps-code-apps"
echo "  Agents: pa-frontend, pa-backend, pa-infra, pa-business-analyst, pa-architect, pa-product-manager"
echo ""
echo "Try: /power-apps-code-apps 'scaffold a new code app with Dataverse'"
