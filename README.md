# gh-setup

Claude Code on the WebでGitHub CLIを自動インストール。**settings.jsonに1行追加するだけ。**

## Setup

`.claude/settings.json` に追加：

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

これだけ。

## How It Works

1. Claude Code on the Webでセッション開始
2. SessionStartフックが `npx @oikon48/gh-setup` を実行
3. リモート環境（`CLAUDE_CODE_REMOTE=true`）でのみghをインストール
4. `~/.local/bin` にインストールしPATHを永続化
5. ローカル環境では何もしない

## Features

- **設定1行**: settings.jsonに追加するだけ
- **自動更新**: npxが最新バージョンを取得
- **セキュリティ**: SHA256チェックサム検証
- **冪等性**: インストール済みならスキップ
- **PATH永続化**: `CLAUDE_ENV_FILE`でセッション中のPATHを維持

## Configuration

| 環境変数 | 説明 | デフォルト |
|---------|------|-----------|
| `GH_SETUP_VERSION` | インストールするghのバージョン | `2.83.2` |

## Note

⚠️ **`bunx` は使用不可**（[#16150](https://github.com/anthropics/claude-code/issues/16150)）。`npx` を使用。

## License

MIT

## References

- [Zenn: Claude Code on the WebでのghコマンドBD](https://zenn.dev/oikon/articles/claude-code-web-gh-cli)
- [GitHub CLI](https://cli.github.com/)
- [Claude Code Hooks](https://code.claude.com/docs/en/hooks)
