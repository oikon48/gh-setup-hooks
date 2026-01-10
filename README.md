# gh-setup

Claude Code on the Web環境でGitHub CLIを自動インストールするプラグインです。

## Overview

このプラグインは、Claude Code on the Webのリモート環境でセッション開始時に自動的にGitHub CLI (`gh`) をインストールします。これにより、PR作成やIssue操作などのGitHubワークフローがリモート環境でも利用可能になります。

## Features

- **自動インストール**: SessionStartフックで自動実行
- **環境判定**: `CLAUDE_CODE_REMOTE=true`の場合のみ実行
- **冪等性**: インストール済みの場合はスキップ
- **セキュリティ**: SHA256チェックサムでダウンロードを検証
- **PATH永続化**: `CLAUDE_ENV_FILE`を使用してセッション中のPATHを維持

## Installation

### Option 1: Clone to local plugins directory

```bash
git clone https://github.com/oikon48/gh-setup ~/.claude/plugins/gh-setup
```

### Option 2: Add to settings.json

```json
{
  "plugins": ["https://github.com/oikon48/gh-setup"]
}
```

## How It Works

1. セッション開始時に`SessionStart`フックが発火
2. `CLAUDE_CODE_REMOTE`環境変数をチェック
3. リモート環境の場合、`gh`コマンドの存在を確認
4. 未インストールの場合、GitHub Releasesからダウンロード
5. SHA256チェックサムで整合性を検証
6. `$HOME/.local/bin`にインストール
7. `CLAUDE_ENV_FILE`にPATH設定を永続化

## Configuration

環境変数でカスタマイズ可能：

| 環境変数 | 説明 | デフォルト |
|---------|------|-----------|
| `GH_SETUP_VERSION` | インストールするghのバージョン | `2.83.2` |

## Security

このプラグインは以下のセキュリティ対策を実装しています：

- **チェックサム検証**: ダウンロードしたバイナリをSHA256で検証
- **厳格モード**: `set -euo pipefail`でエラーを検出
- **HTTPS強制**: `--proto '=https' --tlsv1.2`でTLSを強制
- **安全なPATH**: スクリプト実行時にPATHを明示的に設定

## Requirements

- Claude Code on the Web環境
- `CLAUDE_CODE_REMOTE=true`が設定されていること

## Supported Architectures

- `x86_64` (amd64)
- `aarch64` / `arm64`

## License

MIT

## References

- [Zenn記事: Claude Code on the WebでのghコマンドBD](https://zenn.dev/oikon/articles/claude-code-web-gh-cli)
- [GitHub CLI](https://cli.github.com/)
- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
