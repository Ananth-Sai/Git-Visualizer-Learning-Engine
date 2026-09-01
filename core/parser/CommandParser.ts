import { ParsedCommand, CommandSafety } from '../types';
import { tokenizeCommand } from './CommandLexer';

export function parseGitCommand(rawInput: string): { parsed?: ParsedCommand; error?: string } {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { error: 'Empty command' };
  }

  const tokens = tokenizeCommand(trimmed);
  if (tokens.length === 0) {
    return { error: 'Empty command' };
  }

  // Support echo / touch file creation commands in terminal
  if (tokens[0] === 'echo' || tokens[0] === 'touch') {
    const rawCommand = tokens[0];
    if (rawCommand === 'touch') {
      const targetFile = tokens[1] || 'file.txt';
      return {
        parsed: {
          raw: trimmed,
          command: 'touch',
          args: [targetFile],
          flags: {},
          safety: 'safe',
        },
      };
    }
    // echo "content" > file.ext or echo "content" >> file.ext
    const redirectIdx = tokens.findIndex((t) => t === '>' || t === '>>');
    if (redirectIdx !== -1 && redirectIdx + 1 < tokens.length) {
      const content = tokens.slice(1, redirectIdx).join(' ');
      const targetFile = tokens[redirectIdx + 1];
      return {
        parsed: {
          raw: trimmed,
          command: 'echo',
          args: [content, targetFile],
          flags: {},
          safety: 'safe',
        },
      };
    }
  }

  let cmdIndex = 0;
  if (tokens[0] === 'git') {
    cmdIndex = 1;
  }

  if (cmdIndex >= tokens.length) {
    return { error: 'Please enter a git command (e.g. `git status`, `git commit -m "feat"`).' };
  }

  const command = tokens[cmdIndex];
  const remaining = tokens.slice(cmdIndex + 1);

  const flags: Record<string, string | boolean> = {};
  const args: string[] = [];

  for (let i = 0; i < remaining.length; i++) {
    const token = remaining[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      if (key.includes('=')) {
        const [k, v] = key.split('=');
        flags[k] = v;
      } else if (i + 1 < remaining.length && !remaining[i + 1].startsWith('-')) {
        // Lookahead if flag expects a value, e.g. --message "foo"
        if (key === 'message' || key === 'author' || key === 'onto') {
          flags[key] = remaining[++i];
        } else {
          flags[key] = true;
        }
      } else {
        flags[key] = true;
      }
    } else if (token.startsWith('-') && !token.startsWith('--')) {
      const key = token.slice(1);
      const lastChar = key[key.length - 1];
      const requiresValue = ['m', 'b', 'c', 'd', 'D'].includes(lastChar) && i + 1 < remaining.length;

      if (requiresValue) {
        // All preceding characters are boolean flags (e.g. -am -> a is boolean, m is value)
        for (let j = 0; j < key.length - 1; j++) {
          flags[key[j]] = true;
        }
        flags[lastChar] = remaining[++i];
      } else {
        // All characters are boolean flags (e.g. -p, -a, -i)
        for (const char of key) {
          flags[char] = true;
        }
      }
    } else {
      args.push(token);
    }
  }

  const { safety, explanation } = determineSafety(command, flags, args);

  const parsed: ParsedCommand = {
    raw: trimmed,
    command,
    subcommand: args[0],
    args,
    flags,
    safety,
    safetyExplanation: explanation,
  };

  return { parsed };
}

function determineSafety(
  command: string,
  flags: Record<string, string | boolean>,
  args: string[]
): { safety: CommandSafety; explanation: string } {
  // Destructive Commands
  if (command === 'reset' && flags['hard']) {
    return {
      safety: 'destructive',
      explanation: 'Destructive: Uncommitted changes in working tree will be discarded permanently.',
    };
  }
  if (command === 'clean' && flags['f']) {
    return {
      safety: 'destructive',
      explanation: 'Destructive: Untracked files will be forcefully deleted.',
    };
  }
  if (command === 'branch' && flags['D']) {
    return {
      safety: 'destructive',
      explanation: 'Destructive: Force deletes unmerged branches.',
    };
  }
  if (command === 'push' && (flags['force'] || flags['f'])) {
    return {
      safety: 'destructive',
      explanation: 'Destructive: Overwrites remote branch history.',
    };
  }

  // Caution Commands
  if (command === 'merge' || command === 'rebase') {
    return {
      safety: 'caution',
      explanation: 'Caution: Can generate merge conflicts requiring manual inspection.',
    };
  }
  if (command === 'commit' && (flags['amend'] || flags['a'])) {
    return {
      safety: 'caution',
      explanation: 'Caution: Modifies commit history and rewrites the most recent commit SHA.',
    };
  }
  if (command === 'revert' || command === 'cherry-pick') {
    return {
      safety: 'caution',
      explanation: 'Caution: Creates new history by inverting or replaying past commits.',
    };
  }
  if (command === 'reset') {
    return {
      safety: 'caution',
      explanation: 'Caution: Moves HEAD pointer backwards in commit history.',
    };
  }
  if (command === 'pull') {
    return {
      safety: 'caution',
      explanation: 'Caution: Fetches and immediately merges remote changes into working branch.',
    };
  }

  // Safe Commands
  return {
    safety: 'safe',
    explanation: 'Safe: Non-destructive state inspection or safe branching operation.',
  };
}
