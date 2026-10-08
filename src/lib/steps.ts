/**
 * Real step detection from the device motion sensor (accelerometer).
 *
 * The phone reports `accelerationIncludingGravity` roughly 60 times a second.
 * Walking shows up as a periodic oscillation on top of the ~9.8 m/s^2 gravity
 * baseline, so we low-pass the signal, track the resting baseline separately,
 * and count a step each time the deviation from that baseline rises past a
 * threshold (then re-arm after it falls back). This is the standard
 * peak-detection approach used by step counters and needs no native module.
 */

export interface StepDetectorOptions {
  /** Minimum time between counted steps, to reject jitter and double peaks. */
  minStepIntervalMs?: number;
  /** How far above the resting baseline the smoothed signal must rise (m/s^2). */
  riseThreshold?: number;
  /** Fraction of the rise threshold the signal must fall back to before re-arming. */
  fallRatio?: number;
}

/** Peak-detection step detector over the accelerometer magnitude. */
export class StepDetector {
  private readonly opts: Required<StepDetectorOptions>;
  private smooth: number | null = null;
  private baseline: number | null = null;
  private armed = true;
  private lastStepAt = Number.NEGATIVE_INFINITY;
  private count = 0;

  constructor(options: StepDetectorOptions = {}) {
    this.opts = {
      minStepIntervalMs: options.minStepIntervalMs ?? 280,
      riseThreshold: options.riseThreshold ?? 1.1,
      fallRatio: options.fallRatio ?? 0.4,
    };
  }

  /** Steps counted so far. */
  get steps(): number {
    return this.count;
  }

  /** Forget all history so a new session starts from zero. */
  reset(): void {
    this.smooth = null;
    this.baseline = null;
    this.armed = true;
    this.lastStepAt = Number.NEGATIVE_INFINITY;
    this.count = 0;
  }

  /**
   * Feed one accelerometer sample (m/s^2, gravity included) and return the
   * running step count.
   */
  push(x: number, y: number, z: number, now: number): number {
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    if (this.smooth === null || this.baseline === null) {
      this.smooth = magnitude;
      this.baseline = magnitude;
      return this.count;
    }

    // The signal is smoothed quickly; the baseline follows it very slowly, so
    // `smooth - baseline` isolates the walking oscillation from gravity.
    this.smooth = this.smooth * 0.75 + magnitude * 0.25;
    this.baseline = this.baseline * 0.985 + this.smooth * 0.015;

    const deviation = this.smooth - this.baseline;
    const { riseThreshold, fallRatio, minStepIntervalMs } = this.opts;

    if (this.armed && deviation >= riseThreshold && now - this.lastStepAt >= minStepIntervalMs) {
      this.count += 1;
      this.lastStepAt = now;
      this.armed = false;
    } else if (!this.armed && deviation <= riseThreshold * fallRatio) {
      this.armed = true;
    }

    return this.count;
  }
}

/** Average adult stride length, used to turn steps into distance. */
export const METRES_PER_STEP = 0.72;

/** Convert a step count to a distance in kilometres. */
export function stepsToKm(steps: number): number {
  return (steps * METRES_PER_STEP) / 1000;
}

function dayKey(now: number): string {
  return `campusfit.steps.${new Date(now).toISOString().slice(0, 10)}`;
}

/** Steps recorded today on this device (0 when none / storage unavailable). */
export function readTodaySteps(now: number = Date.now()): number {
  try {
    return Number(localStorage.getItem(dayKey(now))) || 0;
  } catch {
    return 0;
  }
}

/** Add steps to today's device total and return the new total. */
export function addTodaySteps(delta: number, now: number = Date.now()): number {
  const total = readTodaySteps(now) + Math.max(0, Math.round(delta));
  try {
    localStorage.setItem(dayKey(now), String(total));
  } catch {
    /* storage unavailable — the count still works for this session */
  }
  return total;
}
