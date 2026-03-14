# gh-setup-hooks

Auto-install GitHub CLI on Claude Code on the Web via SessionStart hook.

## Architecture

- `bin/gh-setup.js` - CLI entry point
- `src/index.js` - Core logic: environment detection, gh download/install, checksum verification, GH_REPO setup
- Zero npm dependencies; uses only Node.js built-in modules (fs, child_process, os)

## Development

```bash
npm test                    # Run tests (node:test)
node bin/gh-setup.js        # Local run (exits immediately — remote-only)
```

## Key Design Decisions

- Only runs when `CLAUDE_CODE_REMOTE=true` (remote Claude Code environment)
- Checksum verification is mandatory — installation aborts on failure
- `GH_REPO` is auto-set from git remote to support proxy URLs
- PATH and GH_REPO are persisted via `CLAUDE_ENV_FILE`
