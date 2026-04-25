import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CorrelationMatrix } from '../charts/CorrelationMatrix';
import { useData } from '../../context/DataContext';
import { ORANGE } from '../../theme';

const I_METRICS = ['wOBA', 'swing%', 'zone_swing%', 'chase%', 'contact%', 'whiff%',
  'foul%', 'in_play%', 'oppo%', 'gb%', 'barrel%'];

function formatMetricName(m: string): string {
  if (m === 'wOBA') return 'wOBA';
  if (m === 'gb%') return 'GB%';
  const parts = m.split('_');
  if (parts[0] === 'delta') {
    const rest = parts.slice(1).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
    return `Δ Var(${rest})`;
  }
  return parts.map(w => w[0].toUpperCase() + w.slice(1)).join('');
}

type RowData = Record<string, number | string>;

export function CorrelationSection() {
  const data = useData();
  const [selectedMetric, setSelectedMetric] = useState('wOBA');

  // Convert columnar league_trend to row array
  const rowData = useMemo<RowData[]>(() => {
    if (!data?.leagueTrend) return [];
    const raw = data.leagueTrend;
    const keys = Object.keys(raw);
    const values: Record<string, (string | number)[]> = {};
    keys.forEach(k => { values[k] = Object.values(raw[k] as Record<string, string | number>); });
    const length = values[keys[0]]?.length ?? 0;
    return Array.from({ length }, (_, i) => {
      const row: RowData = {};
      keys.forEach(k => { row[k] = values[k][i]; });
      return row;
    });
  }, [data]);

  return (
    <section id="correlation" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 max-w-12" style={{ background: ORANGE }} />
        <span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: ORANGE }}>
          League-Wide Trends
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10"
      >
        <h2 className="font-black uppercase text-white"
          style={{ fontSize: 'clamp(1.4rem, 3vw, 2.4rem)', lineHeight: 1.1 }}>
          How does the <span style={{ color: ORANGE }}>rest of the league</span> differ?
        </h2>

        {/* Metric selector */}
        <div className="flex-shrink-0">
          <select
            value={selectedMetric}
            onChange={e => setSelectedMetric(e.target.value)}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            {I_METRICS.map(m => (
              <option key={m} value={m}>{formatMetricName(m)}</option>
            ))}
          </select>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-white/60 text-sm font-medium leading-relaxed max-w-3xl mb-10"
      >
        Below are scatter plots showing how changes in the variance of swing angles relate to key
        outcome metrics. Use the selector above to explore different outcomes.
      </motion.p>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMetric}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
        >
          {rowData.length > 0 ? (
            <CorrelationMatrix data={rowData} selectedMetric={selectedMetric} />
          ) : (
            <div className="h-60 flex items-center justify-center text-white/30 text-sm font-bold">Loading…</div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
