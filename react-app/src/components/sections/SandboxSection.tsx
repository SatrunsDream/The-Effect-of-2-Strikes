import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SandboxProvider, useSandbox } from '../../context/SandboxContext';
import { SandboxControls } from '../sandbox/SandboxControls';
import { SandboxChartGrid } from '../sandbox/SandboxChartGrid';
import { SandboxThreeView } from '../sandbox/SandboxThreeView';
import { StatsTable } from '../sandbox/StatsTable';
import { useData } from '../../context/DataContext';
import { NAVY, ORANGE, SANDBOX_CARD_BG, SANDBOX_CARD_BORDER } from '../../theme';
import type { SandboxDrawRow } from '../../sandbox/baseSandboxCharts';
import type { PlayerRates } from '../../types/data';

function SandboxInner() {
  const data = useData();
  const { selectedPlayer, strikeCount } = useSandbox();

  const playerNames = useMemo(() => {
    return (data?.players0 ?? []).map(p => p.name_with_stand).sort();
  }, [data]);

  const drawRow: SandboxDrawRow | null = useMemo(() => {
    if (!data) {
      return null;
    }
    const strikes: 0 | 2 = strikeCount === '2' ? 2 : 0;
    const list = strikeCount === '0' ? data.players0 : data.players2;
    const found = list.find(p => p.name_with_stand === selectedPlayer);
    const league = strikeCount === '0' ? data.zeroStats[0] : data.twoStats[0];
    if (found) {
      return { ...found, strikes };
    }
    return {
      name_with_stand: 'League Average',
      attack_angle: league.attack_angle,
      attack_direction: league.attack_direction,
      swing_path_tilt: league.swing_path_tilt,
      bat_speed: league.bat_speed,
      strikes,
    };
  }, [data, selectedPlayer, strikeCount]);

  const playerRates: PlayerRates | null = useMemo(() => {
    if (!data) {
      return null;
    }
    const list = strikeCount === '0' ? data.playerRates0 : data.playerRates2;
    return list.find(p => p.name_with_stand === selectedPlayer) ?? null;
  }, [data, selectedPlayer, strikeCount]);

  return (
    <section id="sandbox" className="py-20 px-6 max-w-[1800px] mx-auto text-center">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="h-px flex-1 max-w-12" style={{ background: ORANGE }} />
        <span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: ORANGE }}>
          Interactive
        </span>
        <div className="h-px flex-1 max-w-12" style={{ background: ORANGE }} />
      </div>

      {/* Match static `index.html` / `.sandbox-title` — one centered headline */}
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="font-black text-white mb-4 mx-auto max-w-4xl px-2"
        style={{ fontSize: 'clamp(1.35rem, 2.2vw, 1.8rem)', lineHeight: 1.25 }}
      >
        Explore How MLB Hitters Adjust in Two Strike Counts
      </motion.h2>

      {/* Same lead-in as the static site (after “But how does the rest of the league differ?”) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="mx-auto max-w-3xl mb-6 text-left sm:text-center"
      >
        <h3 className="text-base sm:text-lg font-black mb-3" style={{ color: ORANGE }}>
          But how does the rest of the league differ?
        </h3>
        <p className="text-sm sm:text-base font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Below are scatter plots showing how changes in the variance of these swing angles relate to key outcome
          metrics, along with an interactive sandbox dashboard. Use these tools to explore league-wide trends, evaluate
          how Yordan’s two-strike approach is justified, and compare how your favorite player adjusts and how much
          better or worse their outcomes are between zero-strike and two-strike counts.
        </p>
      </motion.div>

      <div className="mb-4 flex justify-center w-full">
        <SandboxControls playerNames={playerNames} />
      </div>

      {/*
        Static `index.html` `.sandbox-layout`: left bar → 3D → 2×2 charts on the far right.
        Stats sit in the left column under the blue accent so the chart grid stays the rightmost block.
      */}
      <div
        className="flex flex-col xl:flex-row w-full items-stretch gap-[1vw] text-left"
        style={{ minHeight: '500px' }}
      >
        {/* One panel: top row = navy strip, bottom = stats (internal grid, not two separate cards) */}
        <div
          className="w-full xl:w-[200px] shrink-0 min-h-0 grid grid-rows-[minmax(88px,0.4fr)_1fr] rounded-[10px] overflow-hidden"
          style={{
            border: `1px solid ${SANDBOX_CARD_BORDER}`,
            boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
            background: SANDBOX_CARD_BG,
            minHeight: '280px',
          }}
        >
          <div
            className="min-h-0 w-full border-b border-white/10"
            style={{ background: NAVY }}
            aria-hidden
          />
          <div className="min-h-0 min-w-0 overflow-y-auto">
            {drawRow ? (
              <StatsTable
                embedded
                playerName={selectedPlayer}
                strikeCount={strikeCount}
                playerRates={playerRates}
              />
            ) : null}
          </div>
        </div>

        <div
          className="flex-[2] min-w-0 min-h-[400px] xl:min-h-0 rounded-[10px] overflow-hidden"
          style={{
            background: SANDBOX_CARD_BG,
            border: `1px solid ${SANDBOX_CARD_BORDER}`,
            boxShadow: '0 4px 8px rgba(0,0,0,0.25)',
          }}
        >
          {drawRow ? (
            <SandboxThreeView
              attackAngle={drawRow.attack_angle}
              attackDirection={drawRow.attack_direction}
              swingPathTilt={drawRow.swing_path_tilt}
              batSpeed={drawRow.bat_speed}
            />
          ) : (
            <div className="h-full min-h-[400px] flex items-center justify-center text-white/30 text-sm font-bold">
              Loading…
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 w-full min-h-[min(100vw,500px)] xl:min-h-0" style={{ minWidth: 0 }}>
          {drawRow ? <SandboxChartGrid row={drawRow} /> : null}
        </div>
      </div>
    </section>
  );
}

export function SandboxSection() {
  return (
    <SandboxProvider>
      <SandboxInner />
    </SandboxProvider>
  );
}
