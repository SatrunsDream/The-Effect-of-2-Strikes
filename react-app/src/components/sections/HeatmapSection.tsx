import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { KDEHeatmap } from '../charts/KDEHeatmap';
import { useData } from '../../context/DataContext';
import { ORANGE } from '../../theme';

gsap.registerPlugin(ScrollTrigger);

export function HeatmapSection() {
  const data = useData();
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!leftRef.current || !rightRef.current) return;

    // Start blurred and offset
    gsap.set(leftRef.current, { x: -60, opacity: 0, filter: 'blur(8px)' });
    gsap.set(rightRef.current, { x: 60, opacity: 0, filter: 'blur(8px)' });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: leftRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    tl.to([leftRef.current, rightRef.current], {
      x: 0, opacity: 1, filter: 'blur(0px)',
      duration: 1.0, ease: 'power2.out', stagger: 0.15,
    });

    return () => { tl.kill(); };
  }, [data]);

  return (
    <section id="heatmaps" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-12">
        <div className="h-px flex-1 max-w-12" style={{ background: ORANGE }} />
        <span className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: ORANGE }}>
          Contact Zones
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
            Contact%<br /><span style={{ color: ORANGE }}>Between Counts</span>
          </h2>
          <p className="text-white/65 leading-relaxed text-sm font-medium">
            The side-by-side strike zone heatmaps reveal a significant difference in Yordan's
            contact profile from zero strikes to two strikes. With no strikes, he focuses on
            contact inside and over the heart of the plate. With two strikes, he expands the zone
            and makes contact mostly <strong className="text-white">away from him</strong>. This shows
            his ability to adjust while maintaining contact quality outside his "comfort zone."
          </p>

          <div className="mt-6 flex gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#ff0000' }} />
              <span className="text-xs text-white/50 font-bold">Strike Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: '#2166ac' }} />
              <span className="text-xs text-white/50 font-bold">High Density</span>
            </div>
          </div>
        </motion.div>

        {/* Heatmaps */}
        <div className="flex gap-6 justify-center flex-wrap">
          <div ref={leftRef} className="flex flex-col items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
              0 Strikes
            </span>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', width: '240px' }}>
              {data && <KDEHeatmap data={data.kde} strikeCount={0} title="0-Strike Contact Density" />}
            </div>
          </div>

          <div ref={rightRef} className="flex flex-col items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: ORANGE }}>
              2 Strikes
            </span>
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(235,110,31,0.2)', width: '240px' }}>
              {data && <KDEHeatmap data={data.kde} strikeCount={2} title="2-Strike Contact Density" />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
