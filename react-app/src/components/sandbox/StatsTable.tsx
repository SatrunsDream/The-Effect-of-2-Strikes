import { motion } from 'framer-motion';
import { NAVY, ORANGE } from '../../theme';
import type { PlayerRates } from '../../types/data';

interface Props {
  playerName: string;
  strikeCount: '0' | '2';
  playerRates: PlayerRates | null;
}

const FIELDS: { key: keyof PlayerRates; label: string; format: (v: number) => string }[] = [
  { key: 'contact%', label: 'Contact%', format: v => (v * 100).toFixed(1) + '%' },
  { key: 'chase%', label: 'Chase%', format: v => (v * 100).toFixed(1) + '%' },
  { key: 'whiff%', label: 'Whiff%', format: v => (v * 100).toFixed(1) + '%' },
  { key: 'barrel%', label: 'Barrel%', format: v => (v * 100).toFixed(1) + '%' },
  { key: 'oppo%', label: 'Oppo%', format: v => (v * 100).toFixed(1) + '%' },
  { key: 'gb%', label: 'GB%', format: v => (v * 100).toFixed(1) + '%' },
];

export function StatsTable({ playerName, strikeCount, playerRates }: Props) {
  const cleanName = playerName.replace(/[LR]$/, '');

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col h-full"
      style={{ background: NAVY, border: '1px solid rgba(255,255,255,0.1)', minWidth: '160px' }}>

      {/* Header */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {strikeCount} Strikes
        </div>
        <div className="font-black text-white text-sm mt-0.5 leading-tight">{cleanName}</div>
      </div>

      {/* Stats */}
      <div className="flex-1 flex flex-col px-3 py-2 gap-2">
        {FIELDS.map((field, i) => {
          const val = playerRates ? (playerRates[field.key] as number) : null;
          return (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="flex justify-between items-center"
            >
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {field.label}
              </span>
              <span className="text-sm font-black" style={{ color: val !== null ? ORANGE : 'rgba(255,255,255,0.2)' }}>
                {val !== null ? field.format(val) : '—'}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
