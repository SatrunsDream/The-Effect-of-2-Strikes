import { motion } from 'framer-motion';
import { ORANGE } from '../../theme';

const REFS = [
  { label: 'New Statcast Swing Metrics (2025)', href: 'https://www.mlb.com/news/new-statcast-swing-metrics-2025' },
  { label: 'Glossary: wOBA (weighted on-base average)', href: 'https://www.mlb.com/glossary/advanced-stats/weighted-on-base-average' },
  { label: 'Baseball Savant: Bat Tracking — Swing Path & Attack Angle', href: 'https://baseballsavant.mlb.com/leaderboard/bat-tracking/swing-path-attack-angle' },
  { label: 'pybaseball: Python Package for Baseball Data', href: 'https://pypi.org/project/pybaseball/' },
  { label: 'Baseball Savant: Documentation of the Data', href: 'https://baseballsavant.mlb.com/csv-docs' },
];

export function ConclusionSection() {
  return (
    <section id="conclusion" className="py-24 px-6 max-w-6xl mx-auto">
      {/* Divider */}
      <div className="flex items-center gap-4 mb-16">
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: ORANGE }} />
        <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Conclusion */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 max-w-12" style={{ background: ORANGE }} />
            <span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: ORANGE }}>Conclusion</span>
          </div>

          <p className="text-white/65 leading-relaxed text-sm font-medium">
            While the scatter plots suggest some correlation between changing swing mechanics and
            outcomes, the newly introduced swing angles offer a clearer picture: there isn't a
            one-size-fits-all solution for two-strike approaches. Different combinations of mechanical
            adjustments can benefit players in different ways.
          </p>
          <p className="text-white/65 leading-relaxed text-sm font-medium mt-4">
            Hitters who understand the geometry of their own swing could potentially tailor their
            adjustments to maintain performance in two strikes. Managers and coaches could use these
            angles to gain analytical insights into a player's tendencies — and even optimize lineup
            decisions.
          </p>
          <p className="text-white/65 leading-relaxed text-sm font-medium mt-4">
            It's important to recognize that these angles exist within a broader context. While new
            swing metrics can provide valuable insight, they should be used alongside other data to
            form a complete understanding of two-strike hitting.
          </p>

          {/* Key takeaways */}
          <div className="mt-8 space-y-3">
            {[
              'No one-size-fits-all solution for two-strike approaches',
              'Context matters — individual swing geometry drives success',
              'New Statcast angles provide clearer picture than traditional stats',
              'Coaches should customize based on individual player tendencies',
            ].map((point, i) => (
              <motion.div
                key={point}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i + 0.3 }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: `${ORANGE}25`, border: `1px solid ${ORANGE}60` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: ORANGE }} />
                </span>
                <span className="text-sm text-white/60 font-medium">{point}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* References */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 max-w-12" style={{ background: ORANGE }} />
            <span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: ORANGE }}>References</span>
          </div>

          <div className="space-y-3">
            {REFS.map((ref, i) => (
              <motion.a
                key={ref.href}
                href={ref.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i + 0.2 }}
                className="flex items-center gap-3 p-4 rounded-xl transition-all duration-200 group"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ORANGE}40`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
              >
                <span className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-black"
                  style={{ background: `${ORANGE}20`, color: ORANGE }}>
                  {i + 1}
                </span>
                <span className="text-sm font-medium transition-colors group-hover:text-white" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {ref.label}
                </span>
                <span className="ml-auto flex-shrink-0 text-white/20 group-hover:text-white/50 transition-colors">↗</span>
              </motion.a>
            ))}
          </div>

          {/* Footer credit */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
            className="mt-10 text-xs text-white/25 font-bold uppercase tracking-widest"
          >
            Data: MLB Statcast 2024 • Built with React + D3.js
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
