import { useCallback, useEffect, useRef, useState } from 'react';
import { StepDetector } from '../lib/steps';

export type StepCounterStatus = 'idle' | 'running' | 'denied' | 'unsupported';

interface MotionEventPermission {
  requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
}

/**
 * Counts steps from the device motion sensor while `active` is true.
 * Requests permission where the platform requires it (iOS 13+ Safari), and
 * reports a clear status when the sensor or permission is unavailable.
 */
export function useStepCounter(active: boolean) {
  const [steps, setSteps] = useState(0);
  const [status, setStatus] = useState<StepCounterStatus>('idle');
  const detectorRef = useRef(new StepDetector());

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    const accel = event.accelerationIncludingGravity ?? event.acceleration;
    if (!accel || accel.x == null || accel.y == null || accel.z == null) return;
    const next = detectorRef.current.push(accel.x, accel.y, accel.z, performance.now());
    setSteps(next);
  }, []);

  useEffect(() => {
    if (!active) {
      setStatus('idle');
      return;
    }

    let cancelled = false;

    void (async () => {
      const motion = (window as unknown as { DeviceMotionEvent?: MotionEventPermission }).DeviceMotionEvent;
      if (!motion) {
        setStatus('unsupported');
        return;
      }

      if (typeof motion.requestPermission === 'function') {
        try {
          const granted = await motion.requestPermission();
          if (granted !== 'granted') {
            if (!cancelled) setStatus('denied');
            return;
          }
        } catch {
          if (!cancelled) setStatus('denied');
          return;
        }
      }

      if (cancelled) return;

      detectorRef.current.reset();
      setSteps(0);
      window.addEventListener('devicemotion', handleMotion);
      setStatus('running');
    })();

    return () => {
      cancelled = true;
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [active, handleMotion]);

  return { steps, status };
}
