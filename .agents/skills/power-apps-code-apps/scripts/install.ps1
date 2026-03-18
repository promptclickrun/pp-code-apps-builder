# install.ps1 — Install Power Apps Code Apps skill + agents for Copilot/Claude (Windows)
# Usage: .\install.ps1 [-Target copilot|claude|all] [-Scope workspace|user]

param(
    [ValidateSet("copilot", "claude", "all")]
    [string]$Target = "all",

    [ValidateSet("workspace", "user")]
    [string]$Scope = "workspace"
)

$ErrorActionPreference = "Stop"
$SkillDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkspaceRoot = (Resolve-Path (Join-Path $SkillDir "..\..\.." )).Path

Write-Host "=== Power Apps Code Apps Skill Installer ===" -ForegroundColor Cyan
Write-Host "Target: $Target | Scope: $Scope"

function Copy-Skill {
    param(
        [string]$DestSkill,
        [string]$DestAgents
    )

    Write-Host "  Copying skill to: $DestSkill" -ForegroundColor Green
    New-Item -ItemType Directory -Path "$DestSkill\references" -Force | Out-Null
    Copy-Item "$SkillDir\..\SKILL.md" "$DestSkill\SKILL.md" -Force
    Copy-Item "$SkillDir\..\references\frontend.md" "$DestSkill\references\frontend.md" -Force
    Copy-Item "$SkillDir\..\references\backend-data.md" "$DestSkill\references\backend-data.md" -Force
    Copy-Item "$SkillDir\..\references\infra-ops.md" "$DestSkill\references\infra-ops.md" -Force

    if ($DestAgents) {
        Write-Host "  Copying agents to: $DestAgents" -ForegroundColor Green
        New-Item -ItemType Directory -Path $DestAgents -Force | Out-Null
        $agentFiles = Get-ChildItem -Path "$WorkspaceRoot\.github\agents\pa-*.agent.md" -ErrorAction SilentlyContinue
        foreach ($f in $agentFiles) {
            Copy-Item $f.FullName "$DestAgents\" -Force
        }
    }
}

# Copilot targets
if ($Target -eq "copilot" -or $Target -eq "all") {
    if ($Scope -eq "workspace") {
        Write-Host "[Copilot] Installing to workspace..." -ForegroundColor Yellow
        Copy-Skill -DestSkill "$WorkspaceRoot\.agents\skills\power-apps-code-apps" -DestAgents "$WorkspaceRoot\.github\agents"
        Copy-Skill -DestSkill "$WorkspaceRoot\.github\skills\power-apps-code-apps" -DestAgents ""
    }
    if ($Scope -eq "user") {
        Write-Host "[Copilot] Installing to user profile..." -ForegroundColor Yellow
        $userSkill = Join-Path $env:USERPROFILE ".copilot\skills\power-apps-code-apps"
        Copy-Skill -DestSkill $userSkill -DestAgents ""
        Write-Host "  Note: User-level agents go in your VS Code user prompts folder."
    }
}

# Claude targets
if ($Target -eq "claude" -or $Target -eq "all") {
    if ($Scope -eq "workspace") {
        Write-Host "[Claude] Installing to workspace..." -ForegroundColor Yellow
        Copy-Skill -DestSkill "$WorkspaceRoot\.claude\skills\power-apps-code-apps" -DestAgents ""

        $claudeMd = Join-Path $WorkspaceRoot "CLAUDE.md"
        if (-not (Test-Path $claudeMd)) {
            @"
# Power Apps Code Apps

When working on Power Apps Code Apps tasks, read the skill at ``.claude/skills/power-apps-code-apps/SKILL.md`` for the orchestration workflow and reference docs.
"@ | Set-Content $claudeMd -Encoding utf8
            Write-Host "  Created CLAUDE.md with skill reference"
        }
    }
    if ($Scope -eq "user") {
        Write-Host "[Claude] Installing to user profile..." -ForegroundColor Yellow
        $userSkill = Join-Path $env:USERPROFILE ".claude\skills\power-apps-code-apps"
        Copy-Skill -DestSkill $userSkill -DestAgents ""
    }
}

Write-Host ""
Write-Host "Installation complete." -ForegroundColor Green
Write-Host "  Skill: power-apps-code-apps"
Write-Host "  Agents: pa-frontend, pa-backend, pa-infra, pa-business-analyst, pa-architect, pa-product-manager"
Write-Host ""
Write-Host "Try: /power-apps-code-apps 'scaffold a new code app with Dataverse'" -ForegroundColor Cyan
