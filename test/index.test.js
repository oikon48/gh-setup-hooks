import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseGhRepo, ARCH_MAP } from '../src/index.js';

describe('ARCH_MAP', () => {
  it('maps x64 to amd64', () => {
    assert.equal(ARCH_MAP.x64, 'amd64');
  });

  it('maps arm64 to arm64', () => {
    assert.equal(ARCH_MAP.arm64, 'arm64');
  });
});

describe('parseGhRepo', () => {
  describe('Proxy URLs', () => {
    it('extracts owner/repo from proxy URL', () => {
      assert.equal(
        parseGhRepo('http://local_proxy@127.0.0.1:48052/git/owner/repo'),
        'owner/repo'
      );
    });

    it('extracts owner/repo from proxy URL with .git suffix', () => {
      assert.equal(
        parseGhRepo('http://local_proxy@127.0.0.1:48052/git/owner/repo.git'),
        'owner/repo'
      );
    });
  });

  describe('HTTPS URLs', () => {
    it('extracts owner/repo from HTTPS URL', () => {
      assert.equal(
        parseGhRepo('https://github.com/owner/repo'),
        'owner/repo'
      );
    });

    it('extracts owner/repo from HTTPS URL with .git suffix', () => {
      assert.equal(
        parseGhRepo('https://github.com/owner/repo.git'),
        'owner/repo'
      );
    });
  });

  describe('SSH URLs', () => {
    it('extracts owner/repo from SSH SCP URL', () => {
      assert.equal(
        parseGhRepo('git@github.com:owner/repo'),
        'owner/repo'
      );
    });

    it('extracts owner/repo from SSH SCP URL with .git suffix', () => {
      assert.equal(
        parseGhRepo('git@github.com:owner/repo.git'),
        'owner/repo'
      );
    });

    it('extracts owner/repo from ssh:// URL', () => {
      assert.equal(
        parseGhRepo('ssh://git@github.com/owner/repo'),
        'owner/repo'
      );
    });

    it('extracts owner/repo from ssh:// URL with .git suffix', () => {
      assert.equal(
        parseGhRepo('ssh://git@github.com/owner/repo.git'),
        'owner/repo'
      );
    });
  });

  describe('Edge cases', () => {
    it('returns null for null input', () => {
      assert.equal(parseGhRepo(null), null);
    });

    it('returns null for undefined input', () => {
      assert.equal(parseGhRepo(undefined), null);
    });

    it('returns null for empty string', () => {
      assert.equal(parseGhRepo(''), null);
    });

    it('returns null for non-GitHub URL', () => {
      assert.equal(
        parseGhRepo('https://gitlab.com/owner/repo'),
        null
      );
    });

    it('handles trailing whitespace', () => {
      assert.equal(
        parseGhRepo('https://github.com/owner/repo  \n'),
        'owner/repo'
      );
    });
  });
});
