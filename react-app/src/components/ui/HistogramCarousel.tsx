import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DeltaHistogram } from '../charts/DeltaHistogram';
import type { DeltaAnglesPoint } from '../../types/data';
import { ORANGE } from '../../theme';

type Angle = 'attack_angle' | 'attack_direction' | 'swing_path_tilt';

const ANGLES: Angle[] = ['attack_angle', 'attack_direction', 'swing_path_tilt'];
const ANGLE_LABELS: Record<Angle, string> = {
  attack_angle: 'Attack Angle',
  attack_direction: 'Attack Direction',
  swing_path_tilt: 'Swing Path Tilt',
};

interface Props {
  data: DeltaAnglesPoint[];
}

export function HistogramCarousel({ data }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  function navigate(dir: 1 | -1) {
    setDirection(dir);
    setCurrent(i => (i + dir + ANGLES.length) % ANGLES.length);
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Tab indicators */}
      <div className="flex gap-2 justify-center">
        {ANGLES.map((a, i) => (
          <button
            key={a}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            className="text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full transition-all duration-200"
            style={{
              background: current === i ? ORANGE : 'rgba(255,255,255,0.06)',
              color: current === i ? '#fff' : 'rgba(255,255,255,0.4)',
            }}
          >
            {ANGLE_LABELS[a]}
          </button>
        ))}
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', minHeight: '300px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ x: direction * 100 + '%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -100 + '%', opacity: 0 }}
            transition={{ type: 'tween', duration: 0.4, ease: 'easeInOut' }}
            className="p-4"
          >
            <DeltaHistogram data={data} angle={ANGLES[current]} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <div className="flex items-center justify-center gap-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-200 hover:scale-110"
          style={{ background: 'rgba(235,110,31,0.15)', color: ORANGE, border: `1px solid ${ORANGE}40` }}
        >
          ◀
        </button>
        <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {current + 1} / {ANGLES.length}
        </span>
        <button
          onClick={() => navigate(1)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-200 hover:scale-110"
          style={{ background: 'rgba(235,110,31,0.15)', color: ORANGE, border: `1px solid ${ORANGE}40` }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
