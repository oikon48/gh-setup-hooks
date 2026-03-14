import fs from 'fs';
import { execSync } from 'child_process';
import os from 'os';

const LOG_PREFIX = '[gh-setup-hooks]';
const LOCAL_BIN = `${process.env.HOME}/.local/bin`;
const GH_PATH = `${LOCAL_BIN}/gh`;
const DEFAULT_GH_VERSION = '2.88.1';

const ARCH_MAP = {
  x64: 'amd64',
  arm64: 'arm64',
};

function log(msg) {
  console.error(`${LOG_PREFIX} ${msg}`);
}

function parseGhRepo(remoteUrl) {
  if (!remoteUrl) return null;
  const cleaned = remoteUrl.trim().replace(/\.git$/, '');

  // Proxy URL: http://local_proxy@127.0.0.1:PORT/git/owner/repo
  const proxyMatch = cleaned.match(/\/git\/([^/]+\/[^/]+)$/);
  if (proxyMatch) return proxyMatch[1];

  // SSH URL scheme: ssh://git@github.com/owner/repo
  const sshUrlMatch = cleaned.match(/ssh:\/\/[^@]+@github\.com\/([^/]+\/[^/]+)$/);
  if (sshUrlMatch) return sshUrlMatch[1];

  // HTTPS: https://github.com/owner/repo
  const httpsMatch = cleaned.match(/github\.com\/([^/]+\/[^/]+)$/);
  if (httpsMatch) return httpsMatch[1];

  // SSH SCP: git@github.com:owner/repo
  const sshMatch = cleaned.match(/github\.com:([^/]+\/[^/]+)$/);
  if (sshMatch) return sshMatch[1];

  return null;
}

function setupGhRepo() {
  const envFile = process.env.CLAUDE_ENV_FILE;
  if (!envFile) return;

  try {
    const remoteUrl = execSync('git remote get-url origin', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();

    const repo = parseGhRepo(remoteUrl);
    if (repo) {
      fs.appendFileSync(envFile, `export GH_REPO="${repo}"\n`);
      log(`GH_REPO set to ${repo}`);
    }
  } catch (e) {
    // Not in a git repository or no origin remote — silently skip
  }
}

function updatePath() {
  const envFile = process.env.CLAUDE_ENV_FILE;
  if (envFile) {
    fs.appendFileSync(envFile, `export PATH="${LOCAL_BIN}:$PATH"\n`);
    log('PATH persisted to CLAUDE_ENV_FILE');
  }
}

function run() {
  // Only run in remote Claude Code environment
  if (process.env.CLAUDE_CODE_REMOTE !== 'true') {
    log('Not a remote session, skipping');
    process.exit(0);
  }

  log('Remote session detected, checking gh CLI...');

  // Check if gh is already available
  try {
    const version = execSync('gh --version', { encoding: 'utf8' }).split('\n')[0];
    log(`gh CLI already available: ${version}`);
    setupGhRepo();
    process.exit(0);
  } catch (e) {
    // gh not found, continue with installation
  }

  // Check if gh exists in local bin
  if (fs.existsSync(GH_PATH)) {
    log(`gh found in ${LOCAL_BIN}`);
    updatePath();
    setupGhRepo();
    process.exit(0);
  }

  log(`Installing gh CLI to ${LOCAL_BIN}...`);

  // Create local bin directory
  fs.mkdirSync(LOCAL_BIN, { recursive: true });

  // Detect architecture
  const arch = ARCH_MAP[process.arch];
  if (!arch) {
    log(`Unsupported architecture: ${process.arch}`);
    process.exit(0);
  }

  const ghVersion = process.env.GH_SETUP_VERSION || DEFAULT_GH_VERSION;
  const tarball = `gh_${ghVersion}_linux_${arch}.tar.gz`;
  const downloadUrl = `https://github.com/cli/cli/releases/download/v${ghVersion}/${tarball}`;
  const checksumUrl = `https://github.com/cli/cli/releases/download/v${ghVersion}/gh_${ghVersion}_checksums.txt`;

  log(`Downloading gh v${ghVersion} for ${arch}...`);

  const tempDir = fs.mkdtempSync(`${os.tmpdir()}/gh-setup-`);

  try {
    // Download tarball
    execSync(
      `curl -fsSL --proto '=https' --tlsv1.2 --connect-timeout 5 --max-time 60 "${downloadUrl}" -o "${tempDir}/${tarball}"`,
      { stdio: 'inherit' }
    );

    // Download and verify checksum
    log('Verifying checksum...');
    try {
      execSync(
        `curl -fsSL --connect-timeout 5 --max-time 30 "${checksumUrl}" -o "${tempDir}/checksums.txt"`,
        { stdio: 'pipe' }
      );
      execSync(
        `cd "${tempDir}" && grep "${tarball}" checksums.txt | sha256sum -c -`,
        { stdio: 'pipe' }
      );
      log('Checksum verified');
    } catch (e) {
      log('Failed to verify checksum, skipping verification');
    }

    // Extract
    log('Extracting...');
    execSync(`tar -xzf "${tempDir}/${tarball}" -C "${tempDir}"`, { stdio: 'pipe' });

    // Move binary
    const extractedBin = `${tempDir}/gh_${ghVersion}_linux_${arch}/bin/gh`;
    fs.copyFileSync(extractedBin, GH_PATH);
    fs.chmodSync(GH_PATH, 0o755);

    updatePath();
    setupGhRepo();

    const version = execSync(`${GH_PATH} --version`, { encoding: 'utf8' }).split('\n')[0];
    log(`gh CLI installed successfully: ${version}`);
  } catch (e) {
    log(`Failed to install gh CLI: ${e.message}`);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  process.exit(0);
}

export { run as main, parseGhRepo, ARCH_MAP };
