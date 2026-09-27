# Installation

WebDesigner is one skill folder: `skills/web-designer/`. Pick the install that matches your tool.

Requirements: **Node.js 18+** is recommended so the skill can run its checker
(`scripts/check.mjs`, no npm install needed). Without Node the skill still works, but it
performs the checks by reading the code and tells you the automated check didn't run.

## Claude Code — as a plugin (recommended)

In Claude Code:

```
/plugin marketplace add Knight1598/WebDesigner-Skill
/plugin install webdesigner@webdesigner
```

Restart the session if the skill doesn't appear. Update later with `/plugin marketplace update webdesigner`.

## Claude Code — as a plain skill

User-wide (every project):

```bash
git clone https://github.com/Knight1598/WebDesigner-Skill.git
```

```bash
mkdir -p ~/.claude/skills && cp -r WebDesigner-Skill/skills/web-designer ~/.claude/skills/
```

Project-only: copy `skills/web-designer` to `<your-project>/.claude/skills/web-designer`.

## Codex

Codex reads skills from `~/.agents/skills` (user) and `<repo>/.agents/skills` (project).

```bash
mkdir -p ~/.agents/skills && cp -r WebDesigner-Skill/skills/web-designer ~/.agents/skills/
```

Restart Codex, then ask for a website in plain language, or mention `$web-designer`.

## Windows (PowerShell)

```powershell
git clone https://github.com/Knight1598/WebDesigner-Skill.git
Copy-Item -Recurse WebDesigner-Skill\skills\web-designer "$HOME\.claude\skills\"   # Claude Code
Copy-Item -Recurse WebDesigner-Skill\skills\web-designer "$HOME\.agents\skills\"   # Codex
```

Create the target folder first if it doesn't exist (`New-Item -ItemType Directory -Force "$HOME\.claude\skills"`).

## Verify the install

Ask: **"ทำเว็บร้านกาแฟเล็ก ๆ ให้หน่อย"**. The assistant should first show a short
*Design Direction* and then build `web/index.html`. You can also run the checker by hand:

```bash
node ~/.claude/skills/web-designer/scripts/check.mjs path/to/your-project
```
