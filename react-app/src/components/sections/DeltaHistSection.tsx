import { motion } from 'framer-motion';
import { HistogramCarousel } from '../ui/HistogramCarousel';
import { useData } from '../../context/DataContext';
import { ORANGE } from '../../theme';

export function DeltaHistSection() {
  const data = useData();

  return (
    <section id="delta" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 max-w-12" style={{ background: ORANGE }} />
        <span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: ORANGE }}>
          Swing Mechanics
        </span>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="font-black uppercase text-white mb-4"
        style={{ fontSize: 'clamp(1.4rem, 3vw, 2.4rem)', lineHeight: 1.1 }}
      >
        Changes in <span style={{ color: ORANGE }}>Swing Metrics</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-white/60 leading-relaxed text-sm font-medium max-w-3xl mb-12"
      >
        Baseball Savant recently released new metrics to characterize swing geometry:
        attack angle (°), attack direction (°), and swing path tilt (°).{' '}
        <a href="https://www.mlb.com/news/new-statcast-swing-metrics-2025" target="_blank" rel="noopener noreferrer"
          className="underline" style={{ color: ORANGE }}>
          Learn more.
        </a>{' '}
        These allow us to explore relationships between swing characteristics and batted-ball outcomes.
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-white/65 leading-relaxed text-sm font-medium">
            These histograms show how the variance in each swing angle changes across all hitters
            between zero-strike and two-strike counts. A higher variance indicates greater adjustment
            in that specific angle. Yordan ranks in the{' '}
            <strong className="text-white">96th percentile</strong> for attack angle variance —
            he's making significant swing adjustments to pitches on the outer-half of the zone.
          </p>
          <p className="text-white/65 leading-relaxed text-sm font-medium mt-4">
            The <span className="font-bold" style={{ color: '#E63946' }}>red line</span> highlights
            his percentile rank. Click the arrows to explore the distribution of each angle.
          </p>

          {/* Highlight card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6 rounded-2xl p-5"
            style={{ background: 'rgba(235,110,31,0.1)', border: '1px solid rgba(235,110,31,0.25)' }}
          >
            <div className="text-4xl font-black" style={{ color: ORANGE }}>96th</div>
            <div className="text-sm font-bold text-white mt-1">Percentile in Attack Angle Variance</div>
            <div className="text-xs text-white/50 mt-1">Across all qualifying MLB hitters in 2024</div>
          </motion.div>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          {data ? (
            <HistogramCarousel data={data.delta} />
          ) : (
            <div className="h-80 flex items-center justify-center text-white/30 text-sm font-bold">Loading…</div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
