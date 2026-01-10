#!/bin/bash
# SessionStart hook: GitHub CLI auto-installation for remote environments
# This script installs gh CLI when running in Claude Code on the Web
# Security improvements: checksum verification, strict mode, safe PATH

set -euo pipefail

# Safe PATH
export PATH="/usr/local/bin:/usr/bin:/bin"

LOG_PREFIX="[gh-setup]"
log() { echo "$LOG_PREFIX $1" >&2; }

# Only run in remote Claude Code environment
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
    log "Not a remote session, skipping gh setup"
    exit 0
fi

log "Remote session detected, checking gh CLI..."

# Check if gh is already available
if command -v gh &>/dev/null; then
    log "gh CLI already available: $(gh --version | head -1)"
    exit 0
fi

# Setup local bin directory
LOCAL_BIN="$HOME/.local/bin"
mkdir -p "$LOCAL_BIN"

# Check if gh exists in local bin
if [ -x "$LOCAL_BIN/gh" ]; then
    log "gh found in $LOCAL_BIN"
    if [[ ":$PATH:" != *":$LOCAL_BIN:"* ]]; then
        export PATH="$LOCAL_BIN:$PATH"
        if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
            echo "export PATH=\"$LOCAL_BIN:\$PATH\"" >> "$CLAUDE_ENV_FILE"
            log "PATH updated in CLAUDE_ENV_FILE"
        fi
    fi
    exit 0
fi

log "Installing gh CLI to $LOCAL_BIN..."

# Create temp directory for installation
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Detect architecture
ARCH=$(uname -m)
case "$ARCH" in
    x86_64)
        GH_ARCH="amd64"
        ;;
    aarch64|arm64)
        GH_ARCH="arm64"
        ;;
    *)
        log "Unsupported architecture: $ARCH"
        exit 0  # Fail-safe: exit 0 even on failure
        ;;
esac

# Version with environment variable override
GH_VERSION="${GH_SETUP_VERSION:-2.83.2}"
GH_TARBALL="gh_${GH_VERSION}_linux_${GH_ARCH}.tar.gz"
GH_URL="https://github.com/cli/cli/releases/download/v${GH_VERSION}/${GH_TARBALL}"
CHECKSUM_URL="https://github.com/cli/cli/releases/download/v${GH_VERSION}/gh_${GH_VERSION}_checksums.txt"

log "Downloading gh v${GH_VERSION} for ${GH_ARCH}..."

# Download with --fail flag for proper error handling
if ! curl -fsSL --proto '=https' --tlsv1.2 "$GH_URL" -o "$TEMP_DIR/$GH_TARBALL"; then
    log "Failed to download gh CLI"
    exit 0  # Fail-safe
fi

# Checksum verification
log "Verifying checksum..."
if ! curl -fsSL "$CHECKSUM_URL" -o "$TEMP_DIR/checksums.txt"; then
    log "Failed to download checksums, skipping verification"
else
    cd "$TEMP_DIR"
    if ! grep "$GH_TARBALL" checksums.txt | sha256sum -c - >/dev/null 2>&1; then
        log "Checksum verification failed!"
        exit 0  # Fail-safe: don't install unverified binary
    fi
    log "Checksum verified"
fi

log "Extracting..."
if ! tar -xzf "$TEMP_DIR/$GH_TARBALL" -C "$TEMP_DIR"; then
    log "Failed to extract gh CLI"
    exit 0  # Fail-safe
fi

# Move binary to local bin
if ! mv "$TEMP_DIR/gh_${GH_VERSION}_linux_${GH_ARCH}/bin/gh" "$LOCAL_BIN/gh"; then
    log "Failed to install gh CLI"
    exit 0  # Fail-safe
fi

chmod +x "$LOCAL_BIN/gh"

# Update PATH
export PATH="$LOCAL_BIN:$PATH"

# Persist PATH to CLAUDE_ENV_FILE if available
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
    echo "export PATH=\"$LOCAL_BIN:\$PATH\"" >> "$CLAUDE_ENV_FILE"
    log "PATH persisted to CLAUDE_ENV_FILE"
fi

log "gh CLI installed successfully: $($LOCAL_BIN/gh --version | head -1)"
exit 0
