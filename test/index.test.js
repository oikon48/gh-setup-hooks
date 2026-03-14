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

  it('returns undefined for unsupported architectures', () => {
    assert.equal(ARCH_MAP.ia32, undefined);
    assert.equal(ARCH_MAP.ppc64, undefined);
  });
});

describe('parseGhRepo', () => {
  describe('proxy URLs (Claude Code on the Web)', () => {
    it('extracts owner/repo from proxy URL', () => {
      assert.equal(
        parseGhRepo('http://local_proxy@127.0.0.1:48052/git/owner/repo'),
        'owner/repo'
      );
    });

    it('extracts owner/repo from proxy URL with different port', () => {
      assert.equal(
        parseGhRepo('http://local_proxy@127.0.0.1:12345/git/my-org/my-repo'),
        'my-org/my-repo'
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
    it('extracts owner/repo from SSH URL', () => {
      assert.equal(
        parseGhRepo('git@github.com:owner/repo'),
        'owner/repo'
      );
    });

    it('extracts owner/repo from SSH URL with .git suffix', () => {
      assert.equal(
        parseGhRepo('git@github.com:owner/repo.git'),
        'owner/repo'
      );
    });
  });

  describe('edge cases', () => {
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
        parseGhRepo('https://github.com/owner/repo\n'),
        'owner/repo'
      );
    });
  });
});
