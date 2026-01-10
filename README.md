# gh-setup-hooks

[![npm version](https://badge.fury.io/js/gh-setup-hooks.svg)](https://www.npmjs.com/package/gh-setup-hooks)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Auto-install GitHub CLI on Claude Code on the Web. **Just add one line to settings.json.**

## Install

```bash
npm install gh-setup-hooks
```

Or use directly with npx (recommended for hooks):

```bash
npx -y gh-setup-hooks
```

## Setup

### 1. Add hook to settings.json

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "npx -y gh-setup-hooks",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

### 2. Set GITHUB_TOKEN in Claude Code on the Web

To use `gh` commands (e.g., `gh pr create`), you need to set `GITHUB_TOKEN`:

1. Go to [Claude Code on the Web](https://claude.ai/code)
2. Open **Settings** → **Custom Environment**
3. Add environment variable:
   - Name: `GITHUB_TOKEN`
   - Value: Your [GitHub Personal Access Token](https://github.com/settings/tokens)

> **Note**: The token needs `repo` scope for most operations.

## How It Works

1. Start a session on Claude Code on the Web
2. SessionStart hook runs `npx gh-setup-hooks`
3. Installs gh only in remote environment (`CLAUDE_CODE_REMOTE=true`)
4. Installs to `~/.local/bin` and persists PATH
5. Does nothing in local environment

## Features

- **One-line config**: Just add to settings.json
- **Auto-update**: npx fetches the latest version
- **Secure**: SHA256 checksum verification
- **Idempotent**: Skips if already installed
- **PATH persistence**: Uses `CLAUDE_ENV_FILE` to maintain PATH

## Configuration

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `GH_SETUP_VERSION` | gh version to install | `2.83.2` |

## Note

⚠️ **`bunx` does not work** on Claude Code on the Web due to npm registry access issues ([#16150](https://github.com/anthropics/claude-code/issues/16150)). Use `npx` instead.

## License

MIT

## References

- [npm package](https://www.npmjs.com/package/gh-setup-hooks)
- [GitHub CLI](https://cli.github.com/)
- [Claude Code Hooks](https://code.claude.com/docs/en/hooks)
- [GitHub Personal Access Tokens](https://github.com/settings/tokens)
