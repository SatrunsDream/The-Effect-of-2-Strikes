import { motion } from 'framer-motion';
import { ContactScatter } from '../charts/ContactScatter';
import { useData } from '../../context/DataContext';
import { ORANGE } from '../../theme';

export function ContactScatterSection() {
  const data = useData();

  return (
    <section id="scatter" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-12">
        <div className="h-px flex-1 max-w-12" style={{ background: ORANGE }} />
        <span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: ORANGE }}>
          Two-Strike Performance
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-black uppercase text-white mb-5"
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2.4rem)', lineHeight: 1.1 }}>
            2-Strike <span style={{ color: ORANGE }}>Contact%</span><br />vs wOBA
          </h2>
          <p className="text-white/65 leading-relaxed text-sm font-medium">
            In two strikes, hitters are taught a "B swing" — shortening up to prevent a strikeout.
            While contact% may rise, wOBA tends to fall. Yordan's two-strike numbers tell a
            different story: he's making just as much contact as in zero strikes,
            and still ranking as one of the league's top hitters. So what is he doing differently?
          </p>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', minHeight: '380px' }}
        >
          {data ? (
            <ContactScatter data={data.contactScatter} leagueRates={data.leagueRates2} />
          ) : (
            <div className="flex items-center justify-center h-80 text-white/30 text-sm font-bold">Loading…</div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
