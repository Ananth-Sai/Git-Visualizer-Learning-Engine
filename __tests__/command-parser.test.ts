import { describe, it, expect } from 'vitest';
import { tokenizeCommand } from '../core/parser/CommandLexer';
import { parseGitCommand } from '../core/parser/CommandParser';

describe('Command Lexer & Parser Resilience Suite', () => {
  // 1. Tokenizer & Quoting Rules
  describe('tokenizeCommand', () => {
    it('splits simple space-separated command strings', () => {
      const tokens = tokenizeCommand('git commit -m initial');
      expect(tokens).toEqual(['git', 'commit', '-m', 'initial']);
    });

    it('handles multiple consecutive spaces cleanly', () => {
      const tokens = tokenizeCommand('git    switch   -c    feature/login');
      expect(tokens).toEqual(['git', 'switch', '-c', 'feature/login']);
    });

    it('preserves single-quoted strings with inner spaces', () => {
      const tokens = tokenizeCommand("git commit -m 'feat: added oauth authentication'");
      expect(tokens).toEqual(['git', 'commit', '-m', 'feat: added oauth authentication']);
    });

    it('preserves double-quoted strings with special characters', () => {
      const tokens = tokenizeCommand('git commit -m "fix(ui): resolved margin & flex-wrap issue #42"');
      expect(tokens).toEqual(['git', 'commit', '-m', 'fix(ui): resolved margin & flex-wrap issue #42']);
    });

    it('handles unclosed quotes gracefully without crashing', () => {
      const tokens = tokenizeCommand('git commit -m "unclosed message string');
      expect(tokens).toEqual(['git', 'commit', '-m', 'unclosed message string']);
    });

    it('handles empty and whitespace-only inputs', () => {
      expect(tokenizeCommand('')).toEqual([]);
      expect(tokenizeCommand('   ')).toEqual([]);
    });
  });

  // 2. Git Command Parsing & Flag Extraction
  describe('parseGitCommand', () => {
    it('returns an error on empty or whitespace strings', () => {
      const res1 = parseGitCommand('');
      expect(res1.error).toBeDefined();

      const res2 = parseGitCommand('   ');
      expect(res2.error).toBeDefined();
    });

    it('parses commands with or without the leading "git" keyword', () => {
      const resWithGit = parseGitCommand('git status');
      expect(resWithGit.parsed?.command).toBe('status');
      expect(resWithGit.parsed?.safety).toBe('safe');

      const resWithoutGit = parseGitCommand('status');
      expect(resWithoutGit.parsed?.command).toBe('status');
      expect(resWithoutGit.parsed?.safety).toBe('safe');
    });

    it('parses short bundled flags and captures argument values (-am "message")', () => {
      const res = parseGitCommand('git commit -am "hotfix for bug"');
      expect(res.parsed?.command).toBe('commit');
      expect(res.parsed?.flags['a']).toBe(true);
      expect(res.parsed?.flags['m']).toBe('hotfix for bug');
      expect(res.parsed?.safety).toBe('caution');
    });

    it('parses long flags with equal signs (--message="foo")', () => {
      const res = parseGitCommand('git commit --message="updated config"');
      expect(res.parsed?.command).toBe('commit');
      expect(res.parsed?.flags['message']).toBe('updated config');
    });

    it('parses long flags with separate values (--onto main)', () => {
      const res = parseGitCommand('git rebase --onto main feat-base feat-branch');
      expect(res.parsed?.command).toBe('rebase');
      expect(res.parsed?.flags['onto']).toBe('main');
      expect(res.parsed?.args).toEqual(['feat-base', 'feat-branch']);
      expect(res.parsed?.safety).toBe('caution');
    });

    it('parses shell utility helper commands (touch and echo redirection)', () => {
      const touchRes = parseGitCommand('touch styles.css');
      expect(touchRes.parsed?.command).toBe('touch');
      expect(touchRes.parsed?.args).toEqual(['styles.css']);
      expect(touchRes.parsed?.safety).toBe('safe');

      const echoRes = parseGitCommand('echo "export const API = 123" > api.ts');
      expect(echoRes.parsed?.command).toBe('echo');
      expect(echoRes.parsed?.args[0]).toBe('export const API = 123');
      expect(echoRes.parsed?.args[1]).toBe('api.ts');
      expect(echoRes.parsed?.safety).toBe('safe');
    });
  });

  // 3. Safety Classification Invariants
  describe('Safety Classification', () => {
    it('classifies destructive commands correctly', () => {
      const hardReset = parseGitCommand('git reset --hard HEAD~1');
      expect(hardReset.parsed?.safety).toBe('destructive');
      expect(hardReset.parsed?.safetyExplanation).toContain('Uncommitted changes in working tree will be discarded');

      const forceBranchDelete = parseGitCommand('git branch -D stale-feature');
      expect(forceBranchDelete.parsed?.safety).toBe('destructive');

      const forcePush = parseGitCommand('git push origin main --force');
      expect(forcePush.parsed?.safety).toBe('destructive');

      const cleanForce = parseGitCommand('git clean -f');
      expect(cleanForce.parsed?.safety).toBe('destructive');
    });

    it('classifies caution-level commands correctly', () => {
      const mergeCmd = parseGitCommand('git merge feature');
      expect(mergeCmd.parsed?.safety).toBe('caution');

      const rebaseCmd = parseGitCommand('git rebase main');
      expect(rebaseCmd.parsed?.safety).toBe('caution');

      const amendCommit = parseGitCommand('git commit --amend');
      expect(amendCommit.parsed?.safety).toBe('caution');

      const cherryPick = parseGitCommand('git cherry-pick a1b2c3d');
      expect(cherryPick.parsed?.safety).toBe('caution');

      const softReset = parseGitCommand('git reset HEAD~1');
      expect(softReset.parsed?.safety).toBe('caution');

      const pullCmd = parseGitCommand('git pull origin main');
      expect(pullCmd.parsed?.safety).toBe('caution');
    });

    it('classifies non-destructive read & branch commands as safe', () => {
      const statusCmd = parseGitCommand('git status');
      expect(statusCmd.parsed?.safety).toBe('safe');

      const logCmd = parseGitCommand('git log --oneline');
      expect(logCmd.parsed?.safety).toBe('safe');

      const branchList = parseGitCommand('git branch');
      expect(branchList.parsed?.safety).toBe('safe');

      const switchCmd = parseGitCommand('git switch main');
      expect(switchCmd.parsed?.safety).toBe('safe');
    });
  });
});
