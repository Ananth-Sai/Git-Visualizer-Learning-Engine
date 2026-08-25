import { AiPromptContext, buildSystemPrompt } from './PromptBuilder';
import { UserAiSettings } from '../types';

export interface AiCoachResponse {
  advice: string;
  suggestedCommand?: string;
  source: 'free-proxy' | 'byok' | 'fallback';
}

export async function askAiCoach(context: AiPromptContext, settings: UserAiSettings): Promise<AiCoachResponse> {
  try {
    const res = await fetch('/api/ai-coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-provider': settings.provider || 'default-free',
        ...(settings.customApiKey ? { 'x-custom-api-key': settings.customApiKey } : {}),
        ...(settings.customModel ? { 'x-custom-model': settings.customModel } : {}),
      },
      body: JSON.stringify({
        context,
        systemPrompt: buildSystemPrompt(),
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with ${res.status}`);
    }

    const data = await res.json();
    return {
      advice: data.advice,
      suggestedCommand: data.suggestedCommand,
      source: settings.provider === 'default-free' ? 'free-proxy' : 'byok',
    };
  } catch (err: any) {
    // Graceful offline/local simulated pedagogical fallback
    return getLocalPedagogicalAdvice(context);
  }
}

function getLocalPedagogicalAdvice(context: AiPromptContext): AiCoachResponse {
  if (context.errorMessage) {
    if (context.errorMessage.includes('conflict')) {
      return {
        advice: 'You have a merge conflict because both branches touched the same file. Open the 3-Way Conflict Resolver to choose the changes you want to keep.',
        suggestedCommand: 'git status',
        source: 'fallback',
      };
    }
    if (context.errorMessage.includes('branch named')) {
      return {
        advice: 'That branch already exists! You can jump straight to it with `git switch <branch>` without the `-c` flag.',
        suggestedCommand: `git switch ${context.command?.split(' ').pop() || 'main'}`,
        source: 'fallback',
      };
    }
  }

  if (context.levelObjective) {
    return {
      advice: `To complete this level objective: "${context.levelObjective}", follow the recommended command hints below or try inspecting your current branch with git status.`,
      suggestedCommand: 'git status',
      source: 'fallback',
    };
  }

  return {
    advice: 'Your repository is in a healthy state. Try creating a new branch or making a commit to explore the graph!',
    suggestedCommand: 'git commit -m "Update feature"',
    source: 'fallback',
  };
}
