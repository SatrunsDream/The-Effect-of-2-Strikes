import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SandboxProvider, useSandbox } from '../../context/SandboxContext';
import { SandboxControls } from '../sandbox/SandboxControls';
import { StatsTable } from '../sandbox/StatsTable';
import { GaugeGrid } from '../sandbox/GaugeGrid';
import { SwingDiagram } from '../sandbox/SwingDiagram';
import { useData } from '../../context/DataContext';
import { ORANGE } from '../../theme';
import type { PlayerAngles, LeagueStats, PlayerRates } from '../../types/data';

function SandboxInner() {
  const data = useData();
  const { selectedPlayer, strikeCount } = useSandbox();

  const playerNames = useMemo(() => {
    return (data?.players0 ?? []).map(p => p.name_with_stand).sort();
  }, [data]);

  const playerAngles: PlayerAngles | null = useMemo(() => {
    if (!data) return null;
    const list = strikeCount === '0' ? data.players0 : data.players2;
    return list.find(p => p.name_with_stand === selectedPlayer) ?? (strikeCount === '0' ? data.zeroStats[0] : data.twoStats[0]) as unknown as PlayerAngles;
  }, [data, selectedPlayer, strikeCount]);

  const leagueStats: LeagueStats | null = useMemo(() => {
    if (!data) return null;
    return strikeCount === '0' ? data.zeroStats[0] : data.twoStats[0];
  }, [data, strikeCount]);

  const playerRates: PlayerRates | null = useMemo(() => {
    if (!data) return null;
    const list = strikeCount === '0' ? data.playerRates0 : data.playerRates2;
    return list.find(p => p.name_with_stand === selectedPlayer) ?? null;
  }, [data, selectedPlayer, strikeCount]);

  return (
    <section id="sandbox" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 max-w-12" style={{ background: ORANGE }} />
        <span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: ORANGE }}>
          Interactive
        </span>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="font-black uppercase text-white mb-3"
        style={{ fontSize: 'clamp(1.4rem, 3vw, 2.4rem)', lineHeight: 1.1 }}
      >
        Explore How MLB Hitters{' '}
        <span style={{ color: ORANGE }}>Adjust</span><br />
        in Two-Strike Counts
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-white/55 text-sm font-medium leading-relaxed max-w-2xl mb-8"
      >
        Search for any qualifying MLB hitter and compare their swing metrics between 0-strike
        and 2-strike counts. Compare how your favorite player adjusts.
      </motion.p>

      <SandboxControls playerNames={playerNames} />

      {/* Dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Stats table */}
        <div className="lg:col-span-1 min-h-64">
          {leagueStats && (
            <StatsTable
              playerName={selectedPlayer}
              strikeCount={strikeCount}
              playerRates={playerRates}
            />
          )}
        </div>

        {/* Swing diagram */}
        <div className="lg:col-span-1 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {playerAngles ? (
            <SwingDiagram
              attackAngle={playerAngles.attack_angle}
              swingPathTilt={playerAngles.swing_path_tilt}
              attackDirection={playerAngles.attack_direction}
              batSpeed={playerAngles.bat_speed}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-white/30 text-sm font-bold">Select a player</div>
          )}
        </div>

        {/* Gauge grid */}
        <div className="lg:col-span-1">
          {playerAngles && leagueStats ? (
            <GaugeGrid playerData={playerAngles} leagueStats={leagueStats} />
          ) : (
            <div className="h-64 flex items-center justify-center text-white/30 text-sm font-bold">Loading…</div>
          )}
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
