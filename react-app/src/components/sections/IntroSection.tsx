import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useData } from '../../context/DataContext';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { key: 'wOBA_percentile', label: 'wOBA', actualKey: 'wOBA', format: (v: number) => v.toFixed(3), color: '#EB6E1F' },
  { key: 'barrel%_percentile', label: 'Barrel%', actualKey: 'barrel%', format: (v: number) => (v * 100).toFixed(1) + '%', color: '#EB6E1F' },
  { key: 'HRs_percentile', label: 'Home Runs', actualKey: 'HRs', format: (v: number) => String(Math.round(v)), color: '#EB6E1F' },
  { key: 'EV90_percentile', label: 'EV90 (mph)', actualKey: 'EV90', format: (v: number) => v.toFixed(0), color: '#EB6E1F' },
];

export function IntroSection() {
  const data = useData();
  const sectionRef = useRef<HTMLElement>(null);
  const counterRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const yordan = data?.yordanSummary?.find(d => d.name_with_stand === 'Yordan AlvarezL');

  useEffect(() => {
    if (!yordan || !sectionRef.current) return;

    const triggers = STATS.map((stat, i) => {
      const el = counterRefs.current[i];
      if (!el) return null;
      const percentile = yordan[stat.key as keyof typeof yordan] as number;
      const obj = { val: 0 };

      return ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: percentile,
            duration: 1.4,
            ease: 'power2.out',
            onUpdate: () => { if (el) el.textContent = Math.round(obj.val) + 'th'; },
          });
        },
      });
    });

    return () => triggers.forEach(t => t?.kill());
  }, [yordan]);

  return (
    <section
      id="intro"
      ref={sectionRef}
      className="relative py-24 px-6 max-w-6xl mx-auto"
    >
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="h-px flex-1 max-w-12" style={{ background: '#EB6E1F' }} />
        <span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: '#EB6E1F' }}>
          The Player
        </span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <h2 className="font-black uppercase text-white mb-6" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
            Yordan<br />
            <span style={{ color: '#EB6E1F' }}>Alvarez</span>
          </h2>
          <p className="text-white/70 leading-relaxed text-base font-medium">
            In 2024, Yordan Alvarez, outfielder/designated hitter for the Houston Astros,
            was voted an All-Star starter as a DH and All-Star for his third consecutive year
            and finished top 10 in AL MVP voting. His stats on the year speak for themselves.
            This project investigates how he maintained such a successful season by looking at
            the quality of his contact, how he approached two-strike counts, and the geometry
            of his swing adjustments.
          </p>

          <div className="mt-6 flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
              2024 season • qualifying MLB hitters
            </span>
          </div>
        </motion.div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-4">
          {STATS.map((stat, i) => {
            const percentile = yordan ? (yordan[stat.key as keyof typeof yordan] as number) : 0;
            const actual = yordan ? (yordan[stat.actualKey as keyof typeof yordan] as number) : 0;

            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 + 0.2, ease: 'easeOut' }}
                className="relative rounded-2xl p-5 overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {/* Background arc */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <circle
                    cx="85" cy="85" r="60"
                    fill="none"
                    stroke={stat.color}
                    strokeWidth="0.5"
                    strokeOpacity="0.15"
                  />
                </svg>

                <div className="relative">
                  <div className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {stat.label}
                  </div>
                  <div className="font-black text-white text-2xl mb-1">
                    {stat.format(actual)}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span
                      ref={el => { counterRefs.current[i] = el; }}
                      className="font-black text-3xl"
                      style={{ color: stat.color }}
                    >
                      {Math.round(percentile)}th
                    </span>
                    <span className="text-xs text-white/40 font-bold">percentile</span>
                  </div>
                </div>

                {/* Progress bar */}
                <motion.div
                  className="mt-3 h-1 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: i * 0.1 + 0.4, ease: 'easeOut' }}
                    className="h-full rounded-full origin-left"
                    style={{ width: `${percentile}%`, background: `linear-gradient(90deg, ${stat.color}88, ${stat.color})` }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
