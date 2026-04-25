import { motion } from 'framer-motion';
import { RadarChart } from '../charts/RadarChart';
import { useData } from '../../context/DataContext';
import { ORANGE } from '../../theme';

export function RadarSection() {
  const data = useData();

  return (
    <section id="radar" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-12">
        <div className="h-px flex-1 max-w-12" style={{ background: ORANGE }} />
        <span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: ORANGE }}>
          Yordan's Profile
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center"
        >
          <div className="rounded-2xl p-6 w-full" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {data ? (
              <RadarChart data={data.radar} animate />
            ) : (
              <div className="flex items-center justify-center h-80 text-white/30 text-sm font-bold">Loading…</div>
            )}
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="font-black uppercase text-white mb-5"
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2.4rem)', lineHeight: 1.1 }}>
            Yordan's <br /><span style={{ color: ORANGE }}>2-Strike Profile</span>
          </h2>
          <p className="text-white/65 leading-relaxed text-sm font-medium">
            Yordan's numbers compared to the rest of the league offer insight into how he survives
            two-strike counts. His high <strong className="text-white">chase%</strong> and{' '}
            <strong className="text-white">oppo%</strong> immediately stand out. While swinging out
            of the zone is typically negative, Yordan balances this by hitting the ball the other way —
            working against the right-side infield shift. He's still barreling the ball at a
            well-above-average rate in two strikes.
          </p>

          {/* Metric callouts */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { label: 'Chase%', desc: 'High, but managed via oppo hitting' },
              { label: 'Oppo%', desc: 'Opposite-field advantage vs shift' },
              { label: 'Barrel%', desc: 'Still elite power in two strikes' },
              { label: 'Contact%', desc: 'Near-identical to zero-strike counts' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="rounded-xl p-3"
                style={{ background: 'rgba(235,110,31,0.08)', border: '1px solid rgba(235,110,31,0.2)' }}
              >
                <div className="text-xs font-black uppercase tracking-widest" style={{ color: ORANGE }}>{item.label}</div>
                <div className="text-xs text-white/50 mt-0.5 font-medium">{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
