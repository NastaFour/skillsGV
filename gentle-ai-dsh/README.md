# gentle-ai-dsh

**Gentle-AI ecosystem for DeepSeek Harness** — one command installs the full
multi-agent stack: Spec-Driven Development (SDD) orchestrator, 206 skills,
Engram + Context7 + OpenDesign over MCP.

This is an **addon** (a per-session agent preset + a skills catalog + an
onboarding AGENTS.md), not a host-level cordis plugin. That is the correct unit
for per-session capability in dsh, and it is what makes "one mode with
everything" possible.

## What is inside

| Piece | What it is |
|---|---|
| **gentle-ai mode** | An agent preset (preset/agent.cordis.yml): orchestrator persona, SDD phase delegation (flash + strong subagents), Judgment Day, run_code (self-authoring is OPT-IN) |
| **skillsGV catalog** | 206 skills vendored under skills/ (skillsGV + mattpocock + 20-agent roster: sdd-* phases, judgment-day, review-* lenses, design-driven, skill-harvest, ...) |
| **Engram + Context7 + OpenDesign** | Three MCP rows (dsh-mcp-client) wired into the mode: memory + docs + design |
| **OpenDesign** | open-design skill + MCP tools (mcp__open-design__*); od CLI as fallback |

## Install

    pnpm add -g gentle-ai-dsh
    gentle-ai-dsh --set-default

or without installing globally:

    pnpm dlx gentle-ai-dsh --set-default

The installer:

1. copies the 206 skills to ~/.agents/skills
2. copies the gentle-ai preset to ~/.dsh/.agent-presets/gentle-ai
3. writes the bootstrap AGENTS.md to ~/.dsh/AGENTS.md
4. (with --set-default) sets agent-presets.default: gentle-ai

Then **restart the dsh Host** and open a new session — it starts in the
gentle-ai mode.

## Bootstrap (the first thing the agent sees)

The agent reads ~/.dsh/AGENTS.md before its first turn. It will ask for these;
set them in the dsh Host environment and restart:

| Env var | Purpose | Default |
|---|---|---|
| ENGRAM_MCP_COMMAND | Engram MCP server (stdio) | — (disabled until set) |
| ENGRAM_MCP_ARGS | JSON array of args | [] |
| CONTEXT7_MCP_URL | Context7 endpoint (keyless public) | https://mcp.context7.com/mcp |
| CONTEXT7_MCP_URL | Context7 endpoint | https://mcp.context7.com/mcp |
| DSH_FLASH_MODEL | Flash model for delegated sub-agents | deepseek-v4-flash |

Missing values are safe: the mode still mounts and those MCP tools simply stay
absent until you set them.

## Model routing (flash vs strong)

| Env var | Purpose | Default |
|---|---|---|
| DSH_FLASH_PROVIDER | Provider for most delegated work (sdd-* except apply, reviews, jd-fix) | opencode-go |
| DSH_FLASH_MODEL | Flash (cheap) model | deepseek-v4-flash |
| DSH_STRONG_PROVIDER | Provider for sdd-apply + Judgment Day judges | opencode-go |
| DSH_STRONG_MODEL | Strong model | deepseek-v4-pro |

Set them in the dsh Host environment (PowerShell):

    $env:DSH_FLASH_MODEL  = 'deepseek-v4-flash'   # cheap / mechanical phases
    $env:DSH_STRONG_MODEL = 'deepseek-v4-pro' # sdd-apply / judges

Both must be models your provider actually serves. Sub-agents are bounded with
maxDepth 3 + maxTokens 16000 (flash) to cap token burn; ralph has maxRounds 64.

The catalog's **_shared/model-routing/profiles.{example,schema}.json** are the
DECLARATIVE phase→alias reference (opus = propose/design, sonnet =
spec/tasks/apply/verify). In dsh the routing is **env-only**: those aliases map to
DSH_STRONG_MODEL (opus) and DSH_FLASH_MODEL (sonnet). The profile file is
documentation, not a runtime config here — decided (E4), so it is no longer orphaned.

The canonical 20-agent roster lives in the skillsGV catalog
(`_shared/agent-roster/roster.json` + the **agent-roster** meta-skill);
`node 00-meta-skills/agent-roster/scripts/apply.mjs --runtime dsh` emits
`preset/roster.routing.json` (agent → tier/effort/tool) and syncs the fallback
defaults above.

## How to work (once installed)

In a gentle-ai session, say **/sdd new** or "SDD change". The orchestrator loads
**sdd-orchestrator** and delegates phases: sdd-init/explore/propose (strong),
sdd-spec/design (strong for design), sdd-tasks/apply/verify (flash), then
**judgment-day** (dual adversarial review) and **code-reviewer** before done.

## Architecture (dsh-native mapping)

| Concern | dsh mechanism |
|---|---|
| The "mode" | agent preset ~/.dsh/.agent-presets/gentle-ai/agent.cordis.yml |
| Skills | dsh-skill-filesystem reads ~/.agents/skills |
| MCP (Engram/Context7/OpenDesign) | dsh-mcp-client rows (stdio + streamable-http) |
| Flash/strong routing | dsh-tool-subagent agentOptions.model (subagent / subagent_strong) |
| Onboarding | dsh-agent-instructions reads ~/.dsh/AGENTS.md |

## OpenDesign and ruflo

OpenDesign is wired into the preset as an MCP server (the mcp-open-design row):
its tools surface as mcp__open-design__*. The row expects the Open Design desktop
app (the user's `claude mcp add-json` config is baked in; OD_DATA_DIR /
OD_SIDECAR_IPC_PATH / OD_MCP_BOOTSTRAP_* env vars can override it). Restart the
Host after install so the tools mount. The **od** CLI stays the fallback if the
MCP server is not running:

    pnpm add -g open-design      # design daemon (nexu-io/open-design)

ruflo (**claude-flow**) is a separate external CLI (ruvnet/ruflo,
Claude-Code-oriented swarms) and is not bundled.

## Repo layout

    gentle-ai-dsh/
      bin/gentle-dsh.mjs    installer CLI
      preset/               the gentle-ai agent preset (the mode)
      skills/               206 skills + _shared
      AGENTS.md             bootstrap onboarding (installed to ~/.dsh/AGENTS.md)
      cordis.patch.yml      empty host-plane bundle hook (see note below)
      package.json          registry package + dsh.bundle.patch

## Note on cordis.patch.yml

The package declares a dsh bundle hook (dsh.bundle.patch -> cordis.patch.yml),
but it is intentionally empty: the composition is per-session and lives in the
preset. Adding this package to a profile's bundles is a safe no-op; run the
installer for the real effect. To mount Engram/Context7 at the HOST plane
(global, all modes) instead of per-session, move the three mcp-client rows from
preset/agent.cordis.yml into cordis.patch.yml and restart the Host.

## Manage

    gentle-ai-dsh doctor        # verify the install
    gentle-ai-dsh --uninstall   # remove preset + AGENTS.md (skills are shared, left in place)

## Self-authoring (opt-in)

**tool-cordis** (read/modify the runtime, author new presets) is NOT mounted in the
default preset — it is a shell-access trust boundary. To enable it, uncomment the
`tool-cordis` row in preset/agent.cordis.yml and reinstall.
