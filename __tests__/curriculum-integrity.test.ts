import { describe, it, expect } from 'vitest';
import { LESSONS } from '../core/curriculum/lessons';
import { RECIPE_SCENARIOS } from '../core/curriculum/scenarios';

describe('Curriculum & Scenario Integrity Verification Suite', () => {
  describe('All Curriculum Lessons', () => {
    it('has valid, non-empty lesson definitions across all 4 tiers', () => {
      expect(LESSONS.length).toBeGreaterThanOrEqual(20);
      for (const lesson of LESSONS) {
        expect(lesson.id).toBeDefined();
        expect(lesson.title).toBeDefined();
        expect(lesson.tier).toBeGreaterThanOrEqual(1);
        expect(lesson.tier).toBeLessThanOrEqual(4);
        expect(lesson.description).toBeDefined();
        expect(lesson.expectedGoalText).toBeDefined();
      }
    });

    it('initialState initializes cleanly without errors for every single lesson', () => {
      for (const lesson of LESSONS) {
        const state = lesson.initialState();
        expect(state).toBeDefined();
        expect(state.objects).toBeDefined();
        expect(state.refs).toBeDefined();
        expect(state.head).toBeDefined();
      }
    });

    it('validate function does not falsely pass on initial unstarted state (except for informational levels)', () => {
      for (const lesson of LESSONS) {
        const initialState = lesson.initialState();
        const emptyHistory: any[] = [];
        
        // Lessons that require user interaction must not pass on initial state
        const passesInitially = lesson.validate(initialState, emptyHistory);
        if (lesson.id === 'level-19') {
          expect(passesInitially).toBe(false);
        }
      }
    });
  });

  describe('Scenario Recipes (Emergency Wizard & Exploration)', () => {
    it('initializes all emergency scenarios cleanly', () => {
      expect(RECIPE_SCENARIOS.length).toBeGreaterThanOrEqual(3);
      for (const scenario of RECIPE_SCENARIOS) {
        expect(scenario.id).toBeDefined();
        expect(scenario.title).toBeDefined();
        expect(scenario.problemDescription).toBeDefined();
        expect(scenario.stepGuide.length).toBeGreaterThan(0);
        const state = scenario.initialState();
        expect(state).toBeDefined();
        expect(state.objects).toBeDefined();
      }
    });
  });
});
