import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'hero', label: 'Intro' },
  { id: 'intro', label: 'Yordan' },
  { id: 'scatter', label: 'Stats' },
  { id: 'radar', label: 'Profile' },
  { id: 'heatmaps', label: 'Zones' },
  { id: 'delta', label: 'Variance' },
  { id: 'correlation', label: 'League' },
  { id: 'sandbox', label: 'Explore' },
  { id: 'conclusion', label: 'Conclusion' },
];

export function NavDots() {
  const [active, setActive] = useState('hero');

  useEffect(() => {
    const observers = SECTIONS.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3" aria-label="Page sections">
      {SECTIONS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
          title={label}
          className="group relative flex items-center justify-end"
          aria-label={label}
        >
          <span className="absolute right-5 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold uppercase tracking-widest whitespace-nowrap bg-black/60 px-2 py-1 rounded">
            {label}
          </span>
          <span
            className="block rounded-full transition-all duration-300"
            style={{
              width: active === id ? '12px' : '8px',
              height: active === id ? '12px' : '8px',
              background: active === id ? '#EB6E1F' : 'rgba(255,255,255,0.4)',
              boxShadow: active === id ? '0 0 8px #EB6E1F' : 'none',
            }}
          />
        </button>
      ))}
    </nav>
  );
}
