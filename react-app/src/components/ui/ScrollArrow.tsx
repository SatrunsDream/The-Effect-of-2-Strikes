import { motion } from 'framer-motion';

export function ScrollArrow() {
  const handleClick = () => {
    const intro = document.getElementById('intro');
    intro?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.button
      onClick={handleClick}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors cursor-pointer bg-transparent border-0"
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      aria-label="Scroll down"
    >
      <span className="text-xs uppercase tracking-widest font-bold">scroll</span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </motion.button>
  );
}
