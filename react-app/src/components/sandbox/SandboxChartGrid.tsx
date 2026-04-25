import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  drawAttackAngle,
  drawBatSpeed,
  drawDirectionAngle,
  drawSwingPathTilt,
  type SandboxDrawRow,
} from '../../sandbox/baseSandboxCharts';
import { SANDBOX_CARD_BG, SANDBOX_CARD_BORDER } from '../../theme';

const CELL =
  'relative overflow-hidden flex items-center justify-center min-h-0 min-w-0 w-full h-full';

/**
 * One outer panel (like `.graphs-container` on the static site) with a 2×2 **internal** grid — shared border, no per-cell card chrome.
 */
export function SandboxChartGrid({ row }: { row: SandboxDrawRow }) {
  const zoneMapRef = useRef<HTMLDivElement>(null);
  const outcomeRef = useRef<HTMLDivElement>(null);
  const attackPlotRef = useRef<HTMLDivElement>(null);
  const directionPlotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cells = [zoneMapRef, outcomeRef, attackPlotRef, directionPlotRef] as const;
    cells.forEach(r => {
      if (r.current) {
        d3.select(r.current).html('');
      }
    });

    const drawData: SandboxDrawRow[] = [row];

    if (zoneMapRef.current) {
      drawAttackAngle(d3.select(zoneMapRef.current), drawData, { title: 'Attack Angle (°)', max: 60 });
    }
    if (outcomeRef.current) {
      drawBatSpeed(d3.select(outcomeRef.current), drawData, { title: 'Bat Speed (mph)', max: 120 });
    }
    if (attackPlotRef.current) {
      drawDirectionAngle(d3.select(attackPlotRef.current), drawData, { title: 'Direction Angle (°)', max: 60 });
    }
    if (directionPlotRef.current) {
      drawSwingPathTilt(d3.select(directionPlotRef.current), drawData, { title: 'Swing Path Tilt (°)', max: 60 });
    }
  }, [row]);

  return (
    <div
      className="h-full w-full min-h-[min(100vw,500px)] lg:min-h-0 rounded-[10px] overflow-hidden grid grid-cols-2 grid-rows-2"
      style={{
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 0,
        background: SANDBOX_CARD_BG,
        border: `1px solid ${SANDBOX_CARD_BORDER}`,
        boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
      }}
    >
      <div
        ref={zoneMapRef}
        className={`${CELL} border-r border-b border-white/10`}
        style={{ background: 'rgba(255,255,255,0.03)' }}
      />
      <div
        ref={outcomeRef}
        className={`${CELL} border-b border-white/10`}
        style={{ background: 'rgba(255,255,255,0.03)' }}
      />
      <div
        ref={attackPlotRef}
        className={`${CELL} border-r border-white/10`}
        style={{ background: 'rgba(255,255,255,0.03)' }}
      />
      <div ref={directionPlotRef} className={CELL} style={{ background: 'rgba(255,255,255,0.03)' }} />
    </div>
  );
}
