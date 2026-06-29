export type Quality = 0 | 3 | 4 | 5;

export const QUALITY = {
  AGAIN: 0,
  HARD: 3,
  GOOD: 4,
  EASY: 5,
} as const satisfies Record<string, Quality>;

export interface Sm2State {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export interface Sm2Result extends Sm2State {
  dueAt: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;

export function initialSm2State(): Sm2State {
  return { easeFactor: 2.5, interval: 0, repetitions: 0 };
}

export function review(
  state: Sm2State,
  quality: Quality,
  now: number = Date.now(),
): Sm2Result {
  let { easeFactor, interval, repetitions } = state;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  const q = quality;
  easeFactor = Math.max(
    MIN_EASE,
    easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02),
  );

  return {
    easeFactor,
    interval,
    repetitions,
    dueAt: now + interval * DAY_MS,
  };
}
