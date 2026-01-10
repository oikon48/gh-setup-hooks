# gh-setup

Auto-install GitHub CLI on Claude Code on the Web. **Just add one line to settings.json.**

## Setup

Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "npx -y @oikon48/gh-setup",
            "timeout": 120
          }
        ]
      }
    ]
  }
}
```

That's it.

## How It Works

1. Start a session on Claude Code on the Web
2. SessionStart hook runs `npx @oikon48/gh-setup`
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

⚠️ **`bunx` does not work** ([#16150](https://github.com/anthropics/claude-code/issues/16150)). Use `npx`.

## License

MIT

## References

- [GitHub CLI](https://cli.github.com/)
- [Claude Code Hooks](https://code.claude.com/docs/en/hooks)
