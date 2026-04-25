import { useEffect, useRef, useState } from 'react';
import { mountSandboxSwingThree, type SandboxThreeApi } from '../../sandbox/swingThreeScene';
import { SwingDiagram } from './SwingDiagram';

interface Props {
  attackAngle: number;
  attackDirection: number;
  swingPathTilt: number;
  batSpeed: number;
}

/**
 * 3D swing view from the static site (`graphs/swingAnimationWithOBJ.js`).
 * If `public/models/ballandbat.glb` is missing, falls back to the 2D `SwingDiagram`.
 */
export function SandboxThreeView({ attackAngle, attackDirection, swingPathTilt, batSpeed }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<SandboxThreeApi | null>(null);
  const valuesRef = useRef({ attackAngle, attackDirection, swingPathTilt });
  valuesRef.current = { attackAngle, attackDirection, swingPathTilt };

  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        const api = await mountSandboxSwingThree(el);
        if (cancelled) {
          api.dispose();
          return;
        }
        apiRef.current = api;
        const v = valuesRef.current;
        api.updateAttackAngle(v.attackAngle);
        api.updateDirectionAngle(v.attackDirection);
        api.updateSwingPathTilt(v.swingPathTilt);
      } catch {
        if (!cancelled) {
          setUseFallback(true);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (useFallback) {
      return;
    }
    const api = apiRef.current;
    if (!api) {
      return;
    }
    api.updateAttackAngle(attackAngle);
    api.updateDirectionAngle(attackDirection);
    api.updateSwingPathTilt(swingPathTilt);
  }, [attackAngle, attackDirection, swingPathTilt, useFallback]);

  if (useFallback) {
    return (
      <div className="h-full w-full min-h-[400px] flex items-center justify-center p-2">
        <SwingDiagram
          attackAngle={attackAngle}
          swingPathTilt={swingPathTilt}
          attackDirection={attackDirection}
          batSpeed={batSpeed}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-[400px] overflow-hidden"
      style={{ minHeight: '400px' }}
    />
  );
}
